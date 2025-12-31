export function getTokenAgeMinutes(createdAt?: number): number | null {
  if (!createdAt) return null;
  const diff = Date.now() - createdAt;
  return Math.floor(diff / 60000);
}

export function isPulseEligible(createdAt?: number): boolean {
  const age = getTokenAgeMinutes(createdAt);
  return age !== null && age <= 2;
}

/**
 * Check if token is fresh (< 2 minutes old) for pulsing border effect
 */
export function isFreshToken(createdAt: number): boolean {
  const age = getTokenAgeMinutes(createdAt);
  return age !== null && age < 2;
}
