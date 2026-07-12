import "server-only";

import type {
  Contact,
  CreateDraftInput,
  FinalizeResult,
  Invoice,
  Location,
  Profile,
  WriteResult,
} from "@/constants/types";
import { QUERIES } from "@/server/db/queries";
import { canFinalize } from "@/lib/invoice";
import { addDays, todayIso } from "@/lib/utils";

const DEFAULT_TAX_RATE = 7;
const DEFAULT_PAYMENT_TERM_DAYS = 14;

// Compose the frozen Sender snapshot from the live Profile + Location.
export function resolveSender(profile: Profile, location: Location): Contact {
  return {
    id: profile.id ?? 0,
    type: "profile",
    name: profile.name,
    address: location.address,
  };
}

export async function createDraft(
  input: CreateDraftInput
): Promise<number | null> {
  try {
    const contact = await QUERIES.getContactById(input.contactId);
    if (!contact) return null;

    const invoiceDate = todayIso();
    const draft: Invoice = {
      invoiceId: "",
      invoiceDate,
      dueDate: addDays(invoiceDate, DEFAULT_PAYMENT_TERM_DAYS),
      status: "draft",
      locationId: input.locationId ?? null,
      sender: null,
      sendTo: contact,
      invoiceTo: contact,
      items: [],
      total: 0,
      taxRate: DEFAULT_TAX_RATE,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const row = await QUERIES.insertDraft(draft);
    return row.id;
  } catch (err) {
    console.error("createDraft failed:", err);
    return null;
  }
}

export async function finalizeDraft(id: number): Promise<FinalizeResult> {
  try {
    const draft = await QUERIES.getDraftById(id);
    if (!draft || draft.status !== "draft") {
      return { ok: false, reason: "not_found" };
    }
    if (!canFinalize(draft)) return { ok: false, reason: "not_finalizable" };

    const profile = await QUERIES.getProfile();
    if (!profile) return { ok: false, reason: "no_profile" };

    const location = draft.locationId
      ? await QUERIES.getLocationById(draft.locationId)
      : await QUERIES.getPrimaryLocation();
    if (!location) return { ok: false, reason: "no_location" };

    const sender = resolveSender(profile, location);
    const row = await QUERIES.finalizeDraftById(id, sender);
    if (!row) return { ok: false, reason: "not_found" };
    return { ok: true, number: row.invoiceId };
  } catch (err) {
    console.error("finalizeDraft failed:", err);
    return { ok: false, reason: "db" };
  }
}

export async function markPaid(id: number): Promise<WriteResult> {
  try {
    await QUERIES.markPaidById(id);
    return { ok: true };
  } catch (err) {
    console.error("markPaid failed:", err);
    return { ok: false, error: "db" };
  }
}

export async function discardDraft(id: number): Promise<WriteResult> {
  try {
    await QUERIES.deleteDraftById(id);
    return { ok: true };
  } catch (err) {
    console.error("discardDraft failed:", err);
    return { ok: false, error: "db" };
  }
}
