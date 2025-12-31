/**
 * useSFX Hook
 * 
 * React hook for playing sounds in components
 * Usage:
 *   const { play, toggle, setVolume } = useSFX();
 *   play('shotgun');
 */

import { useState, useEffect } from 'react';
import { SFX, SFXName } from './soundEngine';

export function useSFX() {
  const [enabled, setEnabled] = useState(SFX.enabled);
  const [volume, setVolumeState] = useState(SFX.volume);

  useEffect(() => {
    // Sync with SFX engine state
    const state = SFX.getState();
    setEnabled(state.enabled);
    setVolumeState(state.volume);
  }, []);

  const play = (name: SFXName) => {
    SFX.play(name);
  };

  const toggle = (on: boolean) => {
    SFX.toggle(on);
    setEnabled(on);
  };

  const setVolume = (v: number) => {
    SFX.setVolume(v);
    setVolumeState(v);
  };

  return {
    play,
    toggle,
    setVolume,
    enabled,
    volume,
  };
}

export default useSFX;
