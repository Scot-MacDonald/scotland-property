import { restorePropertyDocument } from '@/modules/property-documents/api/restore'

export async function POST(request: Request) {
  return restorePropertyDocument(request)
}
