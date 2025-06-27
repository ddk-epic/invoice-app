import React from "react";
import Link from "next/link";
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

function Optionsbar({ id: invoiceId }: { id: number }) {
  return (
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
              <span>Author: phtt</span>
              <span>Empfänger: ABC</span>
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
              <Button className="w-full justify-start" variant="outline">
                <Download className="h-4 w-4 mr-1" />
                PDF herunterladen
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
              <Button className="w-full justify-start" variant="outline">
                <Trash2 className="h-4 w-4 mr-1" />
                Entwurf verwerfen
              </Button>
            </div>
          </div>

          {/* Share & Send */}
          {/* <div>
            <h3 className="font-medium mb-3 flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Share & Send
            </h3>
            <div className="space-y-2">
              <Button className="w-full justify-start" variant="outline">
                <Mail className="h-4 w-4 mr-1" />
                Email Invoice
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Printer className="h-4 w-4 mr-1" />
                Print Invoice
              </Button>
            </div>
          </div> */}

          {/* Invoice Settings */}
          {/* <div>
            <h3 className="font-medium mb-3 flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </h3>
            <div className="space-y-3">
              <div>
                <Label className="text-sm font-medium mb-1 block">
                  Currency
                </Label>
                <Select defaultValue="EUR">
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EUR">EUR (€)</SelectItem>
                    <SelectItem value="USD">USD ($)</SelectItem>
                    <SelectItem value="GBP">GBP (£)</SelectItem>
                    <SelectItem value="JPY">JPY (¥)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div> */}
        </div>
      </SheetContent>
    </Sheet>
  );
}

export default Optionsbar;
