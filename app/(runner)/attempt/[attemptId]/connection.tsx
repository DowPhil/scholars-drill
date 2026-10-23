"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { CheckCircle, WifiSlash } from "@phosphor-icons/react";

function subscribe(onChange: () => void) {
  window.addEventListener("online", onChange);
  window.addEventListener("offline", onChange);
  return () => {
    window.removeEventListener("online", onChange);
    window.removeEventListener("offline", onChange);
  };
}

/**
 * The connection states WEB-PRD 6.4 rule 8 and section 8 ask for: an
 * unmissable banner when the network drops, with answers still accepted, and
 * a brief confirmation when it comes back. A dropped connection must never
 * look like lost work.
 */
export function ConnectionBanner() {
  const online = useSyncExternalStore(subscribe, () => navigator.onLine, () => true);
  const [wasOffline, setWasOffline] = useState(false);
  const [showBack, setShowBack] = useState(false);

  useEffect(() => {
    if (!online) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setWasOffline(true);
      return;
    }
    if (!wasOffline) return;
    setShowBack(true);
    const id = setTimeout(() => {
      setShowBack(false);
      setWasOffline(false);
    }, 4000);
    return () => clearTimeout(id);
  }, [online, wasOffline]);

  if (!online) {
    return (
      <div role="alert" className="flex items-center gap-3 bg-bad px-4 py-3 text-sm font-medium text-on-brand sm:px-6">
        <WifiSlash size={20} weight="bold" aria-hidden className="shrink-0" />
        You are offline. Keep going: every answer is saved on this device and nothing is lost.
      </div>
    );
  }
  if (showBack) {
    return (
      <div role="status" className="flex items-center gap-3 bg-good-soft px-4 py-3 text-sm font-medium text-good sm:px-6">
        <CheckCircle size={20} weight="fill" aria-hidden className="shrink-0" />
        Back online. Your answers are all saved.
      </div>
    );
  }
  return null;
}

/**
 * The same attempt open in two tabs stays one attempt (WEB-PRD 8): a change
 * saved in one tab is applied in the other.
 */
export function useSyncAcrossTabs<T>(storageKey: string, apply: (saved: T) => void) {
  useEffect(() => {
    function onStorage(e: StorageEvent) {
      if (e.key !== storageKey || !e.newValue) return;
      try {
        apply(JSON.parse(e.newValue) as T);
      } catch {}
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [storageKey, apply]);
}
