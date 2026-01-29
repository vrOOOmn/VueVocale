type RateLimitResult = {
  ok: boolean;
  remaining: number;
  resetMs: number;
};

type Counter = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, Counter>();

export function rateLimit(
  key: string,
  limit: number,
  windowMs: number,
): RateLimitResult {
  const now = Date.now();
  const current = buckets.get(key);

  if (!current || now >= current.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, remaining: limit - 1, resetMs: windowMs };
  }

  if (current.count >= limit) {
    return { ok: false, remaining: 0, resetMs: current.resetAt - now };
  }

  current.count += 1;
  buckets.set(key, current);
  return { ok: true, remaining: limit - current.count, resetMs: current.resetAt - now };
}

export function getClientId(request: Request): string {
  const xff = request.headers.get("x-forwarded-for");
  const ip = xff ? xff.split(",")[0]?.trim() : request.headers.get("x-real-ip");
  return ip || "anonymous";
}
