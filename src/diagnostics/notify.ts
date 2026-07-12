"use client";

import { toast } from "sonner";

export function notifyError(message: string): void {
  toast.error(message);
}

export function notifySuccess(message: string): void {
  toast.success(message);
}

export function notifyDropped(count: number): void {
  if (count <= 0) return;
  toast.warning(
    count === 1
      ? "Ein Artikel konnte nicht geladen werden."
      : `${count} Artikel konnten nicht geladen werden.`
  );
}
