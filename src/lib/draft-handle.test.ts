import { describe, expect, it } from "vitest";

import { decodeDraftHandle, encodeDraftHandle } from "./draft-handle";

describe("draft handle", () => {
  it("round-trips row ids", () => {
    for (const id of [0, 1, 5, 42, 999, 123456, 2 ** 31 - 1, 0xffffffff]) {
      expect(decodeDraftHandle(encodeDraftHandle(id))).toBe(id);
    }
  });

  it("produces non-numeric handles for small ids", () => {
    expect(encodeDraftHandle(5)).not.toMatch(/^\d+$/);
  });

  it("rejects malformed handles", () => {
    expect(decodeDraftHandle("")).toBeNull();
    expect(decodeDraftHandle("!!")).toBeNull();
    expect(decodeDraftHandle("ZZZZZZZ")).toBeNull();
    expect(decodeDraftHandle("zzzzzzzzz")).toBeNull();
  });

  it("rejects non-canonical aliases", () => {
    const handle = encodeDraftHandle(42);
    expect(decodeDraftHandle("0" + handle)).toBeNull();
  });
});
