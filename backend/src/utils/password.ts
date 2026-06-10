/** Password hashing helpers (bcrypt via Bun's built-in crypto). */

export function hashPassword(plain: string): Promise<string> {
  return Bun.password.hash(plain, { algorithm: 'bcrypt', cost: 10 })
}

export function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return Bun.password.verify(plain, hash)
}
