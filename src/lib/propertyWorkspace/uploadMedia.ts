import type { Payload } from 'payload'

type UploadableFile = FormDataEntryValue | null

export async function uploadMediaFile(
  payload: Payload,
  file: UploadableFile,
  alt: string,
): Promise<string | undefined> {
  if (!(file instanceof File) || file.size === 0) {
    return undefined
  }

  const buffer = Buffer.from(await file.arrayBuffer())

  const uploaded = await payload.create({
    collection: 'media',
    overrideAccess: true,
    data: {
      alt,
    },
    file: {
      data: buffer,
      mimetype: file.type || 'application/octet-stream',
      name: file.name,
      size: file.size,
    },
  })

  return uploaded.id
}

export async function uploadMediaFiles(
  payload: Payload,
  files: FormDataEntryValue[],
  alt: string,
): Promise<string[]> {
  const ids: string[] = []

  for (const file of files) {
    const uploadedId = await uploadMediaFile(payload, file, alt)

    if (uploadedId) {
      ids.push(uploadedId)
    }
  }

  return ids
}
