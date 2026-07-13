"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { updateDraftAction } from "@/app/actions/server-actions";
import { log } from "@/diagnostics/log";
import { DraftInvoice } from "@/constants/types";

export type SaveStatus = "saved" | "unsaved" | "error";

const AUTOSAVE_INTERVAL_MS = 30_000;

export interface Autosave {
  status: SaveStatus;
  saving: boolean;
  saveNow: () => Promise<boolean>;
  beginDiscard: () => void;
}

export function useAutosave(data: DraftInvoice): Autosave {
  const draftId = data.id;

  // Fresh state for timers and unload listeners.
  const latestRef = useRef(data);
  useEffect(() => {
    latestRef.current = data;
  });

  // Persisted snapshot mirrored as state so the badge reacts when a save lands.
  const [savedSnapshot, setSavedSnapshot] = useState(() =>
    JSON.stringify(data)
  );
  const savedRef = useRef(savedSnapshot);
  const [failed, setFailed] = useState(false);
  const [saving, setSaving] = useState(false);
  const runningRef = useRef<Promise<boolean> | null>(null);
  const discardingRef = useRef(false);

  const drain = useCallback(async (): Promise<boolean> => {
    let ok = true;
    setSaving(true);
    try {
      // Re-read latest each pass: edits made mid-await are saved next loop.
      while (draftId) {
        const current = latestRef.current;
        const snapshot = JSON.stringify(current);
        if (snapshot === savedRef.current) break;
        const res = await updateDraftAction(draftId, current);
        if (!res.ok) {
          ok = false;
          setFailed(true);
          log("error", "autosave_failed", { draftId });
          break;
        }
        savedRef.current = snapshot;
        setSavedSnapshot(snapshot);
        setFailed(false);
      }
    } finally {
      setSaving(false);
    }
    return ok;
  }, [draftId]);

  const save = useCallback((): Promise<boolean> => {
    if (!draftId || discardingRef.current) return Promise.resolve(false);
    // Single write in flight; concurrent callers join the running drain.
    if (runningRef.current) return runningRef.current;
    // Clear via microtask so it always runs after the assignment below, even
    // when drain resolves synchronously (nothing dirty).
    const p = drain().finally(() => {
      runningRef.current = null;
    });
    runningRef.current = p;
    return p;
  }, [draftId, drain]);

  // Periodic insurance behind the manual save.
  useEffect(() => {
    if (!draftId) return;
    const id = setInterval(() => save(), AUTOSAVE_INTERVAL_MS);
    return () => clearInterval(id);
  }, [draftId, save]);

  // Best-effort flush when the tab is hidden or the editor unmounts.
  useEffect(() => {
    if (!draftId) return;
    const flush = () => void save();
    const onVisibility = () => {
      if (document.visibilityState === "hidden") flush();
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      flush();
    };
  }, [draftId, save]);

  const status: SaveStatus = failed
    ? "error"
    : JSON.stringify(data) === savedSnapshot
      ? "saved"
      : "unsaved";

  const saveNow = useCallback(() => save(), [save]);
  const beginDiscard = useCallback(() => {
    discardingRef.current = true;
  }, []);

  return { status, saving, saveNow, beginDiscard };
}
