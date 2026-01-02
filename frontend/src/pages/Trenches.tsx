import React from "react";
import { useTrenchesFeed } from "../hooks/useTrenchesFeed";

function Col({ title, items, onSelect }: any) {
  return (
    <div style={{ flex: 1, padding: 12 }}>
      <div style={{ fontWeight: 900, marginBottom: 10 }}>{title}</div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {items.map((t: any) => (
          <button
            key={t.ca}
            onClick={() => onSelect(t)}
            title={t.ca}
            style={{
              textAlign: "left",
              padding: 12,
              borderRadius: 14,
              border: "1px solid rgba(255,255,255,0.12)",
              background: "rgba(0,0,0,0.35)",
              cursor: "pointer",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
              <div style={{ fontWeight: 900 }}>
                {t.name} <span style={{ opacity: 0.7 }}>{t.symbol}</span>
              </div>
              <div style={{ fontWeight: 900 }}>{t.risk}</div>
            </div>

            <div style={{ marginTop: 8, display: "flex", gap: 10, flexWrap: "wrap", opacity: 0.9 }}>
              <span>{t.ageSec}s</span>
              <span>MC {t.mcUsd ? `$${Math.round(t.mcUsd).toLocaleString()}` : "—"}</span>
              <span>Liq {t.liqUsd ? `$${Math.round(t.liqUsd).toLocaleString()}` : "—"}</span>
              <span>Curve {t.curveProgress != null ? `${Math.round(t.curveProgress * 100)}%` : "—"}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

export default function Trenches({ onOpenKillShot }: { onOpenKillShot: (mint: string) => void }) {
  const { rows } = useTrenchesFeed();

  return (
    <div style={{ display: "flex", gap: 12, padding: 12 }}>
      <Col title="New Creations" items={rows.row1} onSelect={(t: any) => onOpenKillShot(t.ca)} />
      <Col title="About to Graduate" items={rows.row2} onSelect={(t: any) => onOpenKillShot(t.ca)} />
      <Col title="Graduated" items={rows.row3} onSelect={(t: any) => onOpenKillShot(t.ca)} />
    </div>
  );
}
