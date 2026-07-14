import type { Address } from "@/constants/types";

export interface BaseContact {
  type: string;
  name: string;
  owner?: string;
  address: Address;
}

export interface Contact extends BaseContact {
  id: number;
}

export function emptyContact(): BaseContact {
  return {
    type: "client",
    name: "",
    owner: "",
    address: {
      street: "",
      city: "",
      state: "-",
      zip: "",
      country: "Deutschland",
    },
  };
}
