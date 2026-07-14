// Reversible obfuscation of a draft's row id for editor URLs. Stateless, no DB
// column. Base36 so a handle reads as an opaque token, not an invoice number.
// Obfuscation, not security: the scheme is public and trivially reversible.
//
// Deliberately chosen over a persisted public token (a public_id column,
// generation, migration, backfill): this keeps the raw row id out of URLs with
// two pure functions and no schema change. Swap to a real token if handles ever
// need to be unguessable or decoupled from the row id.

const K = 0x9e3779b1 | 0; // odd multiplier => invertible mod 2^32
const K_INV = 0x0e8b2f51 | 0; // modular inverse of K mod 2^32

export function encodeDraftHandle(id: number): string {
  return (Math.imul(id, K) >>> 0).toString(36);
}

export function decodeDraftHandle(handle: string): number | null {
  if (!/^[0-9a-z]+$/.test(handle)) return null;
  const n = parseInt(handle, 36);
  if (!Number.isSafeInteger(n) || n < 0 || n > 0xffffffff) return null;
  const id = Math.imul(n, K_INV) >>> 0;
  // Reject aliases (e.g. leading zeros) that don't round-trip.
  return encodeDraftHandle(id) === handle ? id : null;
}
