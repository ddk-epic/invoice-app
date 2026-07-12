"use client";

import { useState } from "react";

import { Settings, BookCheck, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";

import { FinalizeResult, Invoice, Profile } from "@/constants/types";
import {
  finalizeDraftAction,
  updateDraftAction,
} from "@/app/actions/server-actions";
import { canFinalize } from "@/lib/invoice";
import { redirect } from "next/navigation";
import { toast } from "sonner";

interface OptionsbarProps {
  privateContact: Profile;
  invoiceData: Invoice;
  discardData: () => void;
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
  const { privateContact, invoiceData, discardData } = props;
  const [isLoading, setIsLoading] = useState(false);

  const finalizable = canFinalize(invoiceData);

  const saveDraft = async () => {
    if (!invoiceData.id) return false;
    const res = await updateDraftAction(invoiceData.id, invoiceData);
    if (!res.ok) {
      toast.error(
        res.error === "validation"
          ? "Bitte füllen Sie alle erforderlichen Felder aus."
          : "Entwurf konnte nicht gespeichert werden."
      );
    }
    return res.ok;
  };

  const handleFinalize = async () => {
    if (!invoiceData.id) return;
    const saved = await saveDraft();
    if (!saved) return;
    const result = await finalizeDraftAction(invoiceData.id);
    if (!result.ok) {
      toast.error(finalizeError(result.reason));
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      redirect(`/invoice/${result.number}/pdf`);
    }, 2000);
  };

  return (
    <div className="fixed right-0 z-50 p-8">
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
    </div>
  );
}

export default Optionsbar;
