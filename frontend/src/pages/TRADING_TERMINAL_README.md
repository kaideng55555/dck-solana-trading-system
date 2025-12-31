# Trading Terminal (D16)

## Overview
Full-screen professional trading interface with 3-column layout and bottom trade execution module.

## Route

```
/terminal/:mint
```

Example: `/terminal/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v`

## Layout

### LEFT PANEL (20% width) - OrderFlowTape

- Real-time trade feed
- Color-coded events:
  - 🟢 BUY (cyan glow)
  - 🔴 SELL (pink glow)  
  - ⚡ SNIPE (gold glow)
  - 💧 LP ADD (purple glow)
  - 🔥 LP REMOVE (red glow)
- Auto-scroll toggle
- Trade size indicators (🐋 whale, 🦈 medium, 🐟 small)
- Live statistics counter

### CENTER PANEL (60% width) - TerminalChart

- Professional LiveChart integration
- Timeframe selector: 1m / 5m / 15m / 1h
- Overlays:
  - Bonding progress indicator
  - Depth walls (buy/sell)
- Quick Snipe button
- Auto-update toggle
- Price/volume/liquidity info bar

### RIGHT PANEL (20% width) - TokenInfoPanel

- Token metadata + logo
- Live price + 24h change
- Market stats grid:
  - Market cap
  - Liquidity
  - Volume 24h
  - Holders
- Bonding progress ring (SVG gradient)
- Sniper signals:
  - 🆕 FRESH (< 90s old)
  - 🎯 CURVE EDGE (> 96% bonding)
  - 📈 TRENDING UP (velocity > 70)
  - 🔥 HIGH VOLUME (> $50K)
- Risk badges:
  - Authority status
  - Liquidity health
- BUY/SELL action buttons
- Recent alerts for token

### BOTTOM PANEL (160px height) - TerminalTradeBox

- Amount input (SOL) with MAX button
- Slippage presets: 5% / 10% / 15% / 20%
- Priority fee presets: 0.0001 / 0.001 / 0.01 / 0.1 SOL
- ⚡ Jito MEV protection toggle
- BUY button (green neon pulse)
- SELL button (pink neon pulse)

## Features

### Real-time Data Integration

- Uses `useToken(mint)` from live feed system
- Auto-updates on token state changes
- Rug detection alerts if token disappears

### Trading Actions

- **Snipe**: Opens swap with turbo presets (10% slippage, Jito enabled)
- **Buy**: Opens swap modal (SOL → Token)
- **Sell**: Opens swap modal (Token → SOL)

### DCK Neon Theme

- Background: `#03040A`
- Gradient: `#FF3EBF → #9B00FF → #00E4FF`
- Glow effects on borders and buttons
- Pulsing animations on CTAs
- Graffiti spray drip dividers

## Mobile Handling

Shows warning message for screens < 1024px:
> "Trading Terminal requires a desktop browser for the best experience."

## Navigation

- Back button: Returns to Explorer
- Live connection indicator (top right)
- Route accessible from coin cards or direct URL

## Component Files
```
src/pages/TradingTerminal.tsx                   (Main page)
src/components/terminal/OrderFlowTape.tsx       (Left panel)
src/components/terminal/TerminalChart.tsx       (Center panel)
src/components/terminal/TokenInfoPanel.tsx      (Right panel)
src/components/terminal/TerminalTradeBox.tsx    (Bottom panel)
```

## Data Sources

- Token data: `useToken(mint)` from GlobalFeedStore
- Swap execution: `useSwapStore()` 
- Quick snipe: `useQuickSnipe()` hook
- Charts: `LiveChart` component with lightweight-charts
- Alerts: `useAlertsStore()` for rug detection

## TypeScript Safety

✅ All components fully typed with zero compilation errors
✅ Token type from `src/data/tokenTypes.ts`
✅ Proper null/undefined guards for missing token data

## Future Enhancements

- [ ] Real WebSocket order flow feed (currently mock)
- [ ] Depth chart overlay integration
- [ ] Position tracking and P&L display
- [ ] Multi-token comparison view
- [ ] Advanced order types (limit, stop-loss)
- [ ] Trading bot integration panel

---

**Status**: ✅ D16 Complete - All components created with 0 TypeScript errors
