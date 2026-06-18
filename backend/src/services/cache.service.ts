type CacheEntry<T> = { data: T; expiresAt: number };

const store = new Map<string, CacheEntry<unknown>>();

const DEFAULT_TTL = 5 * 60 * 1000;

export const getCached = <T>(key: string): T | undefined => {
  const entry = store.get(key);
  if (!entry) return undefined;
  if (Date.now() > entry.expiresAt) {
    store.delete(key);
    return undefined;
  }
  return entry.data as T;
};

export const setCache = <T>(key: string, data: T, ttlMs = DEFAULT_TTL): void => {
  store.set(key, { data, expiresAt: Date.now() + ttlMs });
};

export const clearCache = (pattern?: string): void => {
  if (!pattern) {
    store.clear();
    return;
  }
  const regex = new RegExp(pattern);
  for (const key of store.keys()) {
    if (regex.test(key)) {
      store.delete(key);
    }
  }
};

export const cacheWrapper = async <T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlMs = DEFAULT_TTL
): Promise<T> => {
  const cached = getCached<T>(key);
  if (cached !== undefined) return cached;
  const data = await fetcher();
  setCache(key, data, ttlMs);
  return data;
};
