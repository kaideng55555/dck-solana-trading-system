/**
 * Multi-Wallet Trading Terminal Types (D11)
 * 
 * Type definitions for multi-wallet management system
 */

// =============================================
// WALLET
// =============================================

export interface Wallet {
  /** Unique wallet ID */
  id: string;
  
  /** Wallet name */
  name: string;
  
  /** Solana wallet address */
  address: string;
  
  /** Group ID this wallet belongs to */
  groupId: string | null;
  
  /** SOL balance */
  solBalance: number;
  
  /** Total USD value */
  usdBalance: number;
  
  /** Total PnL in USD */
  pnl: number;
  
  /** PnL percentage */
  pnlPercent: number;
  
  /** Trade history */
  history: WalletHistoryEntry[];
  
  /** Creation timestamp */
  createdAt: number;
  
  /** Custom tags */
  tags: string[];
  
  /** Private key (encrypted in real implementation) */
  privateKey?: string;
}

// =============================================
// WALLET GROUP
// =============================================

export interface WalletGroup {
  /** Unique group ID */
  id: string;
  
  /** Group name */
  name: string;
  
  /** Neon color for UI (hex) */
  color: string;
  
  /** Creation timestamp */
  createdAt: number;
}

// =============================================
// WALLET HISTORY ENTRY
// =============================================

export type WalletAction = 'BUY' | 'SELL' | 'SNIPE' | 'AUTO_SELL' | 'AUTO_BUY';
export type SniperType = 'S1' | 'S2' | 'S3' | 'S4' | 'S5' | 'S6' | null;
export type RiskLevel = 'CLEAN' | 'SAFE' | 'MEDIUM' | 'HIGH' | 'REKT';

export interface WalletHistoryEntry {
  /** Unique entry ID */
  id: string;
  
  /** Timestamp */
  timestamp: number;
  
  /** Action type */
  action: WalletAction;
  
  /** Token mint address */
  tokenMint: string;
  
  /** Token symbol */
  tokenSymbol: string;
  
  /** Amount in SOL or token units */
  amount: number;
  
  /** Execution price */
  price: number;
  
  /** PnL in USD (for sells) */
  pnl: number | null;
  
  /** PnL percentage */
  pnlPercent: number | null;
  
  /** Sniper module type */
  sniperType: SniperType;
  
  /** Confidence score (0-100) */
  confidence: number | null;
  
  /** Risk level */
  risk: RiskLevel;
  
  /** Transaction signature */
  signature?: string;
}

// =============================================
// WALLET SUMMARY
// =============================================

export interface WalletSummary {
  /** Total balance across all wallets (USD) */
  totalBalance: number;
  
  /** Total PnL (USD) */
  totalPnl: number;
  
  /** Total PnL percentage */
  totalPnlPercent: number;
  
  /** 1h PnL change */
  pnl1h: number;
  
  /** 24h PnL change */
  pnl24h: number;
  
  /** 7d PnL change */
  pnl7d: number;
  
  /** Best performing wallet ID */
  bestWalletId: string | null;
  
  /** Last snipe entry */
  lastSnipe: WalletHistoryEntry | null;
  
  /** Total number of trades */
  totalTrades: number;
  
  /** Success rate (0-100) */
  successRate: number;
}

// =============================================
// ACTIVE WALLET STATE
// =============================================

export interface ActiveWalletState {
  /** Currently selected wallet ID */
  activeWalletId: string | null;
  
  /** Timeline drawer open */
  timelineOpen: boolean;
  
  /** Sniper feed visible */
  sniperFeedVisible: boolean;
}

// =============================================
// WALLET STORE STATE
// =============================================

export interface WalletStoreState {
  /** All wallets */
  wallets: Record<string, Wallet>;
  
  /** All wallet groups */
  walletGroups: Record<string, WalletGroup>;
  
  /** Active wallet ID */
  activeWalletId: string | null;
  
  /** Timeline drawer open */
  timelineOpen: boolean;
  
  /** Sniper feed visible */
  sniperFeedVisible: boolean;
}

// =============================================
// WALLET STORE ACTIONS
// =============================================

export interface WalletStoreActions {
  addWallet: (wallet: Omit<Wallet, 'id' | 'createdAt' | 'history'>) => string;
  removeWallet: (walletId: string) => void;
  renameWallet: (walletId: string, name: string) => void;
  
  addGroup: (name: string, color: string) => string;
  renameGroup: (groupId: string, name: string) => void;
  deleteGroup: (groupId: string) => void;
  
  setActiveWallet: (walletId: string | null) => void;
  toggleTimeline: () => void;
  toggleSniperFeed: () => void;
  
  updateBalance: (walletId: string, solBalance: number, usdBalance: number) => void;
  updatePnL: (walletId: string, pnl: number, pnlPercent: number) => void;
  addHistory: (walletId: string, entry: Omit<WalletHistoryEntry, 'id'>) => void;
  
  getGroupWallets: (groupId: string) => Wallet[];
  getWallet: (walletId: string) => Wallet | undefined;
  getAllWallets: () => Wallet[];
  
  importWalletFromPrivateKey: (privateKey: string, name: string, groupId: string | null) => Promise<string>;
  importWalletFromSeed: (seed: string, name: string, groupId: string | null) => Promise<string>;
}

export type WalletStore = WalletStoreState & WalletStoreActions;
