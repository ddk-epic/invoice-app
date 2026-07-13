"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

import { X } from "lucide-react";
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
      <div className="flex items-center justify-between px-8 pt-4">
        <h3 className="font-medium text-gray-700">
          {mode === "new" ? "Neuer Artikel" : `Bearbeiten: ${productData.name}`}
        </h3>
        <Button variant="ghost" size="icon" onClick={onDone} className="size-7">
          <X className="size-4" />
        </Button>
      </div>
      <div className="px-8 pt-2 pb-6 text-sm">
        <div className="space-y-2">
          <div className="flex space-x-6">
            <div className="flex-grow">
              <Label className="pb-1">Name</Label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="Name"
                value={productData.name}
                onChange={updateText}
              />
            </div>
            <div className="w-32">
              <Label className="pb-1">Preis</Label>
              <Input
                id="price"
                name="price"
                type="number"
                placeholder="Preis"
                value={productData.price || ""}
                onChange={updateNumber}
                className="text-right"
              />
            </div>
          </div>
          <div className="flex space-x-6">
            <div className="flex-grow">
              <Label className="pb-1">Kategorie</Label>
              <Input
                id="category"
                name="category"
                type="text"
                placeholder="Kategorie"
                value={productData.category}
                onChange={updateText}
              />
            </div>
            <div className="w-40">
              <Label className="pb-1">Inhalt</Label>
              <div className="flex gap-2">
                <Input
                  id="netContent"
                  name="netContent"
                  type="number"
                  placeholder="Menge"
                  value={productData.netContent || ""}
                  onChange={updateNumber}
                  className="text-right"
                />
                <select
                  name="contentUnit"
                  value={productData.contentUnit}
                  onChange={updateUnit}
                  className="rounded-md border px-2 text-sm"
                >
                  {CONTENT_UNITS.map((unit) => (
                    <option key={unit} value={unit}>
                      {unit}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          <div className="flex space-x-6">
            <div className="flex-grow">
              <Label className="pb-1">Marke</Label>
              <Input
                id="brand"
                name="brand"
                type="text"
                placeholder="Marke"
                value={productData.brand ?? ""}
                onChange={updateText}
              />
            </div>
            <div className="w-32">
              <Label className="pb-1">Boxanzahl</Label>
              <Input
                id="packSize"
                name="packSize"
                type="number"
                placeholder="Boxanzahl"
                value={productData.packSize ?? ""}
                onChange={updateNumber}
                className="text-right"
              />
            </div>
          </div>
          <div className="flex space-x-6">
            <div className="flex-grow">
              <Label className="pb-1">EAN</Label>
              <Input
                id="barcode"
                name="barcode"
                type="text"
                placeholder="EAN"
                value={productData.barcode ?? ""}
                onChange={updateText}
              />
            </div>
            <div className="w-40">
              <Label className="pb-1">Herkunft</Label>
              <Input
                id="origin"
                name="origin"
                type="text"
                placeholder="Herkunft"
                value={productData.origin ?? ""}
                onChange={updateText}
              />
            </div>
          </div>
          <div className="flex justify-end">
            <Button
              variant="ghost"
              onClick={handleSubmit}
              disabled={!isProductValid}
              className="to-brand w-32 bg-gradient-to-r from-teal-500 text-base text-white"
            >
              {mode === "new" ? "Anlegen" : "Aktualisieren"}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

export default ProductForm;
