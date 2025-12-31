/**
 * useAlerts Hook (D13)
 * 
 * Integration hook for global alerts system
 * Features:
 * - Simplified API for triggering alerts
 * - Pre-configured alert builders for common scenarios
 * - Compatible with all sniper modules
 * - Type-safe alert creation
 */

import { useCallback } from 'react';
import { useAlertsStore, type AlertType, type AlertLevel } from '../stores/alertsStore';

export const useAlerts = () => {
  const addAlert = useAlertsStore((s) => s.addAlert);

  // Generic alert
  const alert = useCallback((
    type: AlertType,
    level: AlertLevel,
    message: string,
    data?: any,
    duration?: number
  ) => {
    addAlert({ type, level, message, data, duration });
  }, [addAlert]);

  // Pre-configured alert builders
  const success = useCallback((message: string, data?: any) => {
    addAlert({ type: 'system', level: 'success', message, data });
  }, [addAlert]);

  const info = useCallback((message: string, data?: any) => {
    addAlert({ type: 'system', level: 'info', message, data });
  }, [addAlert]);

  const warning = useCallback((message: string, data?: any) => {
    addAlert({ type: 'system', level: 'warning', message, data });
  }, [addAlert]);

  const danger = useCallback((message: string, data?: any) => {
    addAlert({ type: 'system', level: 'danger', message, data });
  }, [addAlert]);

  // Sniper-specific alerts
  const sniperAlert = useCallback((message: string, level: AlertLevel = 'info', data?: any) => {
    addAlert({ type: 'sniper', level, message, data, duration: 7000 });
  }, [addAlert]);

  const sniperSuccess = useCallback((tokenSymbol: string, amount: number) => {
    addAlert({
      type: 'sniper',
      level: 'success',
      message: `Successfully sniped ${amount} ${tokenSymbol}`,
      data: { tokenSymbol, amount },
      duration: 10000,
    });
  }, [addAlert]);

  const sniperFailed = useCallback((tokenSymbol: string, reason: string) => {
    addAlert({
      type: 'sniper',
      level: 'danger',
      message: `Snipe failed: ${reason}`,
      data: { tokenSymbol, reason },
      duration: 8000,
    });
  }, [addAlert]);

  // Wallet alerts
  const walletAlert = useCallback((message: string, level: AlertLevel = 'info', data?: any) => {
    addAlert({ type: 'wallet', level, message, data });
  }, [addAlert]);

  const walletConnected = useCallback((address: string) => {
    addAlert({
      type: 'wallet',
      level: 'success',
      message: `Wallet connected: ${address.slice(0, 6)}...${address.slice(-4)}`,
      data: { address },
    });
  }, [addAlert]);

  const walletDisconnected = useCallback(() => {
    addAlert({
      type: 'wallet',
      level: 'info',
      message: 'Wallet disconnected',
    });
  }, [addAlert]);

  // LP alerts
  const lpAlert = useCallback((message: string, level: AlertLevel = 'info', data?: any) => {
    addAlert({ type: 'lp', level, message, data, duration: 8000 });
  }, [addAlert]);

  const lpRemoved = useCallback((tokenSymbol: string, amount: number) => {
    addAlert({
      type: 'lp',
      level: 'warning',
      message: `LP removed: ${tokenSymbol} (-${amount.toFixed(2)}%)`,
      data: { tokenSymbol, amount },
      duration: 12000,
    });
  }, [addAlert]);

  const lpLocked = useCallback((tokenSymbol: string, duration: string) => {
    addAlert({
      type: 'lp',
      level: 'success',
      message: `LP locked: ${tokenSymbol} for ${duration}`,
      data: { tokenSymbol, duration },
      duration: 6000,
    });
  }, [addAlert]);

  // Rug alerts
  const rugAlert = useCallback((message: string, data?: any) => {
    addAlert({ 
      type: 'rug', 
      level: 'danger', 
      message, 
      data,
      duration: 15000, // Keep rug warnings visible longer
    });
  }, [addAlert]);

  const rugWarning = useCallback((tokenSymbol: string, reason: string) => {
    addAlert({
      type: 'rug',
      level: 'danger',
      message: `🚨 RUG RISK: ${tokenSymbol} - ${reason}`,
      data: { tokenSymbol, reason },
      duration: 20000,
    });
  }, [addAlert]);

  // PnL alerts
  const pnlAlert = useCallback((message: string, level: AlertLevel = 'info', data?: any) => {
    addAlert({ type: 'pnl', level, message, data, duration: 8000 });
  }, [addAlert]);

  const pnlProfit = useCallback((amount: number, percent: number) => {
    addAlert({
      type: 'pnl',
      level: 'success',
      message: `Portfolio up $${amount.toFixed(2)} (+${percent.toFixed(2)}%)`,
      data: { amount, percent },
      duration: 10000,
    });
  }, [addAlert]);

  const pnlLoss = useCallback((amount: number, percent: number) => {
    addAlert({
      type: 'pnl',
      level: 'warning',
      message: `Portfolio down $${Math.abs(amount).toFixed(2)} (${percent.toFixed(2)}%)`,
      data: { amount, percent },
      duration: 10000,
    });
  }, [addAlert]);

  return {
    // Generic
    alert,
    success,
    info,
    warning,
    danger,

    // Sniper
    sniperAlert,
    sniperSuccess,
    sniperFailed,

    // Wallet
    walletAlert,
    walletConnected,
    walletDisconnected,

    // LP
    lpAlert,
    lpRemoved,
    lpLocked,

    // Rug
    rugAlert,
    rugWarning,

    // PnL
    pnlAlert,
    pnlProfit,
    pnlLoss,
  };
};

export default useAlerts;
