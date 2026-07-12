"use client";

import { Button } from "@/components/ui/button";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="grid min-h-screen place-items-center bg-slate-50 px-4">
      <div className="max-w-sm text-center">
        <h1 className="text-lg font-semibold text-slate-900">
          Etwas ist schiefgelaufen
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Die Seite konnte nicht geladen werden. Bitte versuchen Sie es erneut.
        </p>
        <Button className="mt-6" onClick={reset}>
          Erneut versuchen
        </Button>
      </div>
    </main>
  );
}
