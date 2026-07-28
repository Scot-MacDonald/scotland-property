import { createPropertyDocument } from '@/modules/property-documents/api/create'

export async function POST(request: Request) {
  return createPropertyDocument(request)
}
