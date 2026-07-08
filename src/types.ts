export interface VipCode {
  code: string;
  type: 'single_use' | 'duration';
  durationDays: number; // For 'duration' type
  createdAt: string;
  expiresAt: string | null;
  usedCount: number;
  maxUses: number;
  status: 'active' | 'used' | 'expired' | 'disabled';
}

export interface Signal {
  time: string;
  pair: string;
  direction: 'CALL' | 'PUT';
}

export const ASSET_PAIRS = [
  'USDDZD-OTC',
  'USDPKR-OTC',
  'USDINR-OTC',
  'USDARS-OTC',
  'USDJPY-OTC',
  'USDCAD-OTC',
  'USDEGP-OTC',
  'USDCHF-OTC',
  'USDMXN-OTC',
  'USDPHP-OTC',
  'USDBDT-OTC',
  'NZDCHF-OTC',
  'BRLUSD-OTC',
  'USDNGN-OTC',
];

export const DIRECTIONS = ['CALL', 'PUT'] as const;

export type Language = 'ar' | 'en';
