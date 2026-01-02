export type CurveStage = "new" | "about_to_graduate" | "graduated";
export type RiskLevel = "SAFE" | "CAUTION" | "BAD";

export type TokenCard = {
  id: string;
  ca: string;
  name: string;
  symbol: string;
  image?: string;

  stage: CurveStage;

  createdAtSec: number;
  ageSec: number;

  mcUsd?: number;
  liqUsd?: number;
  volUsd?: number;

  holders?: number;
  topHolderPct?: number;

  mintRevoked?: boolean;
  freezeRevoked?: boolean;

  risk: RiskLevel;
  riskNotes: string[];

  curveProgress?: number;
  lpCreated?: boolean;
};
