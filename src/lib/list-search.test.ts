import { describe, it, expect } from "vitest";
import { filterMatches } from "./list-search";

const byName = (item: { name: string }, q: string) =>
  item.name.toLowerCase().includes(q.toLowerCase());

const items = [{ name: "Apfel" }, { name: "Banane" }, { name: "Ananas" }];

describe("filterMatches", () => {
  it("returns every item for an empty query", () => {
    expect(filterMatches(items, byName, "")).toBe(items);
  });

  it("keeps only items the predicate matches", () => {
    expect(filterMatches(items, byName, "an")).toEqual([
      { name: "Banane" },
      { name: "Ananas" },
    ]);
  });

  it("returns an empty array when nothing matches", () => {
    expect(filterMatches(items, byName, "xyz")).toEqual([]);
  });
});
