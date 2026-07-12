import { describe, it, expect } from "vitest";
import { addDays } from "./utils";

describe("addDays", () => {
  it("adds the payment term to a YYYY-MM-DD date", () => {
    expect(addDays("2026-07-12", 14)).toBe("2026-07-26");
    expect(addDays("2026-07-12", 30)).toBe("2026-08-11");
  });
  it("crosses month and year boundaries", () => {
    expect(addDays("2026-12-25", 14)).toBe("2027-01-08");
  });
});
