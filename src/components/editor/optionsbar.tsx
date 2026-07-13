"use client";

import { useState } from "react";

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

import { DraftInvoice, FinalizeResult, Profile } from "@/constants/types";
import { finalizeDraftAction } from "@/app/actions/server-actions";
import { canFinalize } from "@/lib/invoice";
import { redirect } from "next/navigation";
import { notifyError, notifySuccess } from "@/diagnostics/notify";
import { type SaveStatus } from "@/hooks/use-autosave";

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
  invoiceData: DraftInvoice;
  discardData: () => void;
  saveNow: () => Promise<boolean>;
  status: SaveStatus;
  saving: boolean;
}

type FinalizeError = Extract<FinalizeResult, { ok: false }>["reason"];

function finalizeError(reason: FinalizeError): string {
  switch (reason) {
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
  const { privateContact, invoiceData, discardData, saveNow, status, saving } =
    props;
  const [isLoading, setIsLoading] = useState(false);

  const finalizable = canFinalize(invoiceData);

  const handleSave = async () => {
    const ok = await saveNow();
    if (ok) notifySuccess("Gespeichert");
    else notifyError("Speichern fehlgeschlagen");
  };

  const handleFinalize = async () => {
    if (!invoiceData.id) return;
    const saved = await saveNow();
    if (!saved) return;
    const result = await finalizeDraftAction(invoiceData.id);
    if (!result.ok) {
      notifyError(finalizeError(result.reason));
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      redirect(`/invoice/${result.number}/pdf`);
    }, 2000);
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
                  disabled={isLoading || !finalizable}
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
                  onClick={discardData}
                  variant="outline"
                  className="w-full justify-start"
                  disabled={isLoading}
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
          disabled={saving}
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
