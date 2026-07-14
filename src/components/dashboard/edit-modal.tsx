"use client";

import type { Contact } from "@/lib/contacts";
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
      groupKey={(contact) => contact.type}
      toRow={(contact) => ({
        title: contact.name,
        subtitle: contact.owner ?? contact.type,
        valueMain: contact.address.street,
        valueSub: `${contact.address.zip} ${contact.address.city}`,
      })}
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
      groupKey={(item) => item.category}
      toRow={(item) => ({
        title: item.name,
        subtitle: item.category.toUpperCase(),
        valueMain: toEuro(item.price),
        valueSub: [weightLabel(item), formatBasePrice(item)]
          .filter(Boolean)
          .join(" · "),
      })}
      renderSheet={({ mode, item, close }) => (
        <ProductForm mode={mode} product={item} onDone={close} />
      )}
    />
  );
}

export { ContactsModal, ProductsModal };
