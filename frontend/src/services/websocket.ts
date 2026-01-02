type Unsub = () => void;

class WSClient {
  private base = (import.meta as any).env?.VITE_WS_BASE || "";

  subscribe(path: string, onMsg: (data: any) => void): Unsub {
    const url = this.base ? `${this.base}${path}` : path;
    const sock = new WebSocket(url);

    sock.onmessage = (ev) => {
      try { onMsg(JSON.parse(ev.data)); } catch {}
    };

    return () => { try { sock.close(); } catch {} };
  }
}

export const ws = new WSClient();
