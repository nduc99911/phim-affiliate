'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function Tracker() {
  const pathname = usePathname();

  useEffect(() => {
    // Không log ở môi trường local development để tránh rác data
    if (window.location.hostname === 'localhost') return;

    fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: pathname }),
    }).catch(err => console.log('Tracking failed', err));
  }, [pathname]);

  return null;
}
