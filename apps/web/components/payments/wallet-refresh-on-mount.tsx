'use client';

import { useEffect } from 'react';

export function WalletRefreshOnMount() {
  useEffect(() => {
    const delays = [0, 1500, 4000, 8000];
    const timers = delays.map((delay) =>
      window.setTimeout(() => {
        window.dispatchEvent(new CustomEvent('mentormind:wallet-refresh'));
      }, delay),
    );
    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, []);

  return null;
}
