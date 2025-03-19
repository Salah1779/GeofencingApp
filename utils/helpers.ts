// Risk threshold constants
export const RISK_THRESHOLDS = {
  LOW: 33,
  MEDIUM: 66,
  HIGH: 100
};

export const getRiskLevel = (value: number): 'low' | 'medium' | 'high' => {
  if (value <= RISK_THRESHOLDS.LOW) return 'low';
  if (value <= RISK_THRESHOLDS.MEDIUM) return 'medium';
  return 'high';
};

