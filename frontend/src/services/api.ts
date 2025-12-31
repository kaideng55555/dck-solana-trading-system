// src/services/api.ts
import axios from 'axios';

const API_URL = (import.meta.env.VITE_API_URL as string) || 'http://localhost:8000';
const baseURL = API_URL.replace(/\/$/, '');

const api = axios.create({ baseURL });

// Cache for GETs (1 minute)
const cache = new Map<string, Promise<any>>();
const TTL_MS = 60_000;
const keyFor = (url: string) => `GET:${url}`;

// Retry on 429 with Retry-After
api.interceptors.response.use(undefined, async (err) => {
  const status = err?.response?.status;
  if (status === 429) {
    const raHeader = err?.response?.headers?.['retry-after'];
    const raSec = raHeader ? Number(raHeader) : NaN;
    const delayMs = Math.min(30_000, isNaN(raSec) ? 1000 : raSec * 1000);
    await new Promise(r => setTimeout(r, delayMs));
    return api.request(err.config);
  }
  throw err;
});

export const tokenAPI = {
  async getTokenHistory(mintAddress: string): Promise<Array<{ timestamp:number; price:number; volume?:number }>> {
    const url = `/token/${encodeURIComponent(mintAddress)}/history`;
    const k = keyFor(url);
    if (cache.has(k)) return cache.get(k)!;
    const p = api.get(url).then(({ data }) => {
      if (Array.isArray(data)) return data;
      if (data && Array.isArray(data.data)) return data.data;
      return [];
    }).finally(() => {
      setTimeout(() => cache.delete(k), TTL_MS);
    });
    cache.set(k, p);
    return p;
  }
};
