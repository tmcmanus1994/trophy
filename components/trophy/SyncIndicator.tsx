"use client";

import type { SyncState } from "@/lib/types";

const LABELS: Record<SyncState, string> = {
  synced: "Synced",
  syncing: "Syncing",
  offline: "Offline — saved on this device",
  local: "Local only",
};

export function SyncIndicator({ state }: { state: SyncState }) {
  return (
    <span className={`sync-indicator sync-${state}`} aria-live="polite">
      <span className="sync-dot" aria-hidden="true" />
      {LABELS[state]}
    </span>
  );
}
