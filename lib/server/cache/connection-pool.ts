import { LRUCache } from 'lru-cache';
import { adminAuth, adminDb } from '@/lib/server/auth/firebase-admin';

class FirebaseConnectionPool {
  private static instance: FirebaseConnectionPool;
  private cache: LRUCache<string, any>;
  private tokenCache: Map<string, { token: any; expiry: number }>;

  private constructor() {
    this.cache = new LRUCache<string, any>({
      max: 500,
      ttl: 1000 * 60 * 5, // 5 minutes
    });
    this.tokenCache = new Map();
  }

  static getInstance(): FirebaseConnectionPool {
    if (!FirebaseConnectionPool.instance) {
      FirebaseConnectionPool.instance = new FirebaseConnectionPool();
    }
    return FirebaseConnectionPool.instance;
  }

  async getUser(uid: string) {
    const cacheKey = `user:${uid}`;
    const cached = this.cache.get(cacheKey);
    if (cached) return cached;

    const user = await adminAuth.getUser(uid);
    this.cache.set(cacheKey, user);
    return user;
  }

  async verifyToken(token: string) {
    const cached = this.tokenCache.get(token);
    if (cached && cached.expiry > Date.now()) {
      return cached.token;
    }

    try {
      const decodedToken = await adminAuth.verifyIdToken(token);
      this.tokenCache.set(token, { 
        token: decodedToken, 
        expiry: Date.now() + 300000 // 5 minutes
      });
      return decodedToken;
    } catch (error) {
      this.tokenCache.delete(token);
      return null;
    }
  }

  async getDocument(collection: string, id: string) {
    const cacheKey = `doc:${collection}:${id}`;
    const cached = this.cache.get(cacheKey);
    if (cached) return cached;

    const doc = await adminDb.collection(collection).doc(id).get();
    const data = doc.exists ? { id: doc.id, ...doc.data() } : null;
    this.cache.set(cacheKey, data);
    return data;
  }

  clearCache(pattern?: string) {
    if (pattern) {
      this.cache.forEach((value, key) => {
        if (key.includes(pattern)) {
          this.cache.delete(key);
        }
      });
    } else {
      this.cache.clear();
    }
  }
}

export const connectionPool = FirebaseConnectionPool.getInstance();