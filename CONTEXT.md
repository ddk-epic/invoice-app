# Invoice App

Domain language for a single-business invoicing tool: one business drafts,
finalizes, and tracks invoices sent to its customers.

## Language

### Parties

**Profile**:
The single owner record representing the business that sends invoices (name,
phone, email); owns one or more Locations. Distinct from external Contacts.
_Avoid_: issuer, admin, private, owner.

**Location**:
One of the Profile's addresses; exactly one is the primary. Designed for
multiplicity now, defaulted to primary until a picker exists.
_Avoid_: branch, office, site.

**Contact**:
An external party the invoice is addressed to or billed to (the customer).
_Avoid_: client, account.

**Sender**:
The frozen snapshot of the Profile plus the chosen Location, stamped onto an
invoice when it is finalized. A record of who sent it, immutable thereafter.
_Avoid_: from, origin.

### Invoice lifecycle

**Draft**:
An unfinalized, editable invoice. Has no number and an unresolved Sender.
Corresponds to `status = 'draft'`.

**Finalized invoice**:
A Draft promoted to `open`; carries a sequential number and a frozen Sender.
May later become `paid`, or be derived `overdue` at read time.
_Avoid_: issued invoice.

**Create draft**:
Server-side creation of a fresh Draft. The server owns the seed (dates from its
clock, taxRate, status); the client supplies only inputs, never the seed. In
code: `createDraft`.
_Avoid_: mint, seed, template, create-from-constant.

**Finalize**:
The one-way transition promoting a Draft to a Finalized invoice: assign the next
number, freeze the Sender snapshot, flip `status` to `open`. In code:
`finalizeDraft`.
_Avoid_: issue, publish, submit (UI may say "veröffentlichen").

**Payment term**:
Days from invoice date to due date (Zahlungsziel). Not stored: only `invoiceDate`
and `dueDate` are persisted. Draft creation applies +14; the editor's 14 / 30 controls are
shortcuts that set `dueDate = invoiceDate + N`.
_Avoid_: net days, deadline.

**Finalizable**:
A Draft that meets the preconditions to be finalized. Since draft creation always
sets a recipient and the editor can only swap it (never clear it), the only varying
precondition is: it has at least one line item. In code: `canFinalize`.

### Invoice items

Working name `InvoiceItem`. The noun is under review (candidates: Invoice product,
Position); the rename is deferred to its own session. The decisions below stand
regardless of the final name.

**Invoice item**:
A catalog Product chosen for an invoice together with a quantity. On a Draft it is
only a reference: which Product, how many. Its price and amount are not stored on the
Draft; they are resolved and frozen from the catalog at Finalize.

**Amount**:
An item's line total, `quantity × price`. On a Draft it is derived on the fly from
the current catalog price (shown, never stored per item). At Finalize the server
freezes it from the finalize-time catalog price.
_Avoid_: line total, Nettowert (UI only).

**Total**:
The invoice's `Σ amount`. On a Draft it is a non-authoritative estimate the editor
computes and caches (for dashboard prioritization); it may go stale if a catalog
price changes while the Draft is closed. At Finalize the server ignores the cached
estimate, recomputes from finalize-time catalog prices, and freezes the authoritative
value. Stored even though derivable, so the author's reviewed number cannot drift.
_Avoid_: grand total, sum.

Just as the **Sender** is null-until-Finalize, an item's **price** / **amount** and
the invoice **Total** are unresolved-until-Finalize. A Draft holds only the author's
inputs; the priced snapshot is minted at the transition. Price is taken at Finalize,
not when the product was added, so a Draft always reflects current catalog prices
until it is frozen.

## Relationships

- One **Profile** has one-to-many **Locations**; exactly one is primary.
- A **Draft** references which **Location** it will finalize from (null ⇒ primary);
  the **Sender** is resolved and frozen from Profile + Location only at **Finalize**.
- A **Draft** always has a recipient **Contact** and a bill-to **Contact**, set
  at creation (today both from the same Contact) and only ever swapped, never cleared.
- **Create draft** produces a **Draft**; **Finalize** turns a **Draft** into a
  **Finalized invoice**.
- A PDF exists only for a **Finalized invoice**; a **Draft** is never rendered,
  so a rendered **Sender** is always the frozen snapshot.

## Example dialogue

> **Dev:** "When we **create** a **Draft**, do we stamp the **Sender** right away?"
> **Domain expert:** "No. A **Draft** only remembers which **Location** it'll use.
> The **Sender** snapshot is frozen at **Finalize**, so if we move offices while a
> **Draft** sits open, finalizing it uses the address as it stands then."
> **Dev:** "And a **Draft** with no recipient chosen?"
> **Domain expert:** "Not **Finalizable**. It stays a **Draft** until a **Contact**
> is set."

## Flagged ambiguities

- The placeholder `empty` Contact with `name = "undefined"` was used as a stand-in
  for an unset recipient, and pattern-matched by string in the UI. Resolved: draft
  creation always sets a real recipient and it can never be cleared, so the unset state is
  unreachable; `empty` and the string check are removed as dead code.
- "sender" named both the owner's own identity and the per-invoice snapshot.
  Resolved: **Profile** is the live owner record; **Sender** is the frozen snapshot.
- Three invoice shapes existed with the clean name on the smallest: full record
`InvoiceData`, thin list row `Invoice`, dashboard slice `LatestInvoice`.
Resolved: the full aggregate is `Invoice`; the list projection is `InvoiceRow`;
`LatestInvoice` stays.
</content>
