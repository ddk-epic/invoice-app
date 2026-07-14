import * as React from "react";

import { cn } from "@/lib/utils";

// A single bordered bar with one shared focus ring, holding fused segments
// (borderless inputs, a static addon, a select) that read as one field.
function SharedInputBar({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "focus-within:border-ring focus-within:ring-ring/50 flex h-9 min-w-0 items-stretch overflow-hidden rounded-md border shadow-xs focus-within:ring-[3px]",
        className
      )}
    >
      {children}
    </div>
  );
}

// Borderless input segment. Width/flex are left to the caller.
function BarInput({ className, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      {...props}
      className={cn(
        "min-w-0 bg-transparent px-3 text-sm outline-none placeholder:text-gray-400",
        className
      )}
    />
  );
}

// Static, non-editable trailing segment (e.g. a currency or unit).
function BarAddon({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "flex items-center border-l bg-gray-50 px-2 text-sm text-gray-500",
        className
      )}
    >
      {children}
    </span>
  );
}

export { SharedInputBar, BarInput, BarAddon };
