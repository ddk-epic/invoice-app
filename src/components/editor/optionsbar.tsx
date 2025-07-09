"use client";

import React, { useState } from "react";

import { Settings, Download, Save, BookCheck, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";

import { PDFDownloadLink } from "@react-pdf/renderer";
import PdfDocument from "@/components/pdf/pdf-document";

import { InvoiceData } from "@/constants/types";
import { InvoiceSchema } from "@/lib/schema";
import { insertInvoiceAction } from "@/app/actions/server-actions";
import { redirect, RedirectType } from "next/navigation";

interface OptionsbarProps {
  id: string;
  invoiceData: InvoiceData;
  discardData: () => void;
}

function Optionsbar(props: OptionsbarProps) {
  const { id: invoiceId, invoiceData, discardData } = props;

  const [isLoading, setIsLoading] = useState(false);

  const handlePublish = async () => {
    const result = InvoiceSchema.safeParse(invoiceData);
    if (!result.success) return console.log(result.error);

    const { status, ...rest } = invoiceData;
    const updatedInvoiceData = {
      status: "Offen",
      ...rest,
    };

    const res = await insertInvoiceAction(updatedInvoiceData);
    console.log("successfully saved the invoiceData!");
    return res;
  };

  return (
    <div className="z-50 fixed right-0 p-8">
      <Sheet>
        {/* Actions Menu Header */}
        <SheetTrigger asChild>
          <Button className="rounded-full h-12 w-12 shadow-lg">
            <Settings className="size-6" />
          </Button>
        </SheetTrigger>
        <SheetContent className="w-70 lg:w-80">
          <SheetHeader className="px-6">
            <SheetTitle className="text-xl font-semibold">
              Rechnungsoptionen
            </SheetTitle>
          </SheetHeader>

          <div className="px-6 space-y-6">
            {/* Details */}
            <div className="font-light">
              <h3>Details</h3>
              <div className="flex flex-col pl-4 pt-1 space-y-1">
                <span>Rechnung / PDF</span>
                <span>Author: {invoiceData.sender.name}</span>
                <span>Empfänger: {invoiceData.sendTo.name}</span>
              </div>
            </div>

            <Separator />

            {/* Export & Save */}
            <div>
              <h3 className="font-medium mb-3 flex items-center gap-2">
                <Download className="h-4 w-4" />
                Exportieren & Speichern
              </h3>
              <div className="space-y-2">
                {/* publish PDF */}
                <Button
                  onClick={async () => {
                    setIsLoading(true);
                    const res = await handlePublish();
                    if (res) {
                      setTimeout(() => {
                        setIsLoading(false);
                        redirect(
                          `/invoice/${invoiceId}/pdf`,
                          RedirectType.push
                        );
                      }, 3000);
                    }
                  }}
                  variant="outline"
                  className="w-full justify-start"
                  disabled={isLoading}
                >
                  <BookCheck className="h-4 w-4 mr-1" />
                  PDF veröffentlichen
                </Button>
                {/* download PDF */}
                <Button
                  className="w-full justify-start"
                  variant="outline"
                  disabled={isLoading}
                >
                  <PDFDownloadLink
                    // @ts-ignore
                    key={Date.now()}
                    onClick={handlePublish}
                    document={<PdfDocument data={invoiceData} />}
                    fileName={
                      invoiceData.sendTo.name.split(" ")[0] +
                      "_" +
                      invoiceId +
                      ".pdf"
                    }
                  >
                    <span className="flex gap-2 -ml-1">
                      <Download className="h-4 w-4 mr-1" />
                      PDF herunterladen
                    </span>
                  </PDFDownloadLink>
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
                  <Trash2 className="h-4 w-4 mr-1" />
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
