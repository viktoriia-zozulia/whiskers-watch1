import { db } from '../db'
import { config } from '../config/env'

// The file extension is derived from the validated MIME type, never from the
// client-supplied filename: an `evil.html` sent as `image/png` would otherwise
// be stored as .html and served back as a page (stored XSS on our origin).
const EXT_BY_MIME: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'image/avif': 'avif',
}

export const ALLOWED_IMAGE_TYPES = Object.keys(EXT_BY_MIME)

export function extensionFor(mime: string): string | null {
  return EXT_BY_MIME[mime.split(';')[0]!.trim().toLowerCase()] ?? null
}

/** Strips anything that could escape the uploads directory. */
export function sanitizeUploadName(raw: string): string {
  return raw.replace(/[^a-zA-Z0-9._-]/g, '').replace(/^\.+/, '')
}

export interface StoredImage {
  body: Uint8Array | Blob
  mime: string
}

export const uploadService = {
  /** Stores an uploaded image for a user and returns its public URL. */
  async save(userId: number, file: File): Promise<string> {
    const ext = extensionFor(file.type)
    if (!ext) throw new Error('Unsupported image type')
    const name = `${crypto.randomUUID()}.${ext}`
    await db.insertInto('uploads').values({
      name,
      user_id: userId,
      mime: file.type,
      data: Buffer.from(await file.arrayBuffer()),
    }).execute()
    return `/api/uploads/${name}`
  },

  /**
   * Looks an image up in the database, falling back to the legacy on-disk
   * uploads directory (images uploaded before storage moved to Postgres).
   */
  async read(rawName: string): Promise<StoredImage | null> {
    const name = sanitizeUploadName(rawName)
    if (!name) return null

    const row = await db.selectFrom('uploads').where('name', '=', name).select(['data', 'mime']).executeTakeFirst()
    if (row) return { body: new Uint8Array(row.data), mime: row.mime }

    const file = Bun.file(`${config.uploadsDir}/${name}`)
    if (await file.exists()) return { body: file, mime: file.type }
    return null
  },
}
