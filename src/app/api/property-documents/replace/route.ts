import { replacePropertyDocument } from '@/modules/property-documents/api/replace'

export async function POST(request: Request) {
  return replacePropertyDocument(request)
}
