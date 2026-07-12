import type { Location, Profile } from "@/constants/types";
import type { Contact } from "@/lib/contacts";

// Compose the frozen Sender snapshot from the live Profile + Location.
export function resolveSender(profile: Profile, location: Location): Contact {
  return {
    id: profile.id ?? 0,
    type: "profile",
    name: profile.name,
    address: location.address,
  };
}
