"use client";

import { toast } from "sonner";

import type { WriteResult } from "@/constants/types";

export function notifyError(message: string): void {
  toast.error(message);
}

export function notifySuccess(message: string): void {
  toast.success(message);
}

export function notifyWrite(
  res: WriteResult,
  opts: { onOk?: () => void; success?: string } = {}
): void {
  if (!res.ok) {
    notifyError(
      res.error === "validation"
        ? "Bitte füllen Sie alle erforderlichen Felder aus."
        : "Konnte nicht gespeichert werden."
    );
    return;
  }
  if (opts.success) notifySuccess(opts.success);
  opts.onOk?.();
}

export function notifyDropped(count: number): void {
  if (count <= 0) return;
  toast.warning(
    count === 1
      ? "Ein Artikel konnte nicht geladen werden."
      : `${count} Artikel konnten nicht geladen werden.`
  );
}
