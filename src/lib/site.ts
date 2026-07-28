const fallbackUrl = 'http://localhost:3000'

export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || fallbackUrl).replace(/\/$/, '')

export function propertyUrl(slug: string) {
  return `${siteUrl}/property/${slug}`
}
