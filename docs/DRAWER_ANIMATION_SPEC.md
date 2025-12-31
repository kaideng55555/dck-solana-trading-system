# Drawer Animation Spec (XIE UI)

## Rule
**Only one drawer open at a time.**  
Clicking a different rail item closes current drawer and opens the next.

---

## Timings (recommended)
- Hover lift: **120ms**
- Tooltip pop (hold): **90ms**
- Drawer open: **180ms**
- Drawer close: **140ms**
- Fade overlay: **120ms**
- Spring/ease: `cubic-bezier(0.2, 0.9, 0.2, 1.0)`

---

## React logic (reference)

### State model
```ts
type DrawerId =
  | "killshot"
  | "wallet"
  | "walletTracker"
  | "tokenCreator"
  | "mint"
  | null;

type NavPage =
  | "trenches"
  | "classifieds"
  | "social"
  | "gallery"
  | "artRoom";

type UIState = {
  page: NavPage;
  openDrawer: DrawerId;
};
```

### One-at-a-time open behavior
```ts
function openDrawer(next: DrawerId) {
  setUI(prev => {
    if (prev.openDrawer === next) return { ...prev, openDrawer: null }; // toggle close
    return { ...prev, openDrawer: next };
  });
}
```

### Rail mapping
- Pages navigate immediately.
- Drawers call `openDrawer(id)`.

### Tooltip behavior
- On `pointerdown`, start timer (e.g. 350ms)
- If pointer still down after timer, show tooltip label
- On `pointerup` / `pointerleave`, hide tooltip

---

## Animation CSS hints
- Drawer uses `transform: translateX(100%)` -> `translateX(0)`
- Avoid layout thrash; only animate `transform` + `opacity`
- Use `will-change: transform`


