/**
 * ChartTheme.ts
 * 
 * DCK Neon Chart Theme for Trading Charts
 * Colors: #FF3EBF (pink) → #9B00FF (purple) → #00E4FF (cyan)
 * 
 * Usage:
 * - background: Dark chart background
 * - gridColor: Purple grid with transparency
 * - axisText: Semi-transparent white text
 * - bullCandle: Cyan for bullish candles
 * - bearCandle: Pink for bearish candles
 * - wickColor: Semi-transparent white wicks
 * - volumeUp: Cyan volume bars (transparent)
 * - volumeDown: Pink volume bars (transparent)
 * - bondingLine: Gradient for bonding curve (cyan → pink)
 */

export const chartTheme = {
  background: "#07070A",
  gridColor: "#9B00FF33",
  axisText: "#FFFFFF88",
  bullCandle: "#00E4FF",
  bearCandle: "#FF3EBF",
  wickColor: "#FFFFFFAA",
  volumeUp: "#00E4FF55",
  volumeDown: "#FF3EBF55",
  bondingLine: {
    start: "#00E4FF",
    end: "#FF3EBF",
  },
};

/*npm install
npm run build
npm run preview*
 * Chart Theme Type
 */
export type ChartTheme = typeof chartTheme;

/**
 * Default export
 */
export default chartTheme;
