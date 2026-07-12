"use client";

import { useEffect } from "react";

import { notifyDropped } from "@/diagnostics/notify";

export function ServerWarnings({
  droppedProducts,
}: {
  droppedProducts: number;
}) {
  useEffect(() => {
    notifyDropped(droppedProducts);
  }, [droppedProducts]);
  return null;
}
