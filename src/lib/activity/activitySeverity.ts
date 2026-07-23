export const ActivitySeverities = {
  INFO: 'info',
  SUCCESS: 'success',
  WARNING: 'warning',
  ERROR: 'error',
} as const

export type ActivitySeverity = (typeof ActivitySeverities)[keyof typeof ActivitySeverities]
