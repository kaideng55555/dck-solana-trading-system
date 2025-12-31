import React from "react";
import "../styles/trading-terminal.css";

import OrderFlowTape from "../components/terminal/OrderFlowTape";
import TerminalChartPanel from "../components/terminal/TerminalChartPanel";
import TerminalInfoPanel from "../components/terminal/TerminalInfoPanel";
import TerminalActionsPanel from "../components/terminal/TerminalActionsPanel";

export const TradingTerminal: React.FC = () => {
  return (
    <div className="trading-terminal-container">

      {/* Row 1 – Price Tape */}
      <div className="terminal-row row-tape">
        <OrderFlowTape />
      </div>

      {/* Row 2 – Chart */}
      <div className="terminal-row row-chart">
        <TerminalChartPanel />
      </div>

      {/* Row 3 – Info + Buy/Sell */}
      <div className="terminal-row row-bottom">
        <TerminalInfoPanel />
        <TerminalActionsPanel />
      </div>

    </div>
  );
};

export default TradingTerminal;
