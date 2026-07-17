export function getRelationshipId(
  relationship:
    | string
    | number
    | {
        id?: string | number
      }
    | null
    | undefined,
) {
  if (!relationship) return null

  if (typeof relationship === 'string' || typeof relationship === 'number') {
    return String(relationship)
  }

  return relationship.id ? String(relationship.id) : null
}

export function getRelationshipLabel(
  relationship:
    | string
    | number
    | {
        id?: string | number
        name?: string | null
        title?: string | null
        email?: string | null
      }
    | null
    | undefined,
) {
  if (!relationship) return '—'

  if (typeof relationship === 'string' || typeof relationship === 'number') {
    return String(relationship)
  }

  return relationship.name || relationship.title || relationship.email || '—'
}

export function formatDate(value: string | null | undefined) {
  if (!value) return '—'

  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value))
}

export function formatDateTime(value: string | null | undefined) {
  if (!value) return '—'

  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}

export function formatLabel(value: string | null | undefined) {
  if (!value) return '—'

  return value
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

export function formatCurrency(value: number | null | undefined, currency = 'GBP') {
  if (value === null || value === undefined) return '—'

  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(value)
}
