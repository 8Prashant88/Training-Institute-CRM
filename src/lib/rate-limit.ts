import "server-only";



type WindowEntry = {
  count: number;
  resetAt: number;
};

const windows = new Map<string, WindowEntry>();

/*
 * Without this, `windows` would grow forever — every distinct IP that
 * has ever hit the limiter leaves an entry behind. Prune opportunistically
 * on check() calls instead of running a timer.
 */
const MAX_TRACKED_KEYS = 5000;

function pruneExpired(now: number): void {
  if (windows.size <= MAX_TRACKED_KEYS) {
    return;
  }

  for (const [key, entry] of windows) {
    if (entry.resetAt <= now) {
      windows.delete(key);
    }
  }
}

export type RateLimitResult =
  | { allowed: true }
  | { allowed: false; retryAfterSeconds: number };

export function checkRateLimit(
  key: string,
  options: { limit: number; windowMs: number },
): RateLimitResult {
  const now = Date.now();

  pruneExpired(now);

  const existing = windows.get(key);

  if (!existing || existing.resetAt <= now) {
    windows.set(key, {
      count: 1,
      resetAt: now + options.windowMs,
    });

    return { allowed: true };
  }

  if (existing.count >= options.limit) {
    return {
      allowed: false,
      retryAfterSeconds: Math.ceil(
        (existing.resetAt - now) / 1000,
      ),
    };
  }

  existing.count += 1;

  return { allowed: true };
}
