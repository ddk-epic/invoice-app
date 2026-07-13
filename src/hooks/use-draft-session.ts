"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import {
  discardDraftAction,
  finalizeDraftAction,
  updateDraftAction,
} from "@/app/actions/server-actions";
import { log } from "@/diagnostics/log";
import { DraftInvoice, FinalizeResult } from "@/constants/types";

export type SaveStatus = "saved" | "unsaved" | "error";

type Phase = "editing" | "finalizing" | "finalized" | "discarding";

type FinalizeReason = Extract<FinalizeResult, { ok: false }>["reason"];

export type SessionFinalizeResult =
  { ok: true } | { ok: false; reason: FinalizeReason | "unsaved" };

const AUTOSAVE_INTERVAL_MS = 30_000;

export interface DraftSession {
  data: DraftInvoice;
  update: (updater: (prev: DraftInvoice) => DraftInvoice) => void;
  status: SaveStatus;
  saving: boolean;
  // Terminal transition in flight: lock finalize/discard controls.
  busy: boolean;
  saveNow: () => Promise<boolean>;
  finalize: () => Promise<SessionFinalizeResult>;
  discard: () => Promise<void>;
}

// Owns the draft state and its whole lifecycle: edits, autosave, manual save,
// finalize, discard. Every write path gates on a single phase, so autosave
// cannot race the terminal transitions.
export function useDraftSession(initial: DraftInvoice): DraftSession {
  const draftId = initial.id;
  const router = useRouter();

  const [data, setData] = useState(initial);

  // Fresh state for timers and unload listeners.
  const latestRef = useRef(data);
  useEffect(() => {
    latestRef.current = data;
  });

  const [phase, setPhaseState] = useState<Phase>("editing");
  const phaseRef = useRef<Phase>("editing");
  const setPhase = useCallback((next: Phase) => {
    phaseRef.current = next;
    setPhaseState(next);
  }, []);

  // Persisted snapshot mirrored as state so the badge reacts when a save lands.
  const [savedSnapshot, setSavedSnapshot] = useState(() =>
    JSON.stringify(initial)
  );
  const savedRef = useRef(savedSnapshot);
  const [failed, setFailed] = useState(false);
  const [saving, setSaving] = useState(false);
  const runningRef = useRef<Promise<boolean> | null>(null);

  const update = useCallback(
    (updater: (prev: DraftInvoice) => DraftInvoice) => {
      if (phaseRef.current !== "editing") return;
      setData(updater);
    },
    []
  );

  const drain = useCallback(async (): Promise<boolean> => {
    let ok = true;
    setSaving(true);
    try {
      // Re-read latest each pass: edits made mid-await are saved next loop.
      while (draftId) {
        const current = latestRef.current;
        const snapshot = JSON.stringify(current);
        if (snapshot === savedRef.current) {
          // Clean means persisted, even after a failure that was edited away.
          setFailed(false);
          break;
        }
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

  // Chain behind any in-flight drain instead of joining it: a joiner's edits
  // may postdate the running loop's last dirty check. The follow-up drain is
  // a no-op when clean.
  const runSave = useCallback((): Promise<boolean> => {
    const run = (runningRef.current ?? Promise.resolve(true)).then(() =>
      drain()
    );
    const tracked = run.finally(() => {
      if (runningRef.current === tracked) runningRef.current = null;
    });
    runningRef.current = tracked;
    return tracked;
  }, [drain]);

  const save = useCallback((): Promise<boolean> => {
    if (!draftId || phaseRef.current !== "editing") {
      return Promise.resolve(false);
    }
    return runSave();
  }, [draftId, runSave]);

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

  const finalize = useCallback(async (): Promise<SessionFinalizeResult> => {
    if (!draftId || phaseRef.current !== "editing") {
      return { ok: false, reason: "not_found" };
    }
    setPhase("finalizing");
    // Bypasses the phase gate: this flush is part of the transition itself.
    const saved = await runSave();
    if (!saved) {
      setPhase("editing");
      return { ok: false, reason: "unsaved" };
    }
    const result = await finalizeDraftAction(draftId);
    if (!result.ok) {
      setPhase("editing");
      return result;
    }
    setPhase("finalized");
    router.push(`/invoice/${result.number}/pdf`);
    return { ok: true };
  }, [draftId, runSave, router, setPhase]);

  const discard = useCallback(async () => {
    if (phaseRef.current !== "editing") return;
    setPhase("discarding");
    if (draftId) await discardDraftAction(draftId);
    router.push("/dashboard");
  }, [draftId, router, setPhase]);

  const status: SaveStatus = failed
    ? "error"
    : JSON.stringify(data) === savedSnapshot
      ? "saved"
      : "unsaved";

  const saveNow = useCallback(() => save(), [save]);

  return {
    data,
    update,
    status,
    saving,
    busy: phase !== "editing",
    saveNow,
    finalize,
    discard,
  };
}
