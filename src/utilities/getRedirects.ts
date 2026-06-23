import { unstable_cache } from 'next/cache'

export async function getRedirects() {
  return []
}

/**
 * Returns a cached empty redirects array.
 */
export const getCachedRedirects = () =>
  unstable_cache(async () => getRedirects(), ['redirects'], {
    tags: ['redirects'],
  })
