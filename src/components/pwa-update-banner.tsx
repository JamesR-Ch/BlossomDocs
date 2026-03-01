'use client';

import { useEffect, useState } from 'react';

export function PwaUpdateBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const [waiting, setWaiting] = useState<ServiceWorker | null>(null);

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    // Track controller changes so we can reload once the new SW takes over.
    let refreshing = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!refreshing) {
        refreshing = true;
        window.location.reload();
      }
    });

    navigator.serviceWorker.ready.then((registration) => {
      // Check if there is already a waiting worker on load
      // (user opened the tab after the update was detected).
      if (registration.waiting && navigator.serviceWorker.controller) {
        setWaiting(registration.waiting);
        setShowBanner(true);
      }

      // Listen for a new SW installing in the background.
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (!newWorker) return;

        newWorker.addEventListener('statechange', () => {
          // 'installed' + an existing controller = update is ready to activate.
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            setWaiting(newWorker);
            setShowBanner(true);
          }
        });
      });
    });
  }, []);

  const handleUpdate = () => {
    // Tell the waiting SW to skip waiting and become active.
    // The 'controllerchange' listener above will then reload the page.
    if (waiting) {
      waiting.postMessage({ type: 'SKIP_WAITING' });
    }
  };

  if (!showBanner) return null;

  return (
    <div
      role="alert"
      aria-live="polite"
      className="fixed bottom-4 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 rounded-xl border border-primary/20 bg-background/95 px-4 py-3 shadow-lg backdrop-blur-sm"
    >
      <span className="text-sm text-foreground">มีเวอร์ชันใหม่พร้อมใช้งาน</span>
      <button
        onClick={handleUpdate}
        className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground transition-opacity hover:opacity-90"
      >
        อัปเดตเลย
      </button>
      <button
        onClick={() => setShowBanner(false)}
        className="text-xs text-muted-foreground transition-colors hover:text-foreground"
        aria-label="ปิด"
      >
        ภายหลัง
      </button>
    </div>
  );
}
