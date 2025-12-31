/**
 * Curve Edge Sniper
 * 
 * Monitors bonding curve tokens approaching graduation (100% progress)
 * and executes precision snipes right before Raydium migration
 * 
 * Strategy: Buy tokens at 95-99% curve completion, sell immediately after migration
 * Edge: Capitalize on migration liquidity boost and early Raydium listing
 */

import { Connection, PublicKey } from '@solana/web3.js';
import type { SolanaTokenInfo } from '../types/solana';
import type { CurvePrediction } from './bondingCurvePredictor';

// =============================================
// TYPES
// =============================================

export interface CurveEdgeConfig {
  /** Minimum bonding progress to start monitoring (default: 95%) */
  minProgress: number;
  
  /** Maximum bonding progress to snipe at (default: 99%) */
  maxProgress: number;
  
  /** SOL amount to snipe with */
  snipeAmount: number;
  
  /** Enable auto-execution */
  autoExecute: boolean;
  
  /** Minimum liquidity required (SOL) */
  minLiquidity: number;
  
  /** Maximum slippage tolerance (bps, 100 = 1%) */
  maxSlippage: number;
  
  /** Use Jito MEV protection */
  useJito: boolean;
  
  /** Jito tip amount (SOL) */
  jitoTip: number;
  
  /** Stop loss percentage (default: 20%) */
  stopLoss: number;
  
  /** Take profit percentage (default: 50%) */
  takeProfit: number;
}

export interface SnipeOpportunity {
  /** Token mint address */
  tokenMint: string;
  
  /** Token symbol */
  symbol: string;
  
  /** Token name */
  name: string;
  
  /** Current bonding progress (0-100) */
  bondingProgress: number;
  
  /** Estimated time to graduation (seconds) */
  estimatedGradTime: number;
  
  /** Current market cap */
  marketCap: number;
  
  /** Current liquidity (SOL) */
  liquidity: number;
  
  /** Current price */
  price: number;
  
  /** Velocity score (0-100, higher = faster graduation) */
  velocity: number;
  
  /** Risk score (0-100, lower = safer) */
  risk: number;
  
  /** Recommended action */
  action: 'WAIT' | 'MONITOR' | 'SNIPE_NOW' | 'TOO_LATE';
  
  /** Timestamp when detected */
  detectedAt: number;
}

export interface SnipeExecution {
  /** Unique execution ID */
  id: string;
  
  /** Token being sniped */
  tokenMint: string;
  
  /** Token symbol */
  symbol: string;
  
  /** SOL amount used */
  solAmount: number;
  
  /** Entry price */
  entryPrice: number;
  
  /** Entry transaction signature */
  entryTx: string;
  
  /** Current price */
  currentPrice: number;
  
  /** Profit/loss (SOL) */
  pnl: number;
  
  /** Profit/loss percentage */
  pnlPercent: number;
  
  /** Execution status */
  status: 'PENDING' | 'SNIPED' | 'MONITORING' | 'SOLD' | 'FAILED';
  
  /** Stop loss triggered */
  stopLossTriggered: boolean;
  
  /** Take profit triggered */
  takeProfitTriggered: boolean;
  
  /** Entry timestamp */
  entryTime: number;
  
  /** Exit timestamp (if sold) */
  exitTime?: number;
  
  /** Exit transaction signature */
  exitTx?: string;
}

export interface CurveEdgeStats {
  /** Total opportunities detected */
  totalOpportunities: number;
  
  /** Total snipes executed */
  totalSnipes: number;
  
  /** Successful snipes (profitable) */
  successfulSnipes: number;
  
  /** Failed snipes (unprofitable) */
  failedSnipes: number;
  
  /** Win rate percentage */
  winRate: number;
  
  /** Total profit/loss (SOL) */
  totalPnL: number;
  
  /** Average profit per snipe (SOL) */
  avgProfit: number;
  
  /** Largest win (SOL) */
  largestWin: number;
  
  /** Largest loss (SOL) */
  largestLoss: number;
  
  /** Active positions */
  activePositions: number;
}

// =============================================
// DEFAULT CONFIG
// =============================================

export const DEFAULT_CURVE_EDGE_CONFIG: CurveEdgeConfig = {
  minProgress: 95,
  maxProgress: 99,
  snipeAmount: 0.5,
  autoExecute: false,
  minLiquidity: 10,
  maxSlippage: 500, // 5%
  useJito: true,
  jitoTip: 0.001,
  stopLoss: 20,
  takeProfit: 50,
};

// =============================================
// UTILITY FUNCTIONS
// =============================================

/**
 * Calculate snipe score (0-100) for a curve prediction
 * Higher score = better snipe opportunity
 * 
 * Scoring breakdown:
 * - High velocity (>1.0%/min): +20 points
 * - Positive acceleration: +20 points
 * - Progress >= 96%: +20 points
 * - ETA <= 5 minutes: +20 points
 * - Confidence > 70%: +20 points
 */
export function getSnipeScore(prediction: CurvePrediction): number {
  let score = 0;

  // High velocity (+20)
  if (prediction.velocity > 1.0) {
    score += 20;
  } else if (prediction.velocity > 0.5) {
    score += 10;
  }

  // Positive acceleration (+20)
  if (prediction.acceleration > 0.1) {
    score += 20;
  } else if (prediction.acceleration > 0) {
    score += 10;
  }

  // High progress - assume we can derive from recommendation
  // BUY_NOW typically means >= 95% progress
  if (prediction.recommendation === 'BUY_NOW') {
    score += 20;
  } else if (prediction.recommendation === 'WAIT') {
    score += 10;
  }

  // Short ETA (+20)
  if (prediction.etaMinutes !== null && prediction.etaMinutes <= 5) {
    score += 20;
  } else if (prediction.etaMinutes !== null && prediction.etaMinutes <= 10) {
    score += 10;
  }

  // High confidence (+20)
  if (prediction.confidence > 70) {
    score += 20;
  } else if (prediction.confidence > 50) {
    score += 10;
  }

  return Math.min(score, 100);
}

// =============================================
// CURVE EDGE SNIPER CLASS
// =============================================

export class CurveEdgeSniper {
  private connection: Connection;
  private config: CurveEdgeConfig;
  private opportunities: Map<string, SnipeOpportunity> = new Map();
  private executions: Map<string, SnipeExecution> = new Map();
  private isMonitoring: boolean = false;
  private monitorInterval: NodeJS.Timeout | null = null;
  
  constructor(connection: Connection, config: Partial<CurveEdgeConfig> = {}) {
    this.connection = connection;
    this.config = { ...DEFAULT_CURVE_EDGE_CONFIG, ...config };
  }

  // =============================================
  // MONITORING
  // =============================================

  /**
   * Start monitoring for curve edge opportunities
   */
  startMonitoring(intervalMs: number = 5000): void {
    if (this.isMonitoring) {
      console.warn('⚠️ Curve edge sniper already monitoring');
      return;
    }

    this.isMonitoring = true;
    console.log('🎯 Curve edge sniper started - scanning for graduation opportunities...');

    // Initial scan
    this.scanForOpportunities();

    // Set up interval
    this.monitorInterval = setInterval(() => {
      this.scanForOpportunities();
      this.monitorActivePositions();
    }, intervalMs);
  }

  /**
   * Stop monitoring
   */
  stopMonitoring(): void {
    if (!this.isMonitoring) return;

    this.isMonitoring = false;
    if (this.monitorInterval) {
      clearInterval(this.monitorInterval);
      this.monitorInterval = null;
    }

    console.log('🛑 Curve edge sniper stopped');
  }

  /**
   * Scan for new opportunities
   */
  private async scanForOpportunities(): Promise<void> {
    try {
      // TODO: Integrate with live feed to get tokens near graduation
      // For now, using mock data
      const nearGraduationTokens = await this.fetchNearGraduationTokens();

      for (const token of nearGraduationTokens) {
        const opportunity = this.analyzeToken(token);
        
        if (opportunity) {
          this.opportunities.set(token.mintAddress, opportunity);
          
          // Auto-execute if enabled and conditions met
          if (this.config.autoExecute && opportunity.action === 'SNIPE_NOW') {
            await this.executeSnipe(opportunity);
          }
        }
      }

      // Clean up old opportunities (>5 minutes)
      const now = Date.now();
      for (const [mint, opp] of this.opportunities.entries()) {
        if (now - opp.detectedAt > 300000) {
          this.opportunities.delete(mint);
        }
      }
    } catch (error) {
      console.error('❌ Error scanning for opportunities:', error);
    }
  }

  /**
   * Fetch tokens near graduation
   */
  private async fetchNearGraduationTokens(): Promise<SolanaTokenInfo[]> {
    // TODO: Replace with real API call to your backend
    // This would fetch tokens with bondingProgress >= minProgress
    
    // Mock data for development
    return [];
  }

  /**
   * Analyze token for snipe opportunity
   */
  private analyzeToken(token: SolanaTokenInfo): SnipeOpportunity | null {
    const progress = this.calculateBondingProgress(token);
    
    // Check if within target range
    if (progress < this.config.minProgress || progress > this.config.maxProgress) {
      return null;
    }

    // Calculate velocity (how fast it's approaching 100%)
    const velocity = this.calculateVelocity(token);
    
    // Calculate risk score
    const risk = this.calculateRiskScore(token);
    
    // Estimate time to graduation
    const estimatedGradTime = this.estimateGraduationTime(progress, velocity);
    
    // Determine action
    let action: SnipeOpportunity['action'] = 'WAIT';
    
    if (progress >= 99) {
      action = 'TOO_LATE';
    } else if (progress >= 97 && velocity > 50 && risk < 40) {
      action = 'SNIPE_NOW';
    } else if (progress >= 95 && velocity > 30) {
      action = 'MONITOR';
    }

    return {
      tokenMint: token.mintAddress,
      symbol: token.symbol,
      name: token.name,
      bondingProgress: progress,
      estimatedGradTime,
      marketCap: token.totalSupply ? parseFloat(token.totalSupply) * 0.0001 : 0,
      liquidity: 0, // TODO: Get from liquidity analyzer
      price: 0.0001,
      velocity,
      risk,
      action,
      detectedAt: Date.now(),
    };
  }

  /**
   * Calculate bonding curve progress
   */
  private calculateBondingProgress(token: SolanaTokenInfo): number {
    // TODO: Integrate with bonding analyzer
    // For now, return mock value based on age
    const ageHours = token.age / 3600;
    return Math.min(95 + (ageHours * 2), 99.5);
  }

  /**
   * Calculate velocity score
   */
  private calculateVelocity(token: SolanaTokenInfo): number {
    // TODO: Calculate based on recent progress changes
    // Higher score = faster graduation
    const ageHours = token.age / 3600;
    return Math.min((100 / ageHours) * 10, 100);
  }

  /**
   * Calculate risk score
   */
  private calculateRiskScore(token: SolanaTokenInfo): number {
    let risk = 0;

    // Authority risks
    if (token.mintAuthority) risk += 30;
    if (token.freezeAuthority) risk += 30;

    // Liquidity risk
    if (!token.liquidityLocked) risk += 20;

    // Age risk (too new = risky)
    if (token.age < 300) risk += 20;

    return Math.min(risk, 100);
  }

  /**
   * Estimate time to graduation
   */
  private estimateGraduationTime(progress: number, velocity: number): number {
    if (velocity === 0) return Infinity;
    
    const remaining = 100 - progress;
    const secondsPerPercent = 60 / (velocity / 100); // Assuming velocity is % per minute
    
    return remaining * secondsPerPercent;
  }

  // =============================================
  // EXECUTION
  // =============================================

  /**
   * Execute snipe on opportunity
   */
  async executeSnipe(opportunity: SnipeOpportunity): Promise<SnipeExecution | null> {
    try {
      console.log(`🎯 EXECUTING SNIPE: ${opportunity.symbol} @ ${opportunity.bondingProgress.toFixed(2)}%`);

      // Check if already sniped
      if (this.executions.has(opportunity.tokenMint)) {
        console.warn('⚠️ Already have position in this token');
        return null;
      }

      // TODO: Execute actual swap via Jupiter/Jito
      // For now, create mock execution
      const execution: SnipeExecution = {
        id: `snipe_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        tokenMint: opportunity.tokenMint,
        symbol: opportunity.symbol,
        solAmount: this.config.snipeAmount,
        entryPrice: opportunity.price,
        entryTx: 'mock_tx_signature',
        currentPrice: opportunity.price,
        pnl: 0,
        pnlPercent: 0,
        status: 'SNIPED',
        stopLossTriggered: false,
        takeProfitTriggered: false,
        entryTime: Date.now(),
      };

      this.executions.set(opportunity.tokenMint, execution);
      
      console.log(`✅ SNIPE EXECUTED: ${execution.id}`);
      console.log(`   Token: ${opportunity.symbol}`);
      console.log(`   Amount: ${this.config.snipeAmount} SOL`);
      console.log(`   Entry Price: $${opportunity.price.toFixed(8)}`);

      return execution;
    } catch (error) {
      console.error('❌ Snipe execution failed:', error);
      return null;
    }
  }

  /**
   * Monitor active positions for stop loss / take profit
   */
  private async monitorActivePositions(): Promise<void> {
    for (const [mint, execution] of this.executions.entries()) {
      if (execution.status !== 'SNIPED' && execution.status !== 'MONITORING') {
        continue;
      }

      // TODO: Fetch current price from API
      const currentPrice = execution.entryPrice * (1 + (Math.random() - 0.4) * 0.3);
      
      // Update execution
      execution.currentPrice = currentPrice;
      execution.pnl = (currentPrice - execution.entryPrice) * (execution.solAmount / execution.entryPrice);
      execution.pnlPercent = ((currentPrice - execution.entryPrice) / execution.entryPrice) * 100;

      // Check stop loss
      if (execution.pnlPercent <= -this.config.stopLoss) {
        console.log(`🛑 STOP LOSS TRIGGERED: ${execution.symbol} @ ${execution.pnlPercent.toFixed(2)}%`);
        await this.exitPosition(execution, 'STOP_LOSS');
        continue;
      }

      // Check take profit
      if (execution.pnlPercent >= this.config.takeProfit) {
        console.log(`💰 TAKE PROFIT TRIGGERED: ${execution.symbol} @ ${execution.pnlPercent.toFixed(2)}%`);
        await this.exitPosition(execution, 'TAKE_PROFIT');
        continue;
      }

      execution.status = 'MONITORING';
    }
  }

  /**
   * Exit position (sell)
   */
  private async exitPosition(execution: SnipeExecution, reason: 'STOP_LOSS' | 'TAKE_PROFIT' | 'MANUAL'): Promise<void> {
    try {
      console.log(`📤 EXITING POSITION: ${execution.symbol} - Reason: ${reason}`);

      // TODO: Execute actual sell via Jupiter/Jito
      
      execution.status = 'SOLD';
      execution.exitTime = Date.now();
      execution.exitTx = 'mock_exit_tx';
      execution.stopLossTriggered = reason === 'STOP_LOSS';
      execution.takeProfitTriggered = reason === 'TAKE_PROFIT';

      console.log(`✅ EXIT COMPLETE: ${execution.symbol}`);
      console.log(`   PnL: ${execution.pnl.toFixed(4)} SOL (${execution.pnlPercent.toFixed(2)}%)`);
      console.log(`   Duration: ${((execution.exitTime - execution.entryTime) / 1000).toFixed(0)}s`);
    } catch (error) {
      console.error('❌ Exit failed:', error);
      execution.status = 'FAILED';
    }
  }

  // =============================================
  // GETTERS
  // =============================================

  getOpportunities(): SnipeOpportunity[] {
    return Array.from(this.opportunities.values())
      .sort((a, b) => b.velocity - a.velocity);
  }

  getActiveExecutions(): SnipeExecution[] {
    return Array.from(this.executions.values())
      .filter(e => e.status === 'SNIPED' || e.status === 'MONITORING');
  }

  getAllExecutions(): SnipeExecution[] {
    return Array.from(this.executions.values());
  }

  getStats(): CurveEdgeStats {
    const executions = Array.from(this.executions.values());
    const completed = executions.filter(e => e.status === 'SOLD');
    const successful = completed.filter(e => e.pnl > 0);
    const failed = completed.filter(e => e.pnl <= 0);

    return {
      totalOpportunities: this.opportunities.size,
      totalSnipes: executions.length,
      successfulSnipes: successful.length,
      failedSnipes: failed.length,
      winRate: completed.length > 0 ? (successful.length / completed.length) * 100 : 0,
      totalPnL: completed.reduce((sum, e) => sum + e.pnl, 0),
      avgProfit: completed.length > 0 ? completed.reduce((sum, e) => sum + e.pnl, 0) / completed.length : 0,
      largestWin: completed.length > 0 ? Math.max(...completed.map(e => e.pnl)) : 0,
      largestLoss: completed.length > 0 ? Math.min(...completed.map(e => e.pnl)) : 0,
      activePositions: this.getActiveExecutions().length,
    };
  }

  // =============================================
  // CONFIG
  // =============================================

  updateConfig(config: Partial<CurveEdgeConfig>): void {
    this.config = { ...this.config, ...config };
    console.log('⚙️ Curve edge config updated:', this.config);
  }

  getConfig(): CurveEdgeConfig {
    return { ...this.config };
  }
}

// =============================================
// EXPORTS
// =============================================

export default CurveEdgeSniper;
