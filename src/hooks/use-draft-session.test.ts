// @vitest-environment jsdom
import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  discardDraftAction,
  finalizeDraftAction,
  updateDraftAction,
} from "@/app/actions/server-actions";
import { DraftInvoice, FinalizeResult, WriteResult } from "@/constants/types";
import { Contact } from "@/lib/contacts";
import {
  useDraftSession,
  type DraftSession,
  type SessionFinalizeResult,
} from "@/hooks/use-draft-session";

const routerPush = vi.hoisted(() => vi.fn());

vi.mock("@/app/actions/server-actions", () => ({
  updateDraftAction: vi.fn(),
  finalizeDraftAction: vi.fn(),
  discardDraftAction: vi.fn(),
}));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: routerPush }),
}));
vi.mock("@/diagnostics/log", () => ({ log: vi.fn() }));

const updateDraft = vi.mocked(updateDraftAction);
const finalizeDraft = vi.mocked(finalizeDraftAction);
const discardDraft = vi.mocked(discardDraftAction);

(
  globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

const contact: Contact = {
  id: 1,
  type: "customer",
  name: "Acme GmbH",
  address: {
    street: "Weg 1",
    city: "Berlin",
    state: "BE",
    zip: 10115,
    country: "DE",
  },
};

function makeDraft(overrides: Partial<DraftInvoice> = {}): DraftInvoice {
  return {
    id: 7,
    invoiceId: "",
    invoiceDate: "2026-07-01",
    dueDate: "2026-07-15",
    status: "draft",
    locationId: null,
    sender: null,
    sendTo: contact,
    invoiceTo: contact,
    items: [{ productId: 1, quantity: 2 }],
    total: 10,
    taxRate: 7,
    createdAt: new Date("2026-07-01T00:00:00Z"),
    updatedAt: new Date("2026-07-01T00:00:00Z"),
    ...overrides,
  };
}

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((r) => {
    resolve = r;
  });
  return { promise, resolve };
}

function renderSession(draft = makeDraft()) {
  return renderHook(() => useDraftSession(draft));
}

const bumpTax = (result: { current: DraftSession }) =>
  act(() =>
    result.current.update((prev) => ({ ...prev, taxRate: prev.taxRate + 1 }))
  );

beforeEach(() => {
  vi.clearAllMocks();
  updateDraft.mockResolvedValue({ ok: true });
  finalizeDraft.mockResolvedValue({ ok: true, number: "42" });
  discardDraft.mockResolvedValue(true);
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe("useDraftSession", () => {
  it("starts saved with no pending work", () => {
    const { result } = renderSession();
    expect(result.current.status).toBe("saved");
    expect(result.current.saving).toBe(false);
    expect(result.current.busy).toBe(false);
    expect(updateDraft).not.toHaveBeenCalled();
  });

  describe("save", () => {
    it("marks edits unsaved and persists them on saveNow", async () => {
      const { result } = renderSession();
      bumpTax(result);
      expect(result.current.status).toBe("unsaved");

      let ok = false;
      await act(async () => {
        ok = await result.current.saveNow();
      });

      expect(ok).toBe(true);
      expect(updateDraft).toHaveBeenCalledWith(
        7,
        expect.objectContaining({ taxRate: 8 })
      );
      expect(result.current.status).toBe("saved");
    });

    it("skips the server when nothing changed", async () => {
      const { result } = renderSession();
      let ok = false;
      await act(async () => {
        ok = await result.current.saveNow();
      });
      expect(ok).toBe(true);
      expect(updateDraft).not.toHaveBeenCalled();
    });

    it("persists edits made while a save is in flight", async () => {
      const first = deferred<WriteResult>();
      updateDraft.mockReturnValueOnce(first.promise);
      const { result } = renderSession();
      bumpTax(result);

      let save!: Promise<boolean>;
      act(() => {
        save = result.current.saveNow();
      });
      await act(async () => {});
      expect(updateDraft).toHaveBeenCalledTimes(1);

      act(() => result.current.update((prev) => ({ ...prev, taxRate: 9 })));
      await act(async () => {
        first.resolve({ ok: true });
        await save;
      });

      expect(updateDraft).toHaveBeenCalledTimes(2);
      expect(updateDraft).toHaveBeenLastCalledWith(
        7,
        expect.objectContaining({ taxRate: 9 })
      );
      expect(result.current.status).toBe("saved");
    });

    it("chains a follow-up drain for callers arriving mid-flight", async () => {
      const first = deferred<WriteResult>();
      updateDraft.mockReturnValueOnce(first.promise);
      const { result } = renderSession();
      bumpTax(result);

      let a!: Promise<boolean>;
      let b!: Promise<boolean>;
      act(() => {
        a = result.current.saveNow();
      });
      await act(async () => {});
      act(() => {
        b = result.current.saveNow();
      });

      let okA = false;
      let okB = false;
      await act(async () => {
        first.resolve({ ok: true });
        [okA, okB] = await Promise.all([a, b]);
      });

      expect(okA).toBe(true);
      expect(okB).toBe(true);
      // Trailing drain found clean state: no duplicate write.
      expect(updateDraft).toHaveBeenCalledTimes(1);
    });
  });

  describe("failure handling", () => {
    it("reports error status and recovers on the next save", async () => {
      updateDraft.mockResolvedValueOnce({ ok: false, error: "db" });
      const { result } = renderSession();
      bumpTax(result);

      let ok = true;
      await act(async () => {
        ok = await result.current.saveNow();
      });
      expect(ok).toBe(false);
      expect(result.current.status).toBe("error");

      await act(async () => {
        ok = await result.current.saveNow();
      });
      expect(ok).toBe(true);
      expect(result.current.status).toBe("saved");
    });

    it("clears the error when the failed edit is reverted", async () => {
      updateDraft.mockResolvedValueOnce({ ok: false, error: "db" });
      const { result } = renderSession();
      bumpTax(result);
      await act(async () => {
        await result.current.saveNow();
      });
      expect(result.current.status).toBe("error");

      act(() => result.current.update((prev) => ({ ...prev, taxRate: 7 })));
      let ok = false;
      await act(async () => {
        ok = await result.current.saveNow();
      });

      expect(ok).toBe(true);
      expect(updateDraft).toHaveBeenCalledTimes(1);
      expect(result.current.status).toBe("saved");
    });
  });

  describe("autosave triggers", () => {
    it("saves dirty state on the interval and skips clean ticks", async () => {
      vi.useFakeTimers();
      const { result } = renderSession();
      bumpTax(result);

      await act(async () => {
        await vi.advanceTimersByTimeAsync(30_000);
      });
      expect(updateDraft).toHaveBeenCalledTimes(1);

      await act(async () => {
        await vi.advanceTimersByTimeAsync(30_000);
      });
      expect(updateDraft).toHaveBeenCalledTimes(1);
    });

    it("flushes when the tab becomes hidden", async () => {
      const { result } = renderSession();
      bumpTax(result);

      Object.defineProperty(document, "visibilityState", {
        configurable: true,
        value: "hidden",
      });
      await act(async () => {
        document.dispatchEvent(new Event("visibilitychange"));
      });
      Reflect.deleteProperty(document, "visibilityState");

      expect(updateDraft).toHaveBeenCalledWith(
        7,
        expect.objectContaining({ taxRate: 8 })
      );
    });

    it("flushes pending edits on unmount", async () => {
      const { result, unmount } = renderSession();
      bumpTax(result);

      unmount();
      await act(async () => {});

      expect(updateDraft).toHaveBeenCalledWith(
        7,
        expect.objectContaining({ taxRate: 8 })
      );
    });
  });

  describe("finalize", () => {
    it("flushes, finalizes and navigates to the invoice pdf", async () => {
      const { result } = renderSession();
      bumpTax(result);

      let res!: SessionFinalizeResult;
      await act(async () => {
        res = await result.current.finalize();
      });

      expect(updateDraft).toHaveBeenCalledTimes(1);
      expect(finalizeDraft).toHaveBeenCalledWith(7);
      expect(routerPush).toHaveBeenCalledWith("/invoice/42/pdf");
      expect(res).toEqual({ ok: true });
      expect(result.current.busy).toBe(true);
    });

    it("locks edits and saves once finalized", async () => {
      vi.useFakeTimers();
      const { result } = renderSession();
      await act(async () => {
        await result.current.finalize();
      });

      act(() => result.current.update((prev) => ({ ...prev, taxRate: 99 })));
      expect(result.current.data.taxRate).toBe(7);

      let ok = true;
      await act(async () => {
        ok = await result.current.saveNow();
      });
      expect(ok).toBe(false);

      await act(async () => {
        await vi.advanceTimersByTimeAsync(60_000);
      });
      expect(updateDraft).not.toHaveBeenCalled();
    });

    it("drops edits made while finalizing", async () => {
      const pending = deferred<FinalizeResult>();
      finalizeDraft.mockReturnValue(pending.promise);
      const { result } = renderSession();

      let fin!: Promise<SessionFinalizeResult>;
      act(() => {
        fin = result.current.finalize();
      });
      await act(async () => {});
      expect(result.current.busy).toBe(true);

      act(() => result.current.update((prev) => ({ ...prev, taxRate: 99 })));
      expect(result.current.data.taxRate).toBe(7);

      await act(async () => {
        pending.resolve({ ok: true, number: "42" });
        await fin;
      });
      expect(updateDraft).not.toHaveBeenCalled();
    });

    it("does not finalize when the flush fails", async () => {
      updateDraft.mockResolvedValue({ ok: false, error: "db" });
      const { result } = renderSession();
      bumpTax(result);

      let res!: SessionFinalizeResult;
      await act(async () => {
        res = await result.current.finalize();
      });

      expect(res).toEqual({ ok: false, reason: "unsaved" });
      expect(finalizeDraft).not.toHaveBeenCalled();
      expect(result.current.busy).toBe(false);
    });

    it("returns to editing when the server rejects", async () => {
      finalizeDraft.mockResolvedValue({ ok: false, reason: "not_finalizable" });
      const { result } = renderSession();

      let res!: SessionFinalizeResult;
      await act(async () => {
        res = await result.current.finalize();
      });

      expect(res).toEqual({ ok: false, reason: "not_finalizable" });
      expect(routerPush).not.toHaveBeenCalled();
      expect(result.current.busy).toBe(false);

      bumpTax(result);
      expect(result.current.status).toBe("unsaved");
    });
  });

  describe("discard", () => {
    it("deletes the draft and navigates to the dashboard", async () => {
      const { result } = renderSession();
      await act(async () => {
        await result.current.discard();
      });
      expect(discardDraft).toHaveBeenCalledWith(7);
      expect(routerPush).toHaveBeenCalledWith("/dashboard");
    });

    it("suppresses the unmount flush after discard", async () => {
      const { result, unmount } = renderSession();
      bumpTax(result);
      await act(async () => {
        await result.current.discard();
      });

      unmount();
      await act(async () => {});

      expect(updateDraft).not.toHaveBeenCalled();
    });
  });

  describe("without a draft id", () => {
    it("never saves and discard still navigates", async () => {
      const { result } = renderSession(makeDraft({ id: undefined }));
      bumpTax(result);

      let ok = true;
      await act(async () => {
        ok = await result.current.saveNow();
      });
      expect(ok).toBe(false);

      await act(async () => {
        await result.current.discard();
      });

      expect(discardDraft).not.toHaveBeenCalled();
      expect(routerPush).toHaveBeenCalledWith("/dashboard");
      expect(updateDraft).not.toHaveBeenCalled();
    });
  });
});
