"use client";

import type { Contact } from "@/constants/types";
import { toEuro } from "@/lib/utils";
import {
  weightLabel,
  formatBasePrice,
  productMatches,
  type Product,
} from "@/lib/products";
import { CatalogModal } from "./catalog-modal";
import ProductForm from "./product-form";
import ContactForm from "./contact-form";

const contactMatches = (contact: Contact, query: string) => {
  const q = query.toLowerCase();
  return (
    contact.name.toLowerCase().includes(q) ||
    contact.type.toLowerCase().includes(q) ||
    (contact.owner ?? "").toLowerCase().includes(q) ||
    contact.address.street.toLowerCase().includes(q) ||
    contact.address.city.toLowerCase().includes(q)
  );
};

function ContactsModal({ contacts }: { contacts: Contact[] }) {
  return (
    <CatalogModal<Contact>
      trigger="Kontakte"
      title="Kontakte"
      newLabel="Neuer Kontakt"
      items={contacts}
      matches={contactMatches}
      renderRow={(contact) => (
        <>
          <div>
            <h4 className="font-medium">{contact.name}</h4>
            <p className="text-sm text-gray-500">{contact.type}</p>
          </div>
          <div className="mr-2 text-right">
            <p className="font-medium">{contact.address.street}</p>
            <p className="text-sm text-gray-500">{`${contact.address.zip} ${contact.address.city}`}</p>
          </div>
        </>
      )}
      renderSheet={({ mode, item, close }) => (
        <ContactForm mode={mode} contact={item} onDone={close} />
      )}
    />
  );
}

function ProductsModal({ products }: { products: Product[] }) {
  return (
    <CatalogModal<Product>
      trigger="Artikel"
      title="Alle Artikel"
      newLabel="Neuer Artikel"
      items={products}
      matches={productMatches}
      renderRow={(item) => (
        <>
          <div>
            <h4 className="font-medium">{item.name}</h4>
            <p className="text-sm text-gray-500">
              {item.category.toUpperCase()}
            </p>
          </div>
          <div className="mr-2 text-right">
            <p className="font-medium">{toEuro(item.price)}</p>
            <p className="text-sm text-gray-500">
              {weightLabel(item)}
              {formatBasePrice(item) && ` · ${formatBasePrice(item)}`}
            </p>
          </div>
        </>
      )}
      renderSheet={({ mode, item, close }) => (
        <ProductForm mode={mode} product={item} onDone={close} />
      )}
    />
  );
}

export { ContactsModal, ProductsModal };
