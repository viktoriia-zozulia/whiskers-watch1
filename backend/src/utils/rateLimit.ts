import { config } from '../config/env'

/**
 * Fixed-window in-memory rate limiter. Good enough for a single instance;
 * protects login from brute force and the demo endpoint from filling the DB.
 */
export function createRateLimiter({ max, windowMs }: { max: number; windowMs: number }) {
  const hits = new Map<string, { count: number; resetAt: number }>()

  return {
    /** Records a hit; returns false once `key` has exceeded the limit. */
    hit(key: string): boolean {
      const now = Date.now()
      if (hits.size > 10_000) {
        for (const [k, v] of hits) if (v.resetAt <= now) hits.delete(k)
      }
      const entry = hits.get(key)
      if (!entry || entry.resetAt <= now) {
        hits.set(key, { count: 1, resetAt: now + windowMs })
        return true
      }
      entry.count++
      return entry.count <= max
    },
  }
}

/**
 * Best-effort client IP. Behind a hosting proxy (TRUST_PROXY=true) the proxy
 * appends the real address to X-Forwarded-For, so the last entry is trusted.
 */
export function clientIp(request: Request, server: { requestIP(r: Request): { address: string } | null } | null) {
  if (config.trustProxy) {
    const forwarded = request.headers.get('x-forwarded-for')
    if (forwarded) return forwarded.split(',').at(-1)!.trim()
  }
  return server?.requestIP(request)?.address ?? 'unknown'
}
