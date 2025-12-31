import { Token } from "../data/tokenTypes";

export interface CurveSnapshot {
  progress: number;        // bonding progress 0–100
  marketCap: number;
  timestamp: number;
}

export interface CurvePrediction {
  velocity: number;        // % per minute
  acceleration: number;    // change in velocity
  etaMinutes: number | null;
  confidence: number;      // 0–100
  recommendation: "BUY_NOW" | "WAIT" | "MONITOR" | "AVOID";
  riskLevel: "low" | "medium" | "high";
}

// Flexible token input type for backwards compatibility
interface TokenInput {
  mint: string;
  bonding?: {
    progress?: number;
    bondingProgress?: number;
  };
  marketCap?: number;
}

export class BondingCurvePredictor {
  private history: Record<string, CurveSnapshot[]> = {};

  addSnapshot(token: TokenInput | Token) {
    if (!this.history[token.mint]) {
      this.history[token.mint] = [];
    }
    const list = this.history[token.mint];

    // Handle both old and new token formats
    let progress = 0;
    let marketCap = 0;
    
    if ('market' in token) {
      // New Token format
      progress = token.bonding?.bondingProgress ?? 0;
      marketCap = token.market?.marketCap ?? 0;
    } else {
      // Old format or TokenInput
      progress = token.bonding?.progress ?? token.bonding?.bondingProgress ?? 0;
      marketCap = token.marketCap ?? 0;
    }

    list.push({
      progress,
      marketCap,
      timestamp: Date.now(),
    });

    if (list.length > 100) {
      list.shift(); // keep memory small
    }
  }

  predict(tokenMint: string): CurvePrediction | null {
    const list = this.history[tokenMint];
    if (!list || list.length < 3) return null;

    const recent = list.slice(-3);
    const [a, b, c] = recent;

    const dt1 = (b.timestamp - a.timestamp) / 60000;
    const dt2 = (c.timestamp - b.timestamp) / 60000;

    if (dt1 <= 0 || dt2 <= 0) return null;

    const v1 = (b.progress - a.progress) / dt1;
    const v2 = (c.progress - b.progress) / dt2;

    const velocity = v2;
    const acceleration = v2 - v1;

    let eta: number | null = null;
    if (velocity > 0) {
      const remaining = 99 - c.progress;
      eta = remaining / velocity;
      if (eta < 0) eta = null;
    }

    let confidence = 50;
    if (Math.abs(acceleration) < 0.1) confidence += 20;
    if (velocity > 0.5) confidence += 20;
    if (velocity > 1.0) confidence += 30;
    if (confidence > 100) confidence = 100;

    let recommendation: CurvePrediction["recommendation"] = "MONITOR";
    if (velocity > 1.0 && c.progress >= 95) recommendation = "BUY_NOW";
    else if (velocity > 0.3 && c.progress >= 90) recommendation = "WAIT";
    else recommendation = "MONITOR";

    let riskLevel: CurvePrediction["riskLevel"] = "medium";
    if (c.marketCap < 30000) riskLevel = "high";
    if (c.marketCap > 80000) riskLevel = "low";

    return {
      velocity,
      acceleration,
      etaMinutes: eta ? Math.round(eta) : null,
      confidence,
      recommendation,
      riskLevel,
    };
  }
}
