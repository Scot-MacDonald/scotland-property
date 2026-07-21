function getRelationshipId(value: unknown) {
  if (!value) return null
  if (typeof value === 'string') return value

  if (typeof value === 'object' && 'id' in value && typeof value.id === 'string') {
    return value.id
  }

  return null
}

function normaliseValue(value: unknown): unknown {
  if (value === undefined || value === null || value === '') {
    return null
  }

  if (Array.isArray(value)) {
    return value.map(normaliseValue)
  }

  if (value instanceof Date) {
    return value.toISOString()
  }

  if (typeof value === 'object') {
    const relationshipId = getRelationshipId(value)

    if (relationshipId) {
      return relationshipId
    }

    return Object.fromEntries(
      Object.entries(value)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, nestedValue]) => [key, normaliseValue(nestedValue)]),
    )
  }

  return value
}

function valuesAreEqual(previousValue: unknown, nextValue: unknown) {
  return JSON.stringify(normaliseValue(previousValue)) === JSON.stringify(normaliseValue(nextValue))
}

export function getChangedFields<T extends object>(
  previous: T,
  next: T,
  fields: readonly string[],
) {
  return fields.filter((field) => {
    const key = field as keyof T
    return !valuesAreEqual(previous[key], next[key])
  })
}
