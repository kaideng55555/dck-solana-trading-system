/**
 * Token Status Utilities
 * Security and migration checks for Solana tokens
 * Currently uses mock logic - ready for Solana RPC integration
 */

export interface TokenStatusResult {
  migrated: boolean;
  lpBurned: boolean;
  mintAuthDisabled: boolean;
  freezeDisabled: boolean;
  warnings: string[];
  riskScore: number; // 0-100, higher = more risky
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export interface TokenMintInfo {
  mintAddress: string;
  supply?: string;
  decimals?: number;
  mintAuthority?: string | null;
  freezeAuthority?: string | null;
}

export interface LiquidityPoolInfo {
  poolAddress: string;
  lpSupply?: string;
  lpBurned?: boolean;
  lpLocked?: boolean;
}

/**
 * Check if token has migrated from bonding curve to Raydium
 * Mock: Returns true if bondingProgress >= 100 or marketCap > 69000
 */
export async function checkMigrationStatus(
  mintAddress: string,
  bondingProgress?: number,
  marketCap?: number
): Promise<boolean> {
  // Mock logic - simulate API delay
  await new Promise(resolve => setTimeout(resolve, 50));

  // Check if token has graduated based on bonding curve completion
  if (bondingProgress !== undefined && bondingProgress >= 100) {
    return true;
  }

  // Check if market cap suggests migration (69k SOL typical threshold)
  if (marketCap !== undefined && marketCap > 69000) {
    return true;
  }

  // Random mock for testing (30% chance if no data provided)
  if (bondingProgress === undefined && marketCap === undefined) {
    return Math.random() > 0.7;
  }

  return false;
}

/**
 * Check if LP tokens are burned (rug-pull protection)
 * Mock: Returns true if age > 1 hour and random chance
 */
export async function checkLPBurned(
  poolAddress: string,
  tokenAge?: number
): Promise<boolean> {
  // Mock logic - simulate API delay
  await new Promise(resolve => setTimeout(resolve, 50));

  // Newer tokens typically don't have LP burned yet
  if (tokenAge !== undefined && tokenAge < 3600) {
    return false;
  }

  // Mock: 60% chance LP is burned for older tokens
  return Math.random() > 0.4;

  // TODO: Real implementation
  // const connection = new Connection(RPC_ENDPOINT);
  // const poolInfo = await connection.getAccountInfo(new PublicKey(poolAddress));
  // Check if LP tokens sent to burn address or locked
  // Burn address: 1nc1nerator11111111111111111111111111111111
}

/**
 * Check if mint authority is disabled (no more tokens can be minted)
 * Mock: Returns true 70% of time for established tokens
 */
export async function checkMintAuthority(
  mintAddress: string,
  tokenAge?: number
): Promise<boolean> {
  // Mock logic - simulate API delay
  await new Promise(resolve => setTimeout(resolve, 50));

  // Very new tokens often still have mint authority
  if (tokenAge !== undefined && tokenAge < 300) {
    return Math.random() > 0.8; // 20% chance disabled
  }

  // Established tokens more likely to have it disabled
  if (tokenAge !== undefined && tokenAge > 86400) {
    return Math.random() > 0.2; // 80% chance disabled
  }

  // Mock: 70% chance disabled for medium-age tokens
  return Math.random() > 0.3;

  // TODO: Real implementation
  // const connection = new Connection(RPC_ENDPOINT);
  // const mintInfo = await connection.getParsedAccountInfo(new PublicKey(mintAddress));
  // const data = mintInfo.value?.data;
  // if (data && 'parsed' in data) {
  //   return data.parsed.info.mintAuthority === null;
  // }
  // return false;
}

/**
 * Check if freeze authority is disabled (accounts can't be frozen)
 * Mock: Returns true 80% of time
 */
export async function checkFreezeAuthority(
  mintAddress: string,
  tokenAge?: number
): Promise<boolean> {
  // Mock logic - simulate API delay
  await new Promise(resolve => setTimeout(resolve, 50));

  // New tokens sometimes keep freeze authority
  if (tokenAge !== undefined && tokenAge < 600) {
    return Math.random() > 0.5; // 50% chance disabled
  }

  // Mock: 80% chance disabled for established tokens
  return Math.random() > 0.2;

  // TODO: Real implementation
  // Same as mint authority check but for freezeAuthority field
}

/**
 * Calculate risk score based on token status
 */
function calculateRiskScore(status: Omit<TokenStatusResult, 'riskScore' | 'riskLevel'>): number {
  let score = 0;

  // Mint authority still active = HIGH RISK
  if (!status.mintAuthDisabled) {
    score += 40;
  }

  // Freeze authority still active = HIGH RISK
  if (!status.freezeDisabled) {
    score += 40;
  }

  // LP not burned = MEDIUM RISK
  if (!status.lpBurned && status.migrated) {
    score += 20;
  }

  // Migration status affects risk
  if (!status.migrated) {
    score += 10; // Pre-migration = slight risk
  }

  return Math.min(score, 100);
}

/**
 * Determine risk level from score
 */
function getRiskLevel(score: number): TokenStatusResult['riskLevel'] {
  if (score >= 80) return 'CRITICAL';
  if (score >= 50) return 'HIGH';
  if (score >= 25) return 'MEDIUM';
  return 'LOW';
}

/**
 * Generate warnings based on status
 */
function generateWarnings(status: Omit<TokenStatusResult, 'warnings' | 'riskScore' | 'riskLevel'>): string[] {
  const warnings: string[] = [];

  if (!status.mintAuthDisabled) {
    warnings.push('⚠️ Mint authority active - developer can mint more tokens');
  }

  if (!status.freezeDisabled) {
    warnings.push('⚠️ Freeze authority active - developer can freeze accounts');
  }

  if (!status.lpBurned && status.migrated) {
    warnings.push('⚠️ LP tokens not burned - potential rug pull risk');
  }

  if (!status.migrated) {
    warnings.push('ℹ️ Token still in bonding curve phase');
  }

  if (status.mintAuthDisabled && status.freezeDisabled && status.lpBurned) {
    warnings.push('✅ Token passes all security checks');
  }

  return warnings;
}

/**
 * Comprehensive token status check
 * Combines all checks into single result with risk assessment
 */
export async function getTokenStatus(
  mintAddress: string,
  options?: {
    poolAddress?: string;
    bondingProgress?: number;
    marketCap?: number;
    tokenAge?: number;
  }
): Promise<TokenStatusResult> {
  // Run all checks in parallel for performance
  const [migrated, lpBurned, mintAuthDisabled, freezeDisabled] = await Promise.all([
    checkMigrationStatus(mintAddress, options?.bondingProgress, options?.marketCap),
    options?.poolAddress ? checkLPBurned(options.poolAddress, options?.tokenAge) : Promise.resolve(false),
    checkMintAuthority(mintAddress, options?.tokenAge),
    checkFreezeAuthority(mintAddress, options?.tokenAge),
  ]);

  const partialStatus = {
    migrated,
    lpBurned,
    mintAuthDisabled,
    freezeDisabled,
  };

  const riskScore = calculateRiskScore(partialStatus);
  const riskLevel = getRiskLevel(riskScore);
  const warnings = generateWarnings(partialStatus);

  return {
    ...partialStatus,
    riskScore,
    riskLevel,
    warnings,
  };
}

/**
 * Batch check multiple tokens (for feed optimization)
 */
export async function batchGetTokenStatus(
  tokens: Array<{
    mintAddress: string;
    poolAddress?: string;
    bondingProgress?: number;
    marketCap?: number;
    tokenAge?: number;
  }>
): Promise<Map<string, TokenStatusResult>> {
  const results = await Promise.all(
    tokens.map(token => 
      getTokenStatus(token.mintAddress, {
        poolAddress: token.poolAddress,
        bondingProgress: token.bondingProgress,
        marketCap: token.marketCap,
        tokenAge: token.tokenAge,
      })
    )
  );

  const statusMap = new Map<string, TokenStatusResult>();
  tokens.forEach((token, index) => {
    statusMap.set(token.mintAddress, results[index]);
  });

  return statusMap;
}

/**
 * Quick risk check (returns only risk level, no detailed info)
 */
export function quickRiskCheck(
  mintAuthDisabled: boolean,
  freezeDisabled: boolean,
  lpBurned: boolean
): TokenStatusResult['riskLevel'] {
  const score = calculateRiskScore({
    migrated: true,
    mintAuthDisabled,
    freezeDisabled,
    lpBurned,
  });
  return getRiskLevel(score);
}

/**
 * Format risk level for display
 */
export function formatRiskLevel(level: TokenStatusResult['riskLevel']): {
  text: string;
  color: string;
  emoji: string;
} {
  switch (level) {
    case 'LOW':
      return { text: 'Low Risk', color: 'text-green-400', emoji: '✅' };
    case 'MEDIUM':
      return { text: 'Medium Risk', color: 'text-yellow-400', emoji: '⚠️' };
    case 'HIGH':
      return { text: 'High Risk', color: 'text-orange-400', emoji: '🔶' };
    case 'CRITICAL':
      return { text: 'Critical Risk', color: 'text-red-400', emoji: '🚨' };
  }
}
