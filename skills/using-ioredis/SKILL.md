---
name: using-ioredis
domain: node
description: Use when working with Redis from TypeScript/Node.js via the ioredis client — caching, rate limiting, distributed locks, pub/sub, Streams, connection setup, Cluster/Sentinel. Read on demand; not for raw redis-cli or non-Node clients.
depends-on: []
chains-to: null
suggests: []
---

# using-ioredis

> Canonical references: [ioredis](https://github.com/redis/ioredis) and [Redis docs](https://redis.io/docs/latest/). This skill captures battle-tested patterns in TypeScript; defer upstream for current API.

ioredis is the de-facto Redis client for Node.js. Promise-based, supports Cluster/Sentinel, pipelining, Lua scripting, and Streams. Use it in Nest.js (custom provider), Next.js route handlers, BullMQ workers — anywhere Node touches Redis.

## When to Activate

- Adding caching, sessions, or rate limiting to a Node/Nest backend
- Building distributed locks or coordination across workers
- Pub/Sub or Redis Streams from TypeScript
- Configuring Redis for production (Cluster, Sentinel, TLS)
- BullMQ / queue patterns that need a custom Redis connection

## Data Structure Cheat Sheet

| Use Case | Structure | Example Key |
|----------|-----------|-------------|
| Simple cache | String | `product:123` |
| User session | Hash | `session:abc` |
| Leaderboard | Sorted Set | `scores:weekly` |
| Unique visitors | Set | `visitors:2024-01-01` |
| Activity feed | List | `feed:user:456` |
| Event stream | Stream | `events:orders` |
| Counters / rate limits | String (INCR) | `ratelimit:user:123` |
| Approximate uniques | HyperLogLog | `hll:pageviews` |

## Client Setup

```ts
import Redis, { RedisOptions } from 'ioredis';

const options: RedisOptions = {
  host: process.env.REDIS_HOST ?? 'localhost',
  port: Number(process.env.REDIS_PORT ?? 6379),
  // Critical for BullMQ and blocking commands:
  maxRetriesPerRequest: null,
  enableReadyCheck: true,
  connectTimeout: 2000,
  retryStrategy: (times) => Math.min(times * 50, 2000),
};

export const redis = new Redis(options);
redis.on('error', (err) => console.error('[redis]', err));
```

> ioredis multiplexes commands over a single TCP connection per client — no manual pool. For blocking commands (`BLPOP`, `XREAD`), use a dedicated client via `redis.duplicate()`.

### Nest.js provider

```ts
// redis.module.ts
import { Module, Global } from '@nestjs/common';
import Redis from 'ioredis';

export const REDIS = Symbol('REDIS');

@Global()
@Module({
  providers: [
    {
      provide: REDIS,
      useFactory: () =>
        new Redis({ host: 'localhost', port: 6379, maxRetriesPerRequest: null }),
    },
  ],
  exports: [REDIS],
})
export class RedisModule {}
```

## Core Patterns

### Cache-Aside (Lazy Loading)

```ts
async function getProduct(id: number) {
  const key = `product:${id}`;
  const cached = await redis.get(key);
  if (cached) return JSON.parse(cached) as Product;

  const product = await db.product.findUnique({ where: { id } });
  await redis.set(key, JSON.stringify(product), 'EX', 3600);
  return product;
}
```

### Write-Through

```ts
async function updateProduct(id: number, data: Product) {
  await db.product.update({ where: { id }, data });
  await redis.set(`product:${id}`, JSON.stringify(data), 'EX', 3600);
}
```

### Tag-based Invalidation (Pipeline)

```ts
async function cacheProduct(id: number, categoryId: number, data: Product) {
  const key = `product:${id}`;
  const tag = `tag:category:${categoryId}`;
  await redis
    .multi()
    .set(key, JSON.stringify(data), 'EX', 3600)
    .sadd(tag, key)
    .expire(tag, 3600)
    .exec();
}

async function invalidateCategory(categoryId: number) {
  const tag = `tag:category:${categoryId}`;
  const keys = await redis.smembers(tag);
  if (keys.length) await redis.del(...keys);
  await redis.del(tag);
}
```

### Session Storage (Hash)

```ts
import { randomUUID } from 'node:crypto';

async function createSession(userId: number, ttl = 86_400) {
  const sid = randomUUID();
  const key = `session:${sid}`;
  await redis
    .multi()
    .hset(key, { userId: String(userId), createdAt: Date.now() })
    .expire(key, ttl)
    .exec();
  return sid;
}

async function getSession(sid: string) {
  const data = await redis.hgetall(`session:${sid}`);
  return Object.keys(data).length ? data : null;
}
```

## Rate Limiting

### Fixed Window

```ts
async function isRateLimited(userId: number, limit = 100, windowSec = 60) {
  const bucket = Math.floor(Date.now() / 1000 / windowSec);
  const key = `ratelimit:${userId}:${bucket}`;
  const res = await redis.multi().incr(key).expire(key, windowSec).exec();
  const count = res?.[0]?.[1] as number | undefined;
  return (count ?? 0) > limit;
}
```

### Sliding Window (Lua — Atomic)

```ts
const SLIDING_WINDOW = `
local key = KEYS[1]
local now = tonumber(ARGV[1])
local window = tonumber(ARGV[2])
local limit = tonumber(ARGV[3])
redis.call('ZREMRANGEBYSCORE', key, 0, now - window)
local count = redis.call('ZCARD', key)
if count < limit then
  local seq_key = key .. ':seq'
  local seq = redis.call('INCR', seq_key)
  redis.call('EXPIRE', seq_key, math.ceil(window / 1000))
  redis.call('ZADD', key, now, now .. '-' .. seq)
  redis.call('EXPIRE', key, math.ceil(window / 1000))
  return 1
end
return 0
`;

redis.defineCommand('slidingWindow', { numberOfKeys: 1, lua: SLIDING_WINDOW });

declare module 'ioredis' {
  interface RedisCommander<Context> {
    slidingWindow(key: string, now: number, windowMs: number, limit: number): Promise<number>;
  }
}

async function allowRequest(userId: number) {
  const ok = await redis.slidingWindow(
    `ratelimit:sliding:${userId}`,
    Date.now(),
    60_000,
    100,
  );
  return ok === 1;
}
```

## Distributed Locks

### SET NX PX + Lua release

```ts
import { randomUUID } from 'node:crypto';

async function acquireLock(resource: string, ttlMs = 5000) {
  const token = randomUUID();
  const ok = await redis.set(`lock:${resource}`, token, 'PX', ttlMs, 'NX');
  return ok === 'OK' ? token : null;
}

const RELEASE = `
if redis.call('get', KEYS[1]) == ARGV[1] then
  return redis.call('del', KEYS[1])
end
return 0
`;

async function releaseLock(resource: string, token: string) {
  const res = (await redis.eval(RELEASE, 1, `lock:${resource}`, token)) as number;
  return res === 1;
}

const token = await acquireLock('order:payment:123');
if (token) {
  try {
    await processPayment();
  } finally {
    await releaseLock('order:payment:123', token);
  }
}
```

> For multi-node correctness use [`redlock`](https://github.com/mike-marcacci/node-redlock).

## Pub/Sub & Streams

### Pub/Sub (Fire-and-Forget)

```ts
// Publisher (shared client is fine)
await redis.publish('events:orders', JSON.stringify({ id: 42 }));

// Subscriber MUST use a dedicated client — subscribed connections can't run regular commands.
const sub = redis.duplicate();
await sub.subscribe('events:orders');
sub.on('message', (_channel, payload) => {
  const event = JSON.parse(payload);
  handle(event);
});
```

### Redis Streams (Durable Queue)

```ts
// Producer
await redis.xadd(
  'events:orders', 'MAXLEN', '~', 10_000, '*',
  'type', 'created', 'id', '42',
);

// Consumer group
try {
  await redis.xgroup('CREATE', 'events:orders', 'processor', '0', 'MKSTREAM');
} catch (err) {
  if (!(err as Error).message.includes('BUSYGROUP')) throw err;
}

async function consume(consumer: string) {
  while (true) {
    const res = (await redis.xreadgroup(
      'GROUP', 'processor', consumer,
      'COUNT', 10, 'BLOCK', 2000,
      'STREAMS', 'events:orders', '>',
    )) as Array<[string, Array<[string, string[]]>]> | null;
    if (!res) continue;
    for (const [, entries] of res) {
      for (const [id, fields] of entries) {
        await process(fields);
        await redis.xack('events:orders', 'processor', id);
      }
    }
  }
}
```

> Streams > Pub/Sub when you need delivery guarantees, consumer groups, or replay.

## Key Design

```
# Pattern: namespace:resource:id[:field]
app:user:123:profile
app:session:abc123
app:ratelimit:user:123
app:stats:pageviews:2026-06-05
```

### TTL Strategy

| Data Type | Suggested TTL |
|-----------|---------------|
| User session | 24h (`86400`) |
| API response cache | 5–15 min |
| Rate limit window | Match window size |
| Short-lived tokens | 5–10 min |
| Leaderboard | 1h–24h |
| Static reference data | 1h–1 week |

Always set a TTL. Untimed keys accumulate and cause memory pressure.

## Cluster & Sentinel

```ts
import Redis, { Cluster } from 'ioredis';

export const cluster = new Cluster(
  [{ host: 'redis-1', port: 6379 }, { host: 'redis-2', port: 6379 }],
  { scaleReads: 'slave', redisOptions: { maxRetriesPerRequest: null } },
);

export const sentinel = new Redis({
  sentinels: [
    { host: 'sentinel-1', port: 26379 },
    { host: 'sentinel-2', port: 26379 },
  ],
  name: 'mymaster',
});
```

> In Cluster mode, multi-key commands require all keys to land on the same slot. Use hash tags: `user:{123}:profile`, `user:{123}:settings`.

## Eviction Policies

| Policy | Behavior | Best For |
|--------|----------|----------|
| `noeviction` | Error on write when full | Queues / critical data |
| `allkeys-lru` | Evict least recently used | General cache |
| `volatile-lru` | LRU among keys with TTL | Mixed store |
| `allkeys-lfu` | Evict least frequently used | Skewed access |
| `volatile-ttl` | Evict soonest-to-expire | Prioritize long-lived data |

Set via `redis.conf`: `maxmemory-policy allkeys-lru`.

## Anti-Patterns

| Anti-Pattern | Problem | Fix |
|---|---|---|
| Keys with no TTL | Unbounded memory | Always set EX/PX |
| `KEYS *` in prod | Blocks server (O(N)) | Use `scanStream()` |
| Large blobs (>100KB) | Slow serialization, mem pressure | Store ref + object store |
| Same client for sub + commands | Subscribed conn refuses commands | `redis.duplicate()` for subscriber |
| `maxRetriesPerRequest` default with BullMQ | BullMQ throws on blocking cmds | Set to `null` |
| Missing hash tags in Cluster | `CROSSSLOT` errors | `user:{id}:*` pattern |
| `FLUSHALL` without thought | Wipes everything | Scope by pattern via `scanStream` |
| Thundering herd on cold key | DB stampede | Lock + probabilistic early expiry |

### Safe `SCAN` over `KEYS`

```ts
const stream = redis.scanStream({ match: 'session:*', count: 100 });
const keys: string[] = [];
for await (const batch of stream) keys.push(...(batch as string[]));
```

### Cache Miss Stampede (Single-Process)

```ts
const inflight = new Map<string, Promise<unknown>>();

async function getWithLock<T>(key: string, fetch: () => Promise<T>, ttl = 300): Promise<T> {
  const cached = await redis.get(key);
  if (cached) return JSON.parse(cached) as T;

  const existing = inflight.get(key);
  if (existing) return existing as Promise<T>;

  const promise = (async () => {
    try {
      const value = await fetch();
      await redis.set(key, JSON.stringify(value), 'EX', ttl);
      return value;
    } finally {
      inflight.delete(key);
    }
  })();
  inflight.set(key, promise);
  return promise;
}
```

> For multi-process deployments swap the in-memory map for `acquireLock`/`releaseLock` above.

## Quick Reference

| Pattern | When to Use |
|---------|-------------|
| Cache-aside | Read-heavy, tolerate slight staleness |
| Write-through | Strong consistency required |
| Distributed lock | Prevent concurrent access |
| Sliding window rate limit | Accurate per-user throttling |
| Streams + consumer groups | Durable event queue |
| Pub/Sub | Broadcast, no delivery guarantees |
| Sorted Set | Leaderboards, ranked pagination |
| HyperLogLog | Approximate unique count, low memory |

## Related

- Skill: `postgres-patterns` — relational data patterns
- Skill: `nestjs-patterns` — Nest module wiring for Redis providers
- Skill: `mcp-server-patterns` — MCP server caching
