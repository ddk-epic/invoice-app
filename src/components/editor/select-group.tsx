import React from "react";
import { Label } from "@radix-ui/react-label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Contact } from "@/constants/types";

interface SelectContactProps {
  label: string;
  contact: Contact | null;
  selectContact: (id: string) => void;
  contactList: Contact[];
}

export function SelectContact(props: SelectContactProps) {
  const { label, contact, selectContact, contactList } = props;
  return (
    <div>
      <Label className="text-sm font-medium mb-2 block">{label}:</Label>
      <Select onValueChange={selectContact}>
        <SelectTrigger className="w-full mb-2">
          <SelectValue placeholder={`${label} auswählen`} />
        </SelectTrigger>
        <SelectContent>
          {contactList.map((contact) => (
            <SelectItem key={contact.id} value={contact.id}>
              {contact.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {contact ? (
        <div className="text-sm text-gray-600">
          <div className="font-medium">{contact.name}</div>
          <div className="whitespace-pre-line">{contact.address}</div>
          <div>{contact.email}</div>
        </div>
      ) : (
        <div className="text-sm text-gray-300 space-y-2 pb-1">
          <div className="h-4 bg-gray-200 rounded w-32"></div>
          <div className="h-3 bg-gray-200 rounded w-24"></div>
          <div className="h-3 bg-gray-200 rounded w-28"></div>
          <div className="h-3 bg-gray-200 rounded w-38"></div>
        </div>
      )}
    </div>
  );
}
