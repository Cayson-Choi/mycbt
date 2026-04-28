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

/** 밝은 배경 위 등급 텍스트 색 (마이페이지 KPI, 동영상 카드 등급 라벨 등) */
export const TIER_TEXT_COLOR: Record<string, string> = {
  FREE: 'text-emerald-600 dark:text-emerald-400',
  BRONZE: 'text-amber-700 dark:text-amber-500',
  SILVER: 'text-slate-500 dark:text-slate-300',
  GOLD: 'text-yellow-600 dark:text-yellow-400',
  PREMIUM: 'text-violet-600 dark:text-violet-400',
  ADMIN: 'text-rose-600 dark:text-rose-400',
}

/** 밝은 배경 위 둥근 뱃지 (시험 카드 우하단 등) */
export const TIER_BADGE_LIGHT: Record<string, string> = {
  FREE: 'bg-emerald-400/90 text-white',
  BRONZE: 'bg-amber-700/90 text-white',
  SILVER: 'bg-slate-300/90 text-slate-800',
  GOLD: 'bg-yellow-400/95 text-yellow-900',
  PREMIUM: 'bg-violet-500/90 text-white',
  ADMIN: 'bg-rose-500/90 text-white',
}

/** 다크 배경 위 둥근 뱃지 (마이페이지 프로필 히어로 등) */
export const TIER_BADGE_DARK: Record<string, string> = {
  FREE: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
  BRONZE: 'bg-amber-700/30 text-amber-300 border-amber-700/40',
  SILVER: 'bg-slate-400/20 text-slate-200 border-slate-400/40',
  GOLD: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40',
  PREMIUM: 'bg-violet-500/20 text-violet-300 border-violet-500/40',
  ADMIN: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
}

export function tierLevel(tier: string): number {
  return TIER_ORDER.indexOf(tier as TierType)
}

export function hasTierAccess(userTier: string, requiredTier: string): boolean {
  return tierLevel(userTier) >= tierLevel(requiredTier)
}
