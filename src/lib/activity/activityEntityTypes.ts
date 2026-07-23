export const ActivityEntityTypes = {
  PROPERTY: 'property',
  ENQUIRY: 'enquiry',
  LEAD: 'lead',
  VIEWING: 'viewing',
  TASK: 'task',
  OFFER: 'offer',
  BUYER: 'buyer',
  AGENT: 'agent',
  AGENCY: 'agency',
} as const

export type ActivityEntityType = (typeof ActivityEntityTypes)[keyof typeof ActivityEntityTypes]
