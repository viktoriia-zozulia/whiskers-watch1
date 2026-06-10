import { config } from '../config/env'

export const uploadService = {
  /** Persists an uploaded image and returns its public URL. */
  async save(file: File): Promise<string> {
    const ext = (file.name?.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '')
    const name = `${crypto.randomUUID()}.${ext}`
    await Bun.write(`${config.uploadsDir}/${name}`, file)
    return `/api/uploads/${name}`
  },

  /** Returns a Bun file handle for an uploaded image, or null if missing. */
  async read(rawName: string) {
    const name = rawName.replace(/[^a-zA-Z0-9._-]/g, '')
    const file = Bun.file(`${config.uploadsDir}/${name}`)
    if (!(await file.exists())) return null
    return file
  },
}
