import { useEffect, useMemo, useState } from "react";
import type { TokenCard, CurveStage } from "../types/trenches";
import { upsertIntoRows, type TokenRows } from "../state/trenchesStore";
import { ws } from "../services/websocket";

type MintEvent = {
  mint: string;
  name?: string;
  symbol?: string;
  image?: string;
  timestamp?: number;
  holders?: number;
  topHolderPct?: number;
  mintAuthorityRevoked?: boolean;
  freezeAuthorityRevoked?: boolean;
  marketCapUsd?: number;
  liquidityUsd?: number;
  volumeUsd?: number;
};

type TokenStageEvent = {
  type: "TOKEN_STAGE";
  mint: string;
  stage: CurveStage;
  progress?: number;
  lpCreated?: boolean;
  ts?: number;
};

type TokenNewEvent = { type: "TOKEN_NEW"; mint: string; ts?: number; data?: Partial<MintEvent> };
type TokenUpdateEvent = { type: "TOKEN_UPDATE"; mint: string; ts?: number; data?: Partial<MintEvent> };
type AnyEvent = TokenStageEvent | TokenNewEvent | TokenUpdateEvent | { type: string; [k: string]: any };

const nowSec = () => Math.floor(Date.now() / 1000);

function mintEventToToken(m: MintEvent): TokenCard {
  const createdAtSec = m.timestamp ?? nowSec();
  const mintRevoked = !!m.mintAuthorityRevoked;
  const freezeRevoked = !!m.freezeAuthorityRevoked;

  const risk = (mintRevoked && freezeRevoked) ? "SAFE" : "CAUTION";
  const riskNotes = [
    ...(mintRevoked ? [] : ["MINT_AUTH_NOT_REVOKED"]),
    ...(freezeRevoked ? [] : ["FREEZE_AUTH_NOT_REVOKED"]),
  ];

  return {
    id: m.mint,
    ca: m.mint,
    name: m.name || "Unknown",
    symbol: m.symbol || "",
    image: m.image,

    stage: "new",
    createdAtSec,
    ageSec: Math.max(0, nowSec() - createdAtSec),

    mcUsd: m.marketCapUsd,
    liqUsd: m.liquidityUsd,
    volUsd: m.volumeUsd,

    holders: m.holders,
    topHolderPct: m.topHolderPct,

    mintRevoked,
    freezeRevoked,

    risk,
    riskNotes,
  };
}

export function useTrenchesFeed() {
  const [rows, setRows] = useState<TokenRows>({ row1: [], row2: [], row3: [] });
  const [byMint, setByMint] = useState<Record<string, TokenCard>>({});

  useEffect(() => {
    const unsub = ws.subscribe("/ws/trenches", (raw: AnyEvent) => {
      const mint = raw.mint;
      if (!mint) return;

      setByMint((prev) => {
        const cur = prev[mint];
        let next: TokenCard | undefined = cur;

        if (raw.type === "TOKEN_NEW") {
          next = mintEventToToken({ mint, ...(raw.data ?? {}), timestamp: raw.ts ?? raw.data?.timestamp });
        }

        if (raw.type === "TOKEN_UPDATE" && cur) {
          next = { ...cur, ...(raw.data ?? {}), ageSec: Math.max(0, nowSec() - cur.createdAtSec) };
        }

        if (raw.type === "TOKEN_STAGE") {
          next = {
            ...(cur ?? mintEventToToken({ mint })),
            stage: raw.stage,
            curveProgress: raw.progress,
            lpCreated: raw.lpCreated,
          };
        }

        if (!next) return prev;

        setRows((r) => upsertIntoRows(r, next!));
        return { ...prev, [mint]: next! };
      });
    });

    return () => { unsub?.() };
  }, []);

  const flat = useMemo(() => Object.values(byMint), [byMint]);
  return { rows, flat };
}
