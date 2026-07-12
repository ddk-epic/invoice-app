"use client";

import "./globals.css";

export default function GlobalError({
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <html lang="de">
      <body className="min-h-screen bg-slate-50 antialiased">
        <main className="grid min-h-screen place-items-center px-4">
          <div className="max-w-sm text-center">
            <h1 className="text-lg font-semibold text-slate-900">
              Etwas ist schiefgelaufen
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Die Anwendung konnte nicht geladen werden. Bitte versuchen Sie es
              erneut.
            </p>
            <button
              onClick={reset}
              className="mt-6 rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
            >
              Erneut versuchen
            </button>
          </div>
        </main>
      </body>
    </html>
  );
}
