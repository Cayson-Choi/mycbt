export const TIER_ORDER = ['FREE', 'BRONZE', 'SILVER', 'GOLD', 'PREMIUM', 'ADMIN'] as const
export type TierType = (typeof TIER_ORDER)[number]

export const TIER_LABELS: Record<string, string> = {
  FREE: '무료',
  BRONZE: '브론즈',
  SILVER: '실버',
  GOLD: '골드',
  PREMIUM: '프리미엄',
  ADMIN: '운영자',
}

export function tierLevel(tier: string): number {
  return TIER_ORDER.indexOf(tier as TierType)
}

export function hasTierAccess(userTier: string, requiredTier: string): boolean {
  return tierLevel(userTier) >= tierLevel(requiredTier)
}
