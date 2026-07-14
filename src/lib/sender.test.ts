import { describe, it, expect } from "vitest";
import type { Address, Location, Profile } from "@/constants/types";
import { resolveSender } from "./sender";

const address: Address = {
  street: "Hauptstraße 1",
  city: "Köln",
  state: "NRW",
  zip: "50667",
  country: "Deutschland",
};

const profile: Profile = {
  id: 3,
  name: "Meine Firma",
  phone: "0176",
  email: "a@b.de",
};

const location: Location = { id: 7, label: "HQ", address, isPrimary: true };

describe("resolveSender", () => {
  it("snapshots the profile name and the location address", () => {
    expect(resolveSender(profile, location)).toEqual({
      id: 3,
      type: "profile",
      name: "Meine Firma",
      address,
    });
  });

  it("falls back to id 0 when the profile has no id", () => {
    const sender = resolveSender({ ...profile, id: undefined }, location);
    expect(sender.id).toBe(0);
  });
});
