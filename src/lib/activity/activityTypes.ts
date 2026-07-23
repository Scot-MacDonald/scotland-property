export const ActivityTypes = {
  PROPERTY_CREATED: 'property-created',
  PROPERTY_UPDATED: 'property-updated',
  PROPERTY_STATUS_CHANGED: 'property-status-changed',

  ENQUIRY_CREATED: 'enquiry-created',
  ENQUIRY_STATUS_CHANGED: 'enquiry-status-changed',

  LEAD_CREATED: 'lead-created',
  LEAD_ASSIGNED: 'lead-assigned',
  LEAD_STATUS_CHANGED: 'lead-status-changed',

  VIEWING_CREATED: 'viewing-created',
  VIEWING_UPDATED: 'viewing-updated',

  VIEWING_STATUS_CHANGED: 'viewing-status-changed',
  VIEWING_RESCHEDULED: 'viewing-rescheduled',
  VIEWING_AGENT_CHANGED: 'viewing-agent-changed',
  VIEWING_NOTES_UPDATED: 'viewing-notes-updated',
  VIEWING_FEEDBACK_UPDATED: 'viewing-feedback-updated',
  VIEWING_OUTCOME_UPDATED: 'viewing-outcome-updated',
  VIEWING_FOLLOW_UP_UPDATED: 'viewing-follow-up-updated',

  VIEWING_BOOKED: 'viewing-booked',
  VIEWING_COMPLETED: 'viewing-completed',
  VIEWING_CANCELLED: 'viewing-cancelled',

  TASK_CREATED: 'task-created',
  TASK_UPDATED: 'task-updated',
  TASK_STATUS_CHANGED: 'task-status-changed',
  TASK_ASSIGNED: 'task-assigned',
  TASK_PRIORITY_CHANGED: 'task-priority-changed',
  TASK_DUE_DATE_CHANGED: 'task-due-date-changed',
  TASK_CHECKLIST_UPDATED: 'task-checklist-updated',
  TASK_NOTES_UPDATED: 'task-notes-updated',

  OFFER_CREATED: 'offer-created',
  OFFER_UPDATED: 'offer-updated',
  OFFER_ACCEPTED: 'offer-accepted',
  OFFER_REJECTED: 'offer-rejected',

  BUYER_REGISTERED: 'buyer-registered',

  NOTE_ADDED: 'note-added',

  DOCUMENT_UPLOADED: 'document-uploaded',

  PRICE_CHANGED: 'price-changed',
} as const

export type ActivityType = (typeof ActivityTypes)[keyof typeof ActivityTypes]
