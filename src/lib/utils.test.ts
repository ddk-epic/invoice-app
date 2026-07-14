import { describe, it, expect } from "vitest";
import { addDays, invoiceFileName } from "./utils";

describe("addDays", () => {
  it("adds the payment term to a YYYY-MM-DD date", () => {
    expect(addDays("2026-07-12", 14)).toBe("2026-07-26");
    expect(addDays("2026-07-12", 30)).toBe("2026-08-11");
  });
  it("crosses month and year boundaries", () => {
    expect(addDays("2026-12-25", 14)).toBe("2027-01-08");
  });
});

describe("invoiceFileName", () => {
  it("pads the id to three digits", () => {
    expect(invoiceFileName("14", "Mustermann")).toBe(
      "Rechnung-014-Mustermann.pdf"
    );
  });
  it("transliterates umlauts and slugifies the client", () => {
    expect(invoiceFileName("7", "Müller & Co. GmbH")).toBe(
      "Rechnung-007-Mueller-Co-GmbH.pdf"
    );
  });
  it("truncates long client names to 40 chars", () => {
    const long = "A".repeat(60);
    expect(invoiceFileName("120", long)).toBe(
      `Rechnung-120-${"A".repeat(40)}.pdf`
    );
  });
});
