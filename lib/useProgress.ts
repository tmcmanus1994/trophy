"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { supabase, USER_KEY } from "./supabase";
import type {
  Completion,
  ProgressEntry,
  ProgressMap,
  SyncState,
  Trophy,
  TrophyType,
} from "./types";

const TYPES: TrophyType[] = ["bronze", "silver", "gold", "platinum"];

const cacheKey = (slug: string) => `trophy:${USER_KEY}:${slug}`;
const pendingKey = (slug: string) => `trophy:${USER_KEY}:${slug}:pending`;

type PendingMap = Record<string, { item_type: string; entry: ProgressEntry }>;

function readJSON<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJSON(key: string, value: unknown) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage full or unavailable — in-memory state still works.
  }
}

/**
 * All progress state flows through here. Components never touch Supabase.
 *
 * Layers: React state (instant) -> localStorage (offline + cold load)
 * -> Supabase (background sync + realtime). Last write wins on updated_at.
 */
export function useProgress(gameSlug: string, trophies: Trophy[] = []) {
  const [progress, setProgress] = useState<ProgressMap>({});
  const [syncState, setSyncState] = useState<SyncState>(
    supabase ? "syncing" : "local"
  );
  const progressRef = useRef(progress);
  progressRef.current = progress;

  const applyLocal = useCallback(
    (updates: ProgressMap) => {
      setProgress((prev) => {
        const next = { ...prev, ...updates };
        writeJSON(cacheKey(gameSlug), next);
        return next;
      });
    },
    [gameSlug]
  );

  const pushEntry = useCallback(
    async (itemId: string, itemType: string, entry: ProgressEntry) => {
      if (!supabase) return;
      setSyncState("syncing");
      const { error } = await supabase.from("progress").upsert({
        user_key: USER_KEY,
        game_slug: gameSlug,
        item_id: itemId,
        item_type: itemType,
        done: entry.done,
        done_at: entry.done_at,
        source: entry.source,
        updated_at: entry.updated_at,
        // Only sent for counter items, so pre-migration databases (no value
        // column) keep working for plain toggles.
        ...(entry.value !== undefined ? { value: entry.value } : {}),
      });
      const pending = readJSON<PendingMap>(pendingKey(gameSlug), {});
      if (error) {
        pending[itemId] = { item_type: itemType, entry };
        writeJSON(pendingKey(gameSlug), pending);
        setSyncState("offline");
      } else {
        if (pending[itemId]) {
          delete pending[itemId];
          writeJSON(pendingKey(gameSlug), pending);
        }
        setSyncState("synced");
      }
    },
    [gameSlug]
  );

  const flushPending = useCallback(async () => {
    if (!supabase) return;
    const pending = readJSON<PendingMap>(pendingKey(gameSlug), {});
    for (const [itemId, { item_type, entry }] of Object.entries(pending)) {
      await pushEntry(itemId, item_type, entry);
    }
  }, [gameSlug, pushEntry]);

  // Mount: hydrate from localStorage, then reconcile with Supabase.
  useEffect(() => {
    const local = readJSON<ProgressMap>(cacheKey(gameSlug), {});
    setProgress(local);

    if (!supabase) return;

    let cancelled = false;

    const sync = async () => {
      setSyncState("syncing");
      let { data, error } = await supabase!
        .from("progress")
        .select("item_id, item_type, done, done_at, source, updated_at, value")
        .eq("user_key", USER_KEY)
        .eq("game_slug", gameSlug);

      // Databases that haven't run the value-column migration reject the
      // select — retry without it so everything else keeps working.
      if (error) {
        const retry = await supabase!
          .from("progress")
          .select("item_id, item_type, done, done_at, source, updated_at")
          .eq("user_key", USER_KEY)
          .eq("game_slug", gameSlug);
        data = retry.data as typeof data;
        error = retry.error;
      }

      if (cancelled) return;
      if (error) {
        setSyncState("offline");
        return;
      }

      const cached = readJSON<ProgressMap>(cacheKey(gameSlug), {});
      const merged: ProgressMap = { ...cached };
      const localNewer: Array<[string, ProgressEntry]> = [];

      for (const row of data ?? []) {
        const remote: ProgressEntry = {
          done: row.done,
          done_at: row.done_at,
          updated_at: row.updated_at,
          source: row.source,
          ...((row as { value?: number | null }).value != null
            ? { value: (row as { value?: number | null }).value! }
            : {}),
        };
        const localEntry = cached[row.item_id];
        if (!localEntry || localEntry.updated_at <= remote.updated_at) {
          merged[row.item_id] = remote;
        } else {
          localNewer.push([row.item_id, localEntry]);
        }
      }

      const remoteIds = new Set((data ?? []).map((r) => r.item_id));
      for (const [itemId, entry] of Object.entries(cached)) {
        if (!remoteIds.has(itemId)) localNewer.push([itemId, entry]);
      }

      setProgress(merged);
      writeJSON(cacheKey(gameSlug), merged);

      for (const [itemId, entry] of localNewer) {
        await pushEntry(itemId, itemId.includes("::") ? "step" : "trophy", entry);
      }
      await flushPending();
      if (!cancelled) setSyncState("synced");
    };

    sync();

    const channel = supabase
      .channel(`progress-${gameSlug}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "progress",
          filter: `game_slug=eq.${gameSlug}`,
        },
        (payload) => {
          const row = payload.new as {
            user_key?: string;
            item_id?: string;
            done?: boolean;
            done_at?: string | null;
            source?: "manual" | "psnprofiles";
            updated_at?: string;
            value?: number | null;
          };
          if (!row?.item_id || row.user_key !== USER_KEY) return;
          const current = progressRef.current[row.item_id];
          if (current && current.updated_at >= (row.updated_at ?? "")) return;
          const entry: ProgressEntry = {
            done: !!row.done,
            done_at: row.done_at ?? null,
            updated_at: row.updated_at ?? new Date().toISOString(),
            source: row.source ?? "manual",
            ...(row.value != null ? { value: row.value } : {}),
          };
          setProgress((prev) => {
            const next = { ...prev, [row.item_id!]: entry };
            writeJSON(cacheKey(gameSlug), next);
            return next;
          });
        }
      )
      .subscribe();

    const onOnline = () => {
      sync();
    };
    window.addEventListener("online", onOnline);

    return () => {
      cancelled = true;
      window.removeEventListener("online", onOnline);
      supabase?.removeChannel(channel);
    };
  }, [gameSlug, pushEntry, flushPending]);

  const isDone = useCallback(
    (itemId: string) => !!progress[itemId]?.done,
    [progress]
  );

  const getValue = useCallback(
    (itemId: string) => progress[itemId]?.value ?? 0,
    [progress]
  );

  const setValue = useCallback(
    (itemId: string, value: number) => {
      const now = new Date().toISOString();
      const prev = progressRef.current[itemId];
      const entry: ProgressEntry = {
        done: prev?.done ?? false,
        done_at: prev?.done_at ?? null,
        updated_at: now,
        source: "manual",
        value: Math.max(0, Math.floor(value)),
      };
      applyLocal({ [itemId]: entry });
      void pushEntry(
        itemId,
        itemId.includes("::") ? "step" : "trophy",
        entry
      );
    },
    [applyLocal, pushEntry]
  );

  const toggle = useCallback(
    (itemId: string, itemType: string = itemId.includes("::") ? "step" : "trophy") => {
      const now = new Date().toISOString();
      const nextDone = !progressRef.current[itemId]?.done;
      const entry: ProgressEntry = {
        done: nextDone,
        done_at: nextDone ? now : null,
        updated_at: now,
        source: "manual",
      };
      applyLocal({ [itemId]: entry });
      void pushEntry(itemId, itemType, entry);
    },
    [applyLocal, pushEntry]
  );

  const completion: Completion = useMemo(() => {
    const byType = Object.fromEntries(
      TYPES.map((t) => [t, { earned: 0, total: 0 }])
    ) as Completion["byType"];
    let earned = 0;
    for (const t of trophies) {
      byType[t.type].total += 1;
      if (progress[t.id]?.done) {
        byType[t.type].earned += 1;
        earned += 1;
      }
    }
    const total = trophies.length;
    return {
      earned,
      total,
      percent: total === 0 ? 0 : Math.round((earned / total) * 100),
      byType,
    };
  }, [trophies, progress]);

  return { isDone, toggle, getValue, setValue, completion, syncState };
}
