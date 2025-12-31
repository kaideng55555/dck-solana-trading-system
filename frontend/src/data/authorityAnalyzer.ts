/**
 * Authority Analyzer - Fake Renounce Detection & Authority Risk Assessment
 * 
 * Detects:
 * - Mint and freeze authority status
 * - Fake renounces (authority moved to suspicious addresses)
 * - Recent authority changes (potential rug setup)
 * - Authority toggle patterns (suspicious behavior)
 * - Migration eligibility (fully renounced + LP secured)
 * 
 * Integration: Auto-called during token normalization
 */

import type { RawTokenData } from './tokenTypes';

// =============================================
// TYPES
// =============================================

export interface AuthorityInfo {
  // Authority addresses
  mintAuthority: string | null;
  freezeAuthority: string | null;
  updateAuthority?: string | null;
  
  // Authority status
  mintAuthorityDisabled: boolean;
  freezeAuthorityDisabled: boolean;
  updateAuthorityDisabled?: boolean;
  
  // Risk detection
  fakeRenounceDetected: boolean;
  authorityRiskScore: number; // 0-100, higher = more risky
  
  // Status flags
  isFullyRenounced: boolean;
  isMigratedEligible: boolean;
  
  // Summary flags
  authorityFlags: string[];
}

// =============================================
// CONSTANTS
// =============================================

// Null/burn address patterns (Solana)
const NULL_ADDRESSES = [
  '11111111111111111111111111111111',
  '1111111111111111111111111111111111111111111',
  'So11111111111111111111111111111111111111112', // Wrapped SOL
  '000000000000000000000000000000000000000000',
  '0x0000000000000000000000000000000000000000',
  null,
  '',
];

// Known suspicious authority patterns
const SUSPICIOUS_AUTHORITY_PATTERNS = [
  // Temporary/burner wallet patterns
  /^[A-Za-z0-9]{10,20}$/,  // Short random addresses
  /^temp/i,                 // "temp" prefix
  /^test/i,                 // "test" prefix
  /^burn/i,                 // Fake burn addresses
  
  // Suspicious contract patterns
  /^proxy/i,                // Proxy contracts
  /^vault/i,                // Vault contracts (unless verified)
];

// Time thresholds
const RECENT_CHANGE_THRESHOLD = 3600000;      // 1 hour in ms
const TOGGLE_PATTERN_THRESHOLD = 86400000;    // 24 hours in ms

// Risk scoring weights
const RISK_MINT_ACTIVE = 40;              // Mint authority still active
const RISK_FREEZE_ACTIVE = 40;            // Freeze authority still active
const RISK_FAKE_RENOUNCE = 50;            // Fake renounce detected
const RISK_RECENT_CHANGE = 30;            // Authority changed recently
const RISK_SUSPICIOUS_ADDRESS = 25;       // Authority at suspicious address
const RISK_UPDATE_ACTIVE = 10;            // Update authority active (lower risk)

// =============================================
// MAIN ANALYZER FUNCTION
// =============================================

/**
 * Analyze token authorities for fake renounces and risks
 * 
 * @param rawToken - Raw token data from API
 * @returns AuthorityInfo - Complete authority analysis
 */
export function analyzeAuthorities(rawToken: RawTokenData): AuthorityInfo {
  // Initialize flags array
  const flags: string[] = [];
  
  // Extract authority addresses
  const mintAuthority = extractMintAuthority(rawToken);
  const freezeAuthority = extractFreezeAuthority(rawToken);
  const updateAuthority = extractUpdateAuthority(rawToken);
  
  // Extract timing data
  const authorityChangedAt = extractAuthorityChangeTime(rawToken);
  const currentTime = Date.now();
  
  // Extract LP status (needed for eligibility checks)
  const lpBurned = extractLPBurned(rawToken);
  const lpLocked = extractLPLocked(rawToken);
  const lpRemoved = extractLPRemoved(rawToken);
  
  // =============================================
  // AUTHORITY STATUS CHECKS
  // =============================================
  
  const mintAuthorityDisabled = isAuthorityDisabled(mintAuthority);
  const freezeAuthorityDisabled = isAuthorityDisabled(freezeAuthority);
  const updateAuthorityDisabled = isAuthorityDisabled(updateAuthority);
  
  if (mintAuthorityDisabled) flags.push('MINT_DISABLED');
  if (freezeAuthorityDisabled) flags.push('FREEZE_DISABLED');
  if (updateAuthorityDisabled) flags.push('UPDATE_DISABLED');
  
  // =============================================
  // FAKE RENOUNCE DETECTION
  // =============================================
  
  const fakeRenounceDetected = checkFakeRenounce(
    mintAuthority,
    freezeAuthority,
    authorityChangedAt,
    currentTime,
    rawToken
  );
  
  if (fakeRenounceDetected) {
    flags.push('FAKE_RENOUNCE_DETECTED');
  }
  
  // =============================================
  // AUTHORITY RISK SCORING
  // =============================================
  
  const authorityRiskScore = calculateAuthorityRiskScore(
    mintAuthorityDisabled,
    freezeAuthorityDisabled,
    updateAuthorityDisabled,
    fakeRenounceDetected,
    mintAuthority,
    freezeAuthority,
    authorityChangedAt,
    currentTime
  );
  
  // Add risk-based flags
  if (authorityRiskScore >= 80) {
    flags.push('CRITICAL_AUTHORITY_RISK');
  } else if (authorityRiskScore >= 50) {
    flags.push('HIGH_AUTHORITY_RISK');
  } else if (authorityRiskScore >= 25) {
    flags.push('MODERATE_AUTHORITY_RISK');
  }
  
  // =============================================
  // STATUS FLAGS
  // =============================================
  
  const isFullyRenounced = checkFullyRenounced(
    mintAuthorityDisabled,
    freezeAuthorityDisabled,
    lpRemoved
  );
  
  const isMigratedEligible = checkMigrationEligibility(
    mintAuthorityDisabled,
    freezeAuthorityDisabled,
    lpBurned,
    lpLocked
  );
  
  if (isFullyRenounced) flags.push('FULLY_RENOUNCED');
  if (isMigratedEligible) flags.push('MIGRATION_ELIGIBLE');
  
  // Add specific authority warnings
  if (!mintAuthorityDisabled) flags.push('MINT_AUTHORITY_ACTIVE');
  if (!freezeAuthorityDisabled) flags.push('FREEZE_AUTHORITY_ACTIVE');
  if (!updateAuthorityDisabled && updateAuthority) flags.push('UPDATE_AUTHORITY_ACTIVE');
  
  // Check for suspicious addresses
  if (mintAuthority && !mintAuthorityDisabled && isSuspiciousAddress(mintAuthority)) {
    flags.push('SUSPICIOUS_MINT_AUTHORITY');
  }
  if (freezeAuthority && !freezeAuthorityDisabled && isSuspiciousAddress(freezeAuthority)) {
    flags.push('SUSPICIOUS_FREEZE_AUTHORITY');
  }
  
  // =============================================
  // BUILD RESULT
  // =============================================
  
  return {
    // Authority addresses
    mintAuthority,
    freezeAuthority,
    updateAuthority,
    
    // Authority status
    mintAuthorityDisabled,
    freezeAuthorityDisabled,
    updateAuthorityDisabled,
    
    // Risk detection
    fakeRenounceDetected,
    authorityRiskScore,
    
    // Status flags
    isFullyRenounced,
    isMigratedEligible,
    
    // Summary flags
    authorityFlags: flags,
  };
}

// =============================================
// DATA EXTRACTION HELPERS
// =============================================

function extractMintAuthority(token: RawTokenData): string | null {
  return token.mintAuthority 
    || token.mint_authority 
    || token.authorities?.mint 
    || null;
}

function extractFreezeAuthority(token: RawTokenData): string | null {
  return token.freezeAuthority 
    || token.freeze_authority 
    || token.authorities?.freeze 
    || null;
}

function extractUpdateAuthority(token: RawTokenData): string | null {
  return token.updateAuthority 
    || token.update_authority 
    || token.authorities?.update 
    || null;
}

function extractAuthorityChangeTime(token: RawTokenData): number | null {
  return token.authorityChangedAt 
    || token.authority_changed_at 
    || token.authorityChangeTimestamp 
    || token.authority_change_timestamp 
    || null;
}

function extractLPBurned(token: RawTokenData): boolean {
  return token.lpBurned || token.lp_burned || false;
}

function extractLPLocked(token: RawTokenData): boolean {
  return token.lpLocked || token.lp_locked || false;
}

function extractLPRemoved(token: RawTokenData): boolean {
  // Simple check - if liquidity is 0 or very low
  const liquidity = token.liquidity || token.liquidityUsd || 0;
  return liquidity < 50; // Less than $50 liquidity = likely removed
}

// =============================================
// AUTHORITY STATUS CHECKS
// =============================================

/**
 * Check if authority is disabled (null or burn address)
 */
function isAuthorityDisabled(authority: string | null | undefined): boolean {
  if (!authority) return true;
  
  // Check against null address patterns
  return NULL_ADDRESSES.some(nullAddr => {
    if (nullAddr === null) return authority === null;
    if (nullAddr === '') return authority === '';
    return authority === nullAddr || authority.includes(nullAddr);
  });
}

/**
 * Check if address looks suspicious (not a proper null/burn address)
 */
function isSuspiciousAddress(address: string): boolean {
  if (!address || isAuthorityDisabled(address)) return false;
  
  // Check against known suspicious patterns
  return SUSPICIOUS_AUTHORITY_PATTERNS.some(pattern => 
    pattern.test(address)
  );
}

// =============================================
// FAKE RENOUNCE DETECTION
// =============================================

/**
 * Detect fake renounces using multiple signals
 */
function checkFakeRenounce(
  mintAuthority: string | null,
  freezeAuthority: string | null,
  authorityChangedAt: number | null,
  currentTime: number,
  rawToken: RawTokenData
): boolean {
  // Signal 1: Authority moved to suspicious address instead of null
  if (mintAuthority && !isAuthorityDisabled(mintAuthority)) {
    if (isSuspiciousAddress(mintAuthority)) {
      return true; // Fake renounce - moved to burner wallet
    }
  }
  
  if (freezeAuthority && !isAuthorityDisabled(freezeAuthority)) {
    if (isSuspiciousAddress(freezeAuthority)) {
      return true; // Fake renounce - moved to burner wallet
    }
  }
  
  // Signal 2: Authority changed very recently (< 1 hour)
  // Legitimate renounces happen early, not after token launches
  if (authorityChangedAt) {
    const timeSinceChange = currentTime - authorityChangedAt;
    
    if (timeSinceChange < RECENT_CHANGE_THRESHOLD) {
      // Recent change is suspicious if token is old
      const createdAt = rawToken.createdAt || rawToken.created_at || currentTime;
      const tokenAge = currentTime - createdAt;
      
      if (tokenAge > 3600000) { // Token older than 1 hour
        return true; // Suspicious - why change authority now?
      }
    }
  }
  
  // Signal 3: Authority toggle pattern detection
  // If we have history of authority changes (would need historical data)
  const authorityChangeHistory = rawToken.authorityChangeHistory || [];
  if (authorityChangeHistory.length > 2) {
    // Multiple authority changes in short time = suspicious
    return true;
  }
  
  // Signal 4: One authority disabled but not the other (partial renounce)
  // This is suspicious if done to appear "renounced" while keeping control
  const mintDisabled = isAuthorityDisabled(mintAuthority);
  const freezeDisabled = isAuthorityDisabled(freezeAuthority);
  
  if (mintDisabled !== freezeDisabled) {
    // Partial renounce detected - only one authority disabled
    // Check if this happened recently
    if (authorityChangedAt) {
      const timeSinceChange = currentTime - authorityChangedAt;
      if (timeSinceChange < TOGGLE_PATTERN_THRESHOLD) {
        return true; // Suspicious partial renounce
      }
    }
  }
  
  return false; // No fake renounce detected
}

// =============================================
// RISK SCORING
// =============================================

/**
 * Calculate authority risk score (0-100)
 * 
 * Factors:
 * - Mint authority status (40 points)
 * - Freeze authority status (40 points)
 * - Fake renounce detection (50 points bonus)
 * - Recent authority changes (30 points)
 * - Suspicious addresses (25 points)
 * - Update authority status (10 points)
 */
function calculateAuthorityRiskScore(
  mintDisabled: boolean,
  freezeDisabled: boolean,
  updateDisabled: boolean,
  fakeRenounce: boolean,
  mintAuthority: string | null,
  freezeAuthority: string | null,
  authorityChangedAt: number | null,
  currentTime: number
): number {
  let risk = 0;
  
  // 1. Mint authority risk (0-40 points)
  if (!mintDisabled) {
    risk += RISK_MINT_ACTIVE; // 40 points
    
    // Extra risk if suspicious address
    if (mintAuthority && isSuspiciousAddress(mintAuthority)) {
      risk += RISK_SUSPICIOUS_ADDRESS; // +25 points
    }
  }
  
  // 2. Freeze authority risk (0-40 points)
  if (!freezeDisabled) {
    risk += RISK_FREEZE_ACTIVE; // 40 points
    
    // Extra risk if suspicious address
    if (freezeAuthority && isSuspiciousAddress(freezeAuthority)) {
      risk += RISK_SUSPICIOUS_ADDRESS; // +25 points
    }
  }
  
  // 3. Fake renounce bonus risk (0-50 points)
  if (fakeRenounce) {
    risk += RISK_FAKE_RENOUNCE; // 50 points
  }
  
  // 4. Recent authority change risk (0-30 points)
  if (authorityChangedAt) {
    const timeSinceChange = currentTime - authorityChangedAt;
    
    if (timeSinceChange < RECENT_CHANGE_THRESHOLD) {
      risk += RISK_RECENT_CHANGE; // 30 points - very recent
    } else if (timeSinceChange < TOGGLE_PATTERN_THRESHOLD) {
      risk += RISK_RECENT_CHANGE / 2; // 15 points - recent
    }
  }
  
  // 5. Update authority risk (0-10 points)
  // Lower risk, but still a concern
  if (!updateDisabled) {
    risk += RISK_UPDATE_ACTIVE; // 10 points
  }
  
  // Cap at 100
  return Math.min(risk, 100);
}

// =============================================
// STATUS CHECKS
// =============================================

/**
 * Check if token is fully renounced
 * 
 * Criteria:
 * - Mint authority disabled
 * - Freeze authority disabled
 * - LP not removed (still has liquidity)
 */
function checkFullyRenounced(
  mintDisabled: boolean,
  freezeDisabled: boolean,
  lpRemoved: boolean
): boolean {
  // All authorities must be disabled
  if (!mintDisabled || !freezeDisabled) return false;
  
  // LP must not be removed (dead tokens don't count as renounced)
  if (lpRemoved) return false;
  
  return true;
}

/**
 * Check if token is eligible for migration/graduation
 * 
 * Criteria:
 * - Mint authority disabled
 * - Freeze authority disabled
 * - LP burned OR LP locked
 */
function checkMigrationEligibility(
  mintDisabled: boolean,
  freezeDisabled: boolean,
  lpBurned: boolean,
  lpLocked: boolean
): boolean {
  // All authorities must be disabled
  if (!mintDisabled || !freezeDisabled) return false;
  
  // LP must be secured (burned or locked)
  if (!lpBurned && !lpLocked) return false;
  
  return true;
}

// =============================================
// UTILITY FUNCTIONS
// =============================================

/**
 * Get human-readable description of authority risk
 */
export function getAuthorityRiskDescription(risk: number): string {
  if (risk === 0) return 'Safe - Fully renounced';
  if (risk <= 10) return 'Very Low - Only update authority active';
  if (risk <= 25) return 'Low - Minor authority concerns';
  if (risk <= 50) return 'Moderate - Some authorities active';
  if (risk <= 75) return 'High - Multiple authorities active';
  return 'Critical - Fake renounce or suspicious authorities';
}

/**
 * Get color class for authority risk
 */
export function getAuthorityRiskColor(risk: number): string {
  if (risk === 0) return 'text-green-400';
  if (risk <= 25) return 'text-yellow-400';
  if (risk <= 50) return 'text-orange-400';
  return 'text-red-400';
}

/**
 * Get emoji for authority status
 */
export function getAuthorityStatusEmoji(info: AuthorityInfo): string {
  if (info.fakeRenounceDetected) return '🚨';
  if (info.isFullyRenounced) return '✅';
  if (info.isMigratedEligible) return '🎓';
  if (info.authorityRiskScore >= 75) return '⛔';
  if (info.authorityRiskScore >= 50) return '⚠️';
  if (info.authorityRiskScore >= 25) return '⚡';
  return '🔓';
}

/**
 * Get authority status label
 */
export function getAuthorityStatusLabel(info: AuthorityInfo): string {
  if (info.fakeRenounceDetected) return 'FAKE RENOUNCE';
  if (info.isFullyRenounced) return 'FULLY RENOUNCED';
  if (info.isMigratedEligible) return 'MIGRATION READY';
  if (!info.mintAuthorityDisabled && !info.freezeAuthorityDisabled) return 'NOT RENOUNCED';
  if (!info.mintAuthorityDisabled) return 'MINT ACTIVE';
  if (!info.freezeAuthorityDisabled) return 'FREEZE ACTIVE';
  return 'PARTIALLY RENOUNCED';
}
