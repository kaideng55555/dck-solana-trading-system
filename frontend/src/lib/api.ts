// src/lib/api.ts
const API = import.meta.env.VITE_API_BASE || 'http://127.0.0.1:8000';

function assertJson(r: Response) {
  const ct = r.headers.get('content-type') || '';
  if (!ct.includes('application/json')) {
    return r.text().then(t => {
      throw new TypeError(`Expected JSON but got: ${ct || 'unknown'}\nBody: ${t.slice(0,300)}`);
    });
  }
  return Promise.resolve();
}

export async function fetchTrades(params?: { limit?: number; offset?: number }) {
  const qs = new URLSearchParams();
  if (params?.limit) qs.set('limit', String(params.limit));
  if (params?.offset) qs.set('offset', String(params.offset));
  const url = `${API}/trades${qs.toString() ? `?${qs}` : ''}`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000); // 8s timeout

  try {
    const r = await fetch(url, { signal: controller.signal });
    if (!r.ok) {
      const text = await r.text().catch(() => '');
      throw new Error(`HTTP ${r.status}: ${text.slice(0,300)}`);
    }
    await assertJson(r);
    const data = await r.json();
    // Normalize: API may return {items:[...]} or [...]
    return Array.isArray(data) ? data : (data.items ?? data);
  } finally {
    clearTimeout(timer);
  }
}