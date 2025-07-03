"use client";

import React from "react";

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

import Link from "next/link";
import { InvoiceData } from "@/constants/types";

interface OptionsbarProps {
  id: number;
  invoiceData: InvoiceData;
  discardData: () => void;
}

function Optionsbar(props: OptionsbarProps) {
  const { id: invoiceId, invoiceData, discardData } = props;

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
                <span>
                  Empfänger: {invoiceData.sendTo.name}
                </span>
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
                <Button
                  className="w-full justify-start"
                  variant="outline"
                  asChild
                >
                  <Link href={`/invoice/${invoiceId}/pdf`}>
                    <BookCheck className="h-4 w-4 mr-1" />
                    PDF veröffentlichen
                  </Link>
                </Button>
                <Button
                  className="w-full justify-start"
                  variant="outline"
                  asChild
                >
                  <PDFDownloadLink
                    document={<PdfDocument data={invoiceData} />}
                    fileName={
                      invoiceData.sendTo.name.split(" ")[0] + "_" + invoiceId
                    }
                  >
                    <Download className="h-4 w-4 mr-1" />
                    PDF herunterladen
                  </PDFDownloadLink>
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Save className="h-4 w-4 mr-1" />
                  Als Entwurf speichern
                </Button>
              </div>
            </div>

            <Separator />

            <div>
              <div className="space-y-2">
                <Button
                  onClick={discardData}
                  className="w-full justify-start"
                  variant="outline"
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
