# TRENCHES + UI/UX SPEC (XIE Trading OS)

## Purpose
Build a Solana-first trading OS that is **Faster • Better • Cheaper • Sexier**:
- **Faster:** real-time WS feeds, one-click actions, minimal navigation.
- **Better:** safety + dev/insider + liquidity signals always visible.
- **Cheaper:** fewer failed trades via risk gates + presets + Jito path.
- **Sexier:** cyberpunk street-art × electric dance vibe, neon rails, hover-lift, punchy SFX.

---

## Core Modules
1) **Trenches** (3 columns: New / About to Graduate / Graduated)  
2) **Classifieds** (post-trenches browser: timeframe + sorting + filters)  
3) **Wallet** (groups + portfolio + positions tab)  
4) **Kill Shot** (snipers + execution drawer)  
5) **Token Creator**  
6) **Mint / Digital TCG Terminal**  
7) **Art Room**  
8) **Gallery** (community + art + music rooms)  
9) **Wallet Tracker** (bubble-map style)  
10) **Social Stocker**

---

## Visual / Brand Rules
### Global style
- “**More bio neon rails around everything**”
- Dense info cards: “everything important so I don’t miss something”
- Hover = card **lifts up** + neon glow intensifies
- UI vibe: **cyberpunk street art** + **electric dance** energy

### Colors
- Buys: **neon blue**
- Positive PnL: **neon green**
- Negative PnL: **neon red**
- Accent: **neon orange** (sparingly)

---

## Trenches (Definition)
### What it is
Trenches is the **fresh-token battlefield scanner**.
- Only tokens **1 second → 24 hours old**
- Not a “whole market view” — it’s a **new-token discovery terminal**

### 3 Columns (Locked)
1) **New Creations**
   - newly detected/created tokens
   - minimal history, highest risk
2) **About to Graduate**
   - nearing transition (**bonding curve close**, liquidity forming)
   - more signal, still high risk
3) **Graduated**
   - **LP created / curve completed / normal trading**
   - has history + wider signals

### Lifecycle + Migration
- Tokens start in **Trenches**
- Tokens leave Trenches when:
  - **age > 24h** OR
  - **Graduated trigger** (LP created / curve completed)
- Tokens leaving Trenches appear in **Classifieds**

---

## Classifieds (Post-Trenches Browser)
Classifieds is where you browse “the next layer” after Trenches.

### Timeframes (Locked)
- **1s / 10m / 1h / 1d / 1y**

### Sorting (Locked)
- **Market Cap**
- **Volume**
- **Momentum**

### Filters (Locked)
- Market cap range
- Liquidity range
- Safe / Not safe toggle
- Hover tooltips explain each filter

### UX
- Hover = **card lifts up**
- Feels like a “market browser”, not a list

---

## Token Card Spec (Must Match Reference Card)
This card style is the baseline (dense, readable, neon rails).

### Always-visible fields
- Token identity: name / symbol / CA (compact, copyable)
- Age / created time
- Market cap
- Liquidity
- Activity: buys/sells + recent momentum
- Safety meter (authorities, rug risk)
- Dev / insider holds + dev actions marker
- Small sparkline (optional)

### Safety & Risk Indicators
- Authorities status: mint revoked? freeze revoked?
- Rug risk meter: quick visual (quarters fill OK)
- Dev/insider risk: small icons + percent

### Per-token Chat
- Each token has **its own chat**
- Token card includes a quick **chat button**
- Dev/holder button can jump to chat context

---

## Navigation Layout
### Top Bar (Locked)
- Left: **logo**
- Top panel: **advertising slot**
- Trending coins strip in top area

### Right Rail (Vertical) — Locked order
1. Trenches
2. Classifieds
3. Wallet (contains Positions tab)
4. Kill Shot (snipers)
5. Token Creator
6. Mint / Digital TCG Terminal
7. Art Room
8. Wallet Tracker
9. Social Stocker
10. Gallery

### Rail Interaction (Locked)
- Icons are small emoji-style badges
- **Hold/press = tooltip label**
- **Click = opens a drawer or navigates**
- **Only one drawer open at a time**
  - clicking another closes current and opens the new one

---

## Wallet + Positions (Locked)
### Wallet is the hub
- Wallet contains:
  - Portfolio
  - **Positions tab** (Positions is NOT separate main nav)
  - Wallet Groups

### Wallet Groups
- User can:
  - create wallet groups
  - add “watch wallets”
  - select an “execution profile” per group

> Phantom is the active signer wallet. Groups organize settings + watchlists.

---

## Bottom Bar (Positions Ticker)
Small bar at bottom showing:
- active/open positions + past positions
- ticker + PnL%
- green for positive, red for negative
- click item jumps to Wallet → Positions tab → that token

---

## Kill Shot Drawer (Execution Cockpit)
Kill Shot is the trade execution panel for the currently selected token.

### Header
- token name/symbol + CA copy
- Phantom connection chip
- Status chips: SAFE/CAUTION, LP?, Curve %, Jito ON

### Bonding Curve Strip (Always visible)
- progress bar (% sold)
- current curve price
- stage: New / About to Graduate / Graduated

### Buy/Sell Panel
- amount presets
- slippage
- priority fee + Jito tip
- ARM toggle (required for snipers to fire)

### Snipers Section (Accordion)
- only one sniper expanded at a time
- compact cards when collapsed

#### Snipers (Locked set)
A) **Curve Snipe**
- triggers by curve progress % or curve price crossing target  
B) **Graduation Snipe**
- triggers when LP created / stage becomes Graduated  
C) **Momentum Snipe**
- triggers on volume/momentum thresholds, gated by stage/risk  
D) **Dev/Insider Reaction**
- reacts to dev buy/sell or insider spikes; can auto exit  

### Safety Gate Rule (Hard)
No sniper fires unless:
1) Phantom connected
2) Kill Shot is ARMED
3) Risk state is SAFE or user overrides CAUTION

---

## Phantom Wallet Placement (Locked)
1) **Top bar wallet chip** — connect/address/balance
2) **Wallet drawer header** — detailed wallet status + actions
3) **Kill Shot drawer** — connect required before arming/shooting

---

## Bonding Curve (Path B: Real Curve Logic)
Trenches row assignment must come from **real curve state**, not marketcap guesses.

### Minimum curve state contract
```ts
type CurveState = {
  stage: "new" | "about_to_graduate" | "graduated"
  progress: number // 0..1
  sold: number
  total: number
  priceSol: number
  lpCreated: boolean
}
```

### Graduation trigger
- definitive: `lpCreated === true`
- fallback: Raydium pool exists / LP creation detected

---

## XIE Engine (Intelligence)
XIE runs while:
- viewing a token card OR
- typing CA into XIE interface

XIE outputs:
- risk assumptions + rug checks
- dev/insider behavior flags
- confidence score + reasons
- sniper presets (slippage/fees/tip) for Kill Shot

---

## Audio + Visual Effects (Optional / Themed)
- arming = shotgun pump
- trade executed = .50 cal blapp
- sells = body bag zip
- chart markers:
  - Buy: neon green/blue “B”
  - Sell: neon red “S”
  - Dev actions: distinct marker
> Keep an option to disable audio.

---

## Required Token Data (Minimum)
- mint/CA, name, symbol, image
- timestamp/age
- market cap, liquidity, volume, momentum
- holders, top holder %
- mint authority revoked? freeze authority revoked?
- dev wallet activity (buys/sells)
- curve state: stage/progress/sold/total/price/lpCreated
- chat room id / token chat link

---

## Acceptance Checklist
- [ ] Only tokens <= 24h appear in Trenches
- [ ] Exactly 3 columns; tokens migrate correctly by curve stage
- [ ] Tokens leaving Trenches show in Classifieds
- [ ] Card matches reference: neon rails + dense always-visible safety/dev info
- [ ] Right rail: one drawer open at a time + tooltips on hold
- [ ] Wallet supports groups + watch wallets; Positions is a Wallet tab
- [ ] Bottom bar shows positions + correct PnL colors
- [ ] Kill Shot drawer contains curve strip + sniper accordion
- [ ] Phantom placed top bar + wallet drawer + kill shot gating

