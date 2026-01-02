import type { TokenCard, CurveStage } from "../types/trenches";

export type TokenRows = { row1: TokenCard[]; row2: TokenCard[]; row3: TokenCard[] };

function rowForStage(stage: CurveStage): 1 | 2 | 3 {
  if (stage === "new") return 1;
  if (stage === "about_to_graduate") return 2;
  return 3;
}

function upsert(list: TokenCard[], t: TokenCard, max = 80) {
  const idx = list.findIndex(x => x.ca === t.ca);
  const next = idx === -1 ? [t, ...list] : [t, ...list.filter((_, i) => i !== idx)];
  return next.slice(0, max);
}

function remove(list: TokenCard[], ca: string) {
  return list.filter(x => x.ca !== ca);
}

export function upsertIntoRows(rows: TokenRows, t: TokenCard): TokenRows {
  const r1 = remove(rows.row1, t.ca);
  const r2 = remove(rows.row2, t.ca);
  const r3 = remove(rows.row3, t.ca);

  const row = rowForStage(t.stage);
  if (row === 1) return { row1: upsert(r1, t), row2: r2, row3: r3 };
  if (row === 2) return { row1: r1, row2: upsert(r2, t), row3: r3 };
  return { row1: r1, row2: r2, row3: upsert(r3, t) };
}
