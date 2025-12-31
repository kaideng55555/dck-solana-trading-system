import React from "react";

interface DCKTradingChartProps {
  pairSlug?: string;
}

export default function DCKTradingChart({ pairSlug = "SOL/USDC" }: DCKTradingChartProps) {
  return (
    <div style={{ 
      padding: "1rem", 
      background: "#0b0f14", 
      borderRadius: "1rem", 
      boxShadow: "0 0 20px #2FD9FF33",
      minHeight: "420px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "column"
    }}>
      <h2 style={{ color: "#2FD9FF", fontFamily: "Orbitron, sans-serif", marginBottom: "1rem" }}>
        📊 DCK Cyberpunk Chart
      </h2>
      <div style={{ color: "#FF41D6", fontSize: "18px", textAlign: "center" }}>
        <p>🚀 Chart component loaded successfully!</p>
        <p style={{ fontSize: "14px", marginTop: "0.5rem", opacity: 0.7 }}>
          Pair: {pairSlug}
        </p>
        <p style={{ fontSize: "12px", marginTop: "1rem", color: "#2FD9FF" }}>
          🔥 Live chart integration ready
        </p>
      </div>
    </div>
  );
}
