"use client";

import { Settings, BookCheck, Trash2, Save, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";

import { Profile } from "@/constants/types";
import { canFinalize } from "@/lib/invoice";
import { notifyError, notifySuccess } from "@/diagnostics/notify";
import {
  type DraftSession,
  type SaveStatus,
  type SessionFinalizeResult,
} from "@/hooks/use-draft-session";

function SaveBadge({ status }: { status: SaveStatus }) {
  if (status === "error") {
    return (
      <span className="flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-sm font-medium text-rose-600 shadow">
        <span className="size-2 rounded-full bg-rose-500" />
        Speichern fehlgeschlagen
      </span>
    );
  }
  if (status === "unsaved") {
    return (
      <span className="flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-sm text-amber-600 shadow">
        <span className="size-2 rounded-full bg-amber-500" />
        Nicht gespeichert
      </span>
    );
  }
  return (
    <span className="flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-sm text-slate-500 shadow">
      <Check className="size-4 text-emerald-600" />
      Gespeichert
    </span>
  );
}

interface OptionsbarProps {
  privateContact: Profile;
  session: DraftSession;
}

type FinalizeError = Extract<SessionFinalizeResult, { ok: false }>["reason"];

function finalizeError(reason: FinalizeError): string {
  switch (reason) {
    case "unsaved":
      return "Entwurf konnte nicht gespeichert werden.";
    case "not_finalizable":
      return "Bitte fügen Sie mindestens einen Artikel hinzu.";
    case "no_profile":
    case "no_location":
      return "Absenderprofil ist unvollständig.";
    default:
      return "Rechnung konnte nicht finalisiert werden.";
  }
}

function Optionsbar(props: OptionsbarProps) {
  const { privateContact, session } = props;
  const { data: invoiceData, status, saving, busy } = session;

  const finalizable = canFinalize(invoiceData);

  const handleSave = async () => {
    const ok = await session.saveNow();
    if (ok) notifySuccess("Gespeichert");
    else notifyError("Speichern fehlgeschlagen");
  };

  const handleFinalize = async () => {
    const result = await session.finalize();
    if (!result.ok) notifyError(finalizeError(result.reason));
  };

  return (
    <div className="fixed right-0 z-50 flex flex-col items-end gap-3 p-8">
      <Sheet>
        {/* Actions Menu Header */}
        <SheetTrigger asChild>
          <Button className="h-12 w-12 rounded-full shadow-lg">
            <Settings className="size-6" />
          </Button>
        </SheetTrigger>
        <SheetContent className="w-70 lg:w-80">
          <SheetHeader className="px-6">
            <SheetTitle className="text-xl font-semibold">
              Rechnungsoptionen
            </SheetTitle>
          </SheetHeader>

          <div className="space-y-6 px-6">
            {/* Details */}
            <div className="font-light">
              <h3>Details</h3>
              <div className="flex flex-col space-y-1 pt-1 pl-4">
                <span>Rechnung / PDF</span>
                <span>Author: {privateContact.name}</span>
                <span>Empfänger: {invoiceData.sendTo.name}</span>
              </div>
            </div>

            <Separator />

            {/* Finalize */}
            <div>
              <h3 className="mb-3 flex items-center gap-2 font-medium">
                <BookCheck className="h-4 w-4" />
                Finalisieren
              </h3>
              <div className="space-y-2">
                <Button
                  onClick={handleFinalize}
                  variant="outline"
                  className="w-full justify-start"
                  disabled={busy || !finalizable}
                >
                  <BookCheck className="mr-1 h-4 w-4" />
                  Rechnung finalisieren
                </Button>
              </div>
            </div>

            <Separator />

            <div>
              <div className="space-y-2">
                {/* discard draft */}
                <Button
                  onClick={session.discard}
                  variant="outline"
                  className="w-full justify-start"
                  disabled={busy}
                >
                  <Trash2 className="mr-1 h-4 w-4" />
                  Entwurf verwerfen
                </Button>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <div className="flex items-center gap-2">
        <SaveBadge status={status} />
        <Button
          onClick={handleSave}
          aria-label="Entwurf speichern"
          className="h-12 w-12 rounded-full shadow-lg"
          disabled={saving || busy}
        >
          {status === "saved" ? (
            <Check className="size-6" />
          ) : (
            <Save className="size-6" />
          )}
        </Button>
      </div>
    </div>
  );
}

export default Optionsbar;
