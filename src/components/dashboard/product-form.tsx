"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

import { ChevronDown, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
  CONTENT_UNITS,
  emptyProduct,
  type Product,
  type ProductInput,
  type ContentUnit,
} from "@/lib/products";
import {
  insertProductAction,
  updateProductAction,
} from "@/app/actions/server-actions";
import { notifyWrite } from "@/diagnostics/notify";

// Strip the native number-spinner arrows.
const NO_SPIN =
  "[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none";

interface ProductFormProps {
  mode: "new" | "edit";
  product: Product | null;
  onDone: () => void;
}

function ProductForm({ mode, product, onDone }: ProductFormProps) {
  const router = useRouter();
  const [productData, setProductData] = useState<ProductInput>(
    product ?? emptyProduct()
  );

  const isProductValid =
    productData.name !== "" &&
    productData.category !== "" &&
    productData.netContent > 0 &&
    productData.price > 0;

  const updateText = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProductData((prev) => ({ ...prev, [name]: value }));
  };

  const updateNumber = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProductData((prev) => ({
      ...prev,
      [name]: value === "" && name === "packSize" ? null : Number(value) || 0,
    }));
  };

  const updateUnit = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setProductData((prev) => ({
      ...prev,
      contentUnit: e.target.value as ContentUnit,
    }));
  };

  const handleSubmit = async () => {
    const next = {
      ...productData,
      brand: productData.brand?.trim() || null,
      origin: productData.origin?.trim() || null,
      barcode: productData.barcode?.trim() || null,
    };

    const res =
      mode === "edit" && productData.id != null
        ? await updateProductAction(productData.id, next)
        : await insertProductAction(next);

    notifyWrite(res, {
      success: "Gespeichert",
      onOk: () => {
        onDone();
        router.refresh();
      },
    });
  };

  return (
    <>
      <div className="flex items-center justify-between px-6 pt-3">
        <h3 className="font-medium text-gray-700">
          {mode === "new" ? "Neuer Artikel" : `Bearbeiten: ${productData.name}`}
        </h3>
        <Button variant="ghost" size="icon" onClick={onDone} className="size-7">
          <X className="size-4" />
        </Button>
      </div>

      <div className="flex gap-6 px-6 pt-2 pb-6 text-sm">
        {/* Mandatory half */}
        <div className="min-w-0 flex-[3] space-y-3">
          <p className="pt-4 pb-1 text-xs font-semibold tracking-wide text-gray-400 uppercase">
            Pflichtangaben
          </p>
          <div>
            <Label className="pb-1">Name</Label>
            <Input
              name="name"
              placeholder="z.B. Basmati Reis"
              value={productData.name}
              onChange={updateText}
            />
          </div>
          <div>
            <Label className="pb-1">Kategorie</Label>
            <Input
              name="category"
              placeholder="z.B. Reis"
              value={productData.category}
              onChange={updateText}
            />
          </div>
          <div className="flex gap-3">
            <div className="w-23">
              <Label className="pb-1">Preis</Label>
              <div className="focus-within:border-ring focus-within:ring-ring/50 flex h-9 items-stretch overflow-hidden rounded-md border shadow-xs focus-within:ring-[3px]">
                <input
                  name="price"
                  type="number"
                  placeholder="0,00"
                  value={productData.price || ""}
                  onChange={updateNumber}
                  className={`min-w-0 flex-1 bg-transparent px-3 text-right text-sm outline-none placeholder:text-gray-400 ${NO_SPIN}`}
                />
                <span className="flex items-center border-l bg-gray-50 px-2 text-sm text-gray-500">
                  €
                </span>
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <Label className="pb-1">Inhalt</Label>
              <div className="focus-within:border-ring focus-within:ring-ring/50 flex h-9 min-w-0 items-stretch overflow-hidden rounded-md border shadow-xs focus-within:ring-[3px]">
                <input
                  name="netContent"
                  type="number"
                  placeholder="0"
                  value={productData.netContent || ""}
                  onChange={updateNumber}
                  className={`min-w-0 flex-1 bg-transparent px-3 text-right text-sm outline-none placeholder:text-gray-400 ${NO_SPIN}`}
                />
                <div className="relative flex items-center border-l bg-gray-50">
                  <select
                    name="contentUnit"
                    value={productData.contentUnit}
                    onChange={updateUnit}
                    className="appearance-none bg-transparent py-0 pr-4.5 pl-2 text-sm outline-none"
                  >
                    {CONTENT_UNITS.map((u) => (
                      <option key={u} value={u}>
                        {u}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-1 size-3.5 text-gray-400" />
                </div>
              </div>
            </div>
          </div>
          <div>
            <Label className="pb-1">Barcode (EAN)</Label>
            <Input
              name="barcode"
              placeholder="z.B. 4006381333931"
              value={productData.barcode ?? ""}
              onChange={updateText}
            />
          </div>
        </div>

        {/* Optional half */}
        <div className="flex min-w-0 flex-[2] flex-col gap-3">
          <div className="space-y-3 rounded-lg bg-gray-50 p-4">
            <p className="pb-1 text-xs font-semibold tracking-wide text-gray-400 uppercase">
              Optional
            </p>
            <div>
              <Label className="pb-1 text-gray-500">Marke</Label>
              <Input
                name="brand"
                placeholder="z.B. Tilda"
                value={productData.brand ?? ""}
                onChange={updateText}
                className="bg-white"
              />
            </div>
            <div>
              <Label className="pb-1 text-gray-500">Herkunft</Label>
              <Input
                name="origin"
                placeholder="z.B. Indien"
                value={productData.origin ?? ""}
                onChange={updateText}
                className="bg-white"
              />
            </div>
            <div>
              <Label className="pb-1 text-gray-500">Boxanzahl</Label>
              <Input
                name="packSize"
                type="number"
                placeholder="0"
                value={productData.packSize ?? ""}
                onChange={updateNumber}
                className={`bg-white text-right ${NO_SPIN}`}
              />
            </div>
          </div>
          <Button
            variant="brand"
            onClick={handleSubmit}
            disabled={!isProductValid}
            className="mt-auto w-full text-base"
          >
            {mode === "new" ? "Anlegen" : "Aktualisieren"}
          </Button>
        </div>
      </div>
    </>
  );
}

export default ProductForm;
