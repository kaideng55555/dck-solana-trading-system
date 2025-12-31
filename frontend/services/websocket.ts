import { io, Socket } from 'socket.io-client';
import type { 
  TokenPriceUpdate, 
  NewMintEvent, 
  AuthorityEvent, 
  LiquidityEvent, 
  TokenData,
  SnipeOpportunity
} from '../types/solana';

class WebSocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  connect() {
    const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8000';
    
    this.socket = io(WS_URL, {
      autoConnect: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: this.maxReconnectAttempts,
    });

    this.socket.on('connect', () => {
      console.log('Connected to WebSocket server');
      this.reconnectAttempts = 0;
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from WebSocket server');
    });

    this.socket.on('connect_error', () => {
      this.reconnectAttempts++;
      console.log(`WebSocket connection failed. Attempt ${this.reconnectAttempts}`);
    });

    return this.socket;
  }

  // Subscribe to Solana token price updates
  subscribeToTokenPrice(mintAddress: string, callback: (data: TokenPriceUpdate) => void) {
    if (!this.socket) return;
    
    this.socket.emit('subscribe_solana_price', { mintAddress });
    this.socket.on(`solana_price_update_${mintAddress}`, callback);
  }

  // Subscribe to new Solana token mints
  subscribeToNewMints(callback: (data: NewMintEvent) => void) {
    if (!this.socket) return;
    
    this.socket.on('solana_new_mint', callback);
  }

  // Subscribe to Solana freeze/authority events
  subscribeToAuthorityEvents(callback: (data: AuthorityEvent) => void) {
    if (!this.socket) return;
    
    this.socket.on('solana_authority_event', callback);
  }

  // Subscribe to Solana snipe opportunities
  subscribeToSnipeOpportunities(callback: (data: SnipeOpportunity) => void) {
    if (!this.socket) return;
    
    this.socket.on('solana_snipe_opportunity', callback);
  }

  // Subscribe to liquidity pool events
  subscribeLiquidityEvents(callback: (data: LiquidityEvent) => void) {
    if (!this.socket) return;
    
    this.socket.on('solana_liquidity_event', callback);
  }

  // Subscribe to token age-based filtering
  subscribeToTokensByAge(maxAgeHours: number, callback: (data: TokenData[]) => void) {
    if (!this.socket) return;
    
    this.socket.emit('subscribe_tokens_by_age', { maxAgeHours });
    this.socket.on('tokens_by_age_update', callback);
  }

  // Subscribe to bonding curve progress (tokens approaching graduation)
  subscribeToBondingCurve(callback: (data: TokenData) => void) {
    if (!this.socket) return;
    
    this.socket.emit('subscribe_bonding_curve');
    this.socket.on('bonding_curve_update', callback);
  }

  // Subscribe to graduated tokens (completed bonding curve)
  subscribeToGraduatedTokens(callback: (data: TokenData) => void) {
    if (!this.socket) return;
    
    this.socket.emit('subscribe_graduated_tokens');
    this.socket.on('graduated_token_update', callback);
  }

  // Unsubscribe from Solana token updates
  unsubscribeFromToken(mintAddress: string) {
    if (!this.socket) return;
    
    this.socket.emit('unsubscribe_solana_price', { mintAddress });
    this.socket.off(`solana_price_update_${mintAddress}`);
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}

export const wsService = new WebSocketService();
export default wsService;