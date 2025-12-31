// src/services/websocket.ts
import type { TokenPriceUpdate } from '../types/solana';

type Listener = (u: TokenPriceUpdate) => void;

function jitteredDelay(baseMs: number, attempt: number, capMs = 30000) {
  const exp = Math.min(capMs, baseMs * Math.pow(2, attempt));
  const jitter = Math.random() * 0.3;
  return Math.floor(exp * (1 - jitter));
}

export class WSService {
  private socket: WebSocket | null = null;
  private listeners = new Map<string, Set<Listener>>();
  private connected = false;
  private url: string;
  private attempts = 0;
  private connecting = false;

  private pingTimer: any = null;
  private livenessTimer: any = null;
  private outQ: any[] = [];
  private MAX_Q = 100;

  constructor() {
    const raw = (import.meta.env.VITE_WS_URL as string) || 'ws://localhost:8000';
    this.url = WSService.normalizeWSUrl(raw);
  }

  static normalizeWSUrl(raw: string): string {
    try {
      const u = new URL(raw);
      if (!u.pathname || u.pathname === '/') u.pathname = '/ws/feed';
      return u.toString();
    } catch {
      const base = raw.replace(/\/$/, '');
      return base.endsWith('/ws/feed') ? base : `${base}/ws/feed`;
    }
  }

  private startHeartbeat() {
    this.stopHeartbeat();
    const sendPing = () => {
      this.send({ type: 'ping', t: Date.now() });
      clearTimeout(this.livenessTimer);
      this.livenessTimer = setTimeout(() => {
        try { this.socket?.close(4000, 'pong-timeout'); } catch {}
      }, 10000);
    };
    sendPing();
    this.pingTimer = setInterval(sendPing, 25000);
  }

  private stopHeartbeat() {
    if (this.pingTimer) clearInterval(this.pingTimer);
    if (this.livenessTimer) clearTimeout(this.livenessTimer);
    this.pingTimer = null;
    this.livenessTimer = null;
  }

  private flush() {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) return;
    while (this.outQ.length) {
      const msg = this.outQ.shift();
      this.socket.send(JSON.stringify(msg));
    }
  }

  private scheduleReconnect(reason?: string) {
    let delay = jitteredDelay(1000, this.attempts, 30000);
    try {
      if (reason) {
        const data = JSON.parse(reason);
        if (typeof data?.retryAfterMs === 'number') {
          delay = Math.min(30000, Math.max(0, data.retryAfterMs));
        }
      }
    } catch {}
    this.attempts++;
    setTimeout(() => this.connect(), delay);
  }

  connect() {
    if (this.connected || this.socket || this.connecting) return;
    this.connecting = true;
    try {
      this.socket = new WebSocket(this.url);
      this.socket.onopen = () => {
        this.connecting = false;
        this.connected = true;
        this.attempts = 0;
        for (const mint of this.listeners.keys()) this.send({ type: 'subscribe', mint });
        this.flush();
        this.startHeartbeat();
      };
      this.socket.onclose = (ev) => {
        this.connected = false;
        this.connecting = false;
        this.stopHeartbeat();
        this.socket = null;
        this.scheduleReconnect(ev?.reason);
      };
      this.socket.onerror = () => {};
      this.socket.onmessage = (evt) => {
        try {
          const msg = JSON.parse(evt.data);
          if (msg?.type === 'pong') {
            if (this.livenessTimer) clearTimeout(this.livenessTimer);
            return;
          }
          if (msg?.type === 'token_price_update') {
            const update: TokenPriceUpdate = msg.payload;
            const ls = this.listeners.get(update.mint);
            if (ls) for (const cb of ls) cb(update);
          }
        } catch {}
      };
    } catch {
      this.connecting = false;
      this.scheduleReconnect();
    }
  }

  private send(obj: any) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(obj));
    } else {
      if (this.outQ.length >= this.MAX_Q) this.outQ.shift();
      this.outQ.push(obj);
    }
  }

  subscribeToToken(mint: string, cb: Listener) {
    if (!this.listeners.has(mint)) this.listeners.set(mint, new Set());
    this.listeners.get(mint)!.add(cb);
    if (!this.connected) this.connect();
    this.send({ type: 'subscribe', mint });
  }

  unsubscribeFromToken(mint: string, cb?: Listener) {
    if (!this.listeners.has(mint)) return;
    if (cb) this.listeners.get(mint)!.delete(cb);
    if (this.listeners.get(mint)!.size === 0) {
      this.listeners.delete(mint);
      this.send({ type: 'unsubscribe', mint });
    }
  }

  disconnect() {
    this.listeners.clear();
    this.stopHeartbeat();
    if (this.socket) { try { this.socket.close(); } catch {} }
    this.socket = null;
    this.connected = false;
    this.connecting = false;
    this.attempts = 0;
  }
}

export const wsService = new WSService();
