# 🤖 Copilot Instructions for DCK Tools

Short guide for AI coding agents working in this repo. Focus on the existing patterns and do not invent new architectures.

## 🏗️ Big Picture

- **Frontend**: React 18 + TypeScript + Vite (`main.tsx`, `src/main.tsx`, `src/App.tsx`).
- **Backend**: FastAPI in `backend/main.py`, consumed via `services/api.ts` and `services/websocket.ts`.
- **Styling**: Tailwind (see `styles/dckNeonTheme.ts`, `styles/dckNeonTheme.css`, `styles/index.css`) with neon cyberpunk look.
- **UI Layers**:
  - Production components in `/components` (DCK‑prefixed, reusable, neon visuals).
  - Feature components in `src/components` (screens, panels, feature UIs).
- **Data/Logic Layers**:
  - Realtime + analyzers in `src/data`, `src/feed`, `src/live`.
  - Feature logic in `src/[feature]` (e.g. `sniper/`, `swap/`, `portfolio/`).
  - React adapters in `src/hooks` or `src/[feature]/hooks`.
  - Global state via Zustand stores in `src/stores`, `src/feed`, feature folders.

## 🔑 Key Flows & Services

- **Routing + Shell**: `src/App.tsx` wires routes like `/explorer`, `/terminal/:mint`, `/wallets`, `/portfolio`, `/alerts`, `/nft`, `/sniper` and mounts layout components (`DesktopSidebar`, `DesktopTopBar`, `MainContent`).
- **Token Feed**: realtime token data is discovered/normalized in `src/data` + `src/feed` and exposed to React via Zustand (see `src/feed/GlobalFeedStore.ts` and feed‑related hooks/components like `src/components/FeedList.tsx`).
- **Charts**: chart theme + live data hooks live in `src/charts` (`ChartTheme.ts`, `LiveChart.tsx`, `useChartData.ts`); production chart wrappers live in `/components` (`DCKTradingChart.tsx`, `DCKNeonChart.tsx`, etc.).
- **Wallets**: Solana/EVM wallet wiring is in `contexts/WalletContext.tsx`, `src/walletTerminal`, and `src/wallet`; follow existing adapters instead of adding new providers.
- **Backend integration**: use `services/api.ts` for REST and `services/websocket.ts` / `src/api/live.ts` for WS; do not call the FastAPI backend directly from components.

## 📜 Project Conventions (Must Follow)

### Components & Structure
- **Production Components** (`/components`): Must be prefixed with `DCK`. Use **named exports only**.
  ```tsx
  // ✅ Correct
  export const DCKHeader: React.FC = () => { ... }
  
  // ❌ Wrong
  export default DCKHeader;
  ```
- **Feature Components** (`src/components`): No prefix required. Default exports allowed.
  ```tsx
  // ✅ Both acceptable
  export default SwapModal;
  export const SwapModal: React.FC = () => { ... }
  ```

### Styling & Aesthetic
- **Tailwind Utilities Only**: No inline `style={}` objects. Use Tailwind classes.
- **Theme Constants**: Import from `styles/dckNeonTheme.ts`. Key colors from actual theme:
  ```typescript
  // Primary brand colors (from dckNeonTheme.ts)
  neonCyan = "#00F5FF"      // Primary accent (bright neon cyan)
  neonPink = "#FF1493"      // Secondary accent (hot pink)
  neonBlue = "#1E90FF"      // Electric blue
  neonPurple = "#8A2BE2"    // Blue violet
  neonOrange = "#FF9500"    // Warning
  neonYellow = "#FFD700"    // Highlights
  
  // Tailwind custom colors (from tailwind.config.js)
  neonPink = "#FF41D6"      // Used in CSS utilities
  neonCyan = "#00F5FF"      // Used in CSS utilities
  neonPurple = "#A855F7"    // Tailwind variant
  ```
- **Aesthetic Requirements**:
  - Dark backgrounds: `#0B0B0F` (main), `#161621` (cards), `#1D1D2A` (hover)
  - Neon text: Use `text-[#00F5FF]` or apply `neon-text` CSS class for glowing effect
  - Headers: Font family `Rubik Glitch` (preferred) or `Orbitron` (fallback) for cyberpunk aesthetic
  - Animations: Use Tailwind animation classes from config:
    - `animate-neonPulse` — Pulsing neon glow effect
    - `animate-glowPulse` — Glow animation for emphasis
    - `animate-goldPulse` — Gold highlight pulse
    - `animate-float` — Floating motion
    - `animate-scanline` — Retro scanline effect
  - CSS utility classes: `neon-text`, `neon-glow`, `neon-border` (from `dckNeonTheme.css`)
- **Gradients**: Use Tailwind utilities with neon colors:
  ```tsx
  <div className="bg-gradient-to-r from-[#00F5FF] via-[#8A2BE2] to-[#FF1493]">
  ```

### Sound Effects Integration
- **Always use `useSFX()` hook** for interactive elements (clicks, triggers, executions).
- **Sound types**: `shotgun`, `sniperReady`, `alert`, `buy`, `sell`, `rug`
- **Pattern**:
  ```tsx
  const { play } = useSFX();
  const handleAction = () => {
    play('shotgun'); // Play sound first
    executeAction(); // Then perform action
  };
  ```
- **No spam**: SFX engine has 150ms cooldown per sound type.

### State Management (Zustand)
- **Store Locations**: All stores in `/src/stores`, `/src/feed`, or `/src/[feature]`.
- **Naming**: Must end with `Store` (e.g., `swapStore.ts`, `walletStore.ts`).
- **Persistence**: Use `persist` middleware for user settings, wallet data, alert history.
  ```typescript
  import { create } from 'zustand';
  import { persist } from 'zustand/middleware';
  
  export const useMyStore = create(
    persist(
      (set, get) => ({ /* state */ }),
      { name: 'dck-my-feature-storage' }
    )
  );
  ```
- **No prop drilling**: Use Zustand selectors to minimize re-renders:
  ```tsx
  // ✅ Correct - specific selector
  const tokens = useGlobalFeedStore(state => state.tokens);
  
  // ❌ Wrong - subscribes to entire store
  const { tokens, subscribeTo, getToken } = useGlobalFeedStore();
  ```

### Environment Variables
- **Vite convention**: All env vars must be prefixed with `VITE_`
- **Access**: Use `import.meta.env.VITE_*` (NOT `process.env`)
- **Required vars**:
  - `VITE_SOLANA_RPC_URL` - Solana RPC endpoint
  - `VITE_API_URL` - Backend API URL (optional for mock mode)
  - `VITE_WS_URL` - WebSocket URL (optional for mock mode)
  - `VITE_NETWORK` - Network identifier (mainnet-beta/devnet)
- **Fallbacks**: Always provide devnet fallbacks for development:
  ```typescript
  const RPC = import.meta.env.VITE_SOLANA_RPC_URL || 'https://api.devnet.solana.com';
  ```

### Data Validation (Critical)
- **Real-time data is ALWAYS nullable**. Guard against missing fields:
  ```tsx
  // ✅ Correct
  if (!token.price || !token.market?.marketCap) {
    return <LoadingState />;
  }
  
  // ❌ Wrong - will crash on missing data
  const formatted = `$${token.market.marketCap.toFixed(2)}`;
  ```
- **Use TypeScript optional chaining**: `token.metadata?.name ?? 'Unknown'`
- **Analyzers add computed fields**: Check `src/data/*.md` (e.g. `AUTHORITY_ANALYZER_USAGE.md`, `LIQUIDITY_ANALYZER_SUMMARY.md`) for available computed fields like `authorityRiskScore`, `bondingProgress`, and liquidity scores; reuse them instead of recomputing.

## 💻 Workflows

- **Frontend dev**: use `npm run dev` from repo root (Vite on `http://localhost:5173`).
- **Backend dev**: use the VS Code task `backend:python (8000)` or run `uvicorn main:app --reload` inside `backend/`.
- **Full stack**: run VS Code task `run:backend+frontend`.
- **Tests**: `npm test` / `npm run test:run` (Vitest; setup in `src/test/setup.ts`). Prefer testing pure logic (analyzers, sniper/swap engines, Zustand stores) over UI.
- **Static checks**: `npm run lint`, `npm run type-check` (ESLint flat config in `eslint.config.js`).

## 🔍 Patterns to Follow

- **Logic → Hook → UI** for complex features:
  - Logic in `src/[feature]` (e.g. `src/sniper/curveEdgeSniper.ts`, `src/swap/jupiterClient.ts`).
  - Hook in `src/[feature]/hooks` or `src/hooks` (e.g. `useCurveEdgeSniper.ts`, `useSwapEngine.ts`).
  - UI in `src/components` or `/components` (e.g. `CurveSniperPanel.tsx`, `SniperBot.tsx`, `DCKTradingChart.tsx`).
- **Realtime feed usage**: components should consume data via Zustand selectors (e.g. `useGlobalFeedStore(state => state.tokens)`) and never talk directly to websocket clients.
- **Sound FX**: always go through `src/sfx/useSFX` in interactive components (e.g. `SnipeButton`, sniper panels) and respect the cooldown.
- **Neon UX**: keep new UI aligned with existing neon gradients, `neon-text` / `neon-border` classes, and motion (`animate-neonPulse`, `animate-float`).

## 🗂️ Good Entry Points

- `src/App.tsx` – routing, layout shell, feed/loader wiring.
- `src/components/TradingDashboard.tsx`, `src/components/FeedList.tsx` – how feeds and cards are composed.
- `src/charts/*` – chart data flow and theming.
- `src/data/*Analyzer*.ts`, `src/data/*.md` – risk/liquidity/bonding analyzers and docs.
- `src/feed/GlobalFeedStore.ts`, `src/stores/*Store.ts` – global state patterns.
- `components/DCKNeonChart.tsx`, `components/TokenCard.tsx` – production neon components.
