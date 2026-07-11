export const motionDuration = {
  instant: 0.14,
  fast: 0.18,
  standard: 0.28,
  reveal: 0.56,
  page: 0.38,
} as const;

export const motionEase = {
  standard: [0.22, 1, 0.36, 1] as const,
  expressive: [0.16, 1, 0.3, 1] as const,
  exit: [0.4, 0, 1, 1] as const,
} as const;

export const motionSpring = {
  interaction: { type: 'spring' as const, stiffness: 440, damping: 30, mass: 0.72 },
  panel: { type: 'spring' as const, stiffness: 360, damping: 34, mass: 0.82 },
} as const;

export const motionDistance = {
  interaction: 2,
  reveal: 24,
  page: 12,
} as const;
