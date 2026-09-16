export function formatRelativeViewedTime(value: string, now = Date.now()): string {
  const viewedAt = new Date(value)

  if (Number.isNaN(viewedAt.getTime())) {
    return 'Viewed recently'
  }

  const difference = Math.max(0, now - viewedAt.getTime())
  const minute = 60 * 1000
  const hour = 60 * minute
  const day = 24 * hour
  const week = 7 * day

  if (difference < minute) {
    return 'Viewed just now'
  }

  if (difference < hour) {
    const minutes = Math.floor(difference / minute)

    return `Viewed ${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`
  }

  if (difference < day) {
    const hours = Math.floor(difference / hour)

    return `Viewed ${hours} ${hours === 1 ? 'hour' : 'hours'} ago`
  }

  if (difference < 2 * day) {
    return 'Viewed yesterday'
  }

  if (difference < week) {
    const days = Math.floor(difference / day)

    return `Viewed ${days} days ago`
  }

  if (difference < 5 * week) {
    const weeks = Math.floor(difference / week)

    return `Viewed ${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`
  }

  return `Viewed ${new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(viewedAt)}`
}
