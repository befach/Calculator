/**
 * Safe storage that works on both server (SSR) and client.
 * Uses localStorage in the browser, falls back to an in-memory Map on the server.
 */
const memoryStore = new Map<string, string>();

export const safeStorage = {
  getItem(key: string): string | null {
    if (typeof window !== 'undefined') {
      try { return localStorage.getItem(key); } catch { return null; }
    }
    return memoryStore.get(key) ?? null;
  },
  setItem(key: string, value: string): void {
    if (typeof window !== 'undefined') {
      try { localStorage.setItem(key, value); } catch { /* quota exceeded */ }
    } else {
      memoryStore.set(key, value);
    }
  },
  removeItem(key: string): void {
    if (typeof window !== 'undefined') {
      try { localStorage.removeItem(key); } catch { /* ignore */ }
    } else {
      memoryStore.delete(key);
    }
  },
};

export const safeSessionStorage = {
  getItem(key: string): string | null {
    if (typeof window !== 'undefined') {
      try { return sessionStorage.getItem(key); } catch { return null; }
    }
    return memoryStore.get(`__session__${key}`) ?? null;
  },
  setItem(key: string, value: string): void {
    if (typeof window !== 'undefined') {
      try { sessionStorage.setItem(key, value); } catch { /* ignore */ }
    } else {
      memoryStore.set(`__session__${key}`, value);
    }
  },
  removeItem(key: string): void {
    if (typeof window !== 'undefined') {
      try { sessionStorage.removeItem(key); } catch { /* ignore */ }
    } else {
      memoryStore.delete(`__session__${key}`);
    }
  },
};
