import React from "react";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { Contact } from "@/lib/contacts";

interface SelectContactModalProps {
  isModalOpen: boolean;
  setIsModalOpen: (isContactModalOpen: boolean) => void;
  label: string;
  contact: Contact;
  name: string;
  updateContact: (id: number, name: string) => void;
  contactList: Contact[];
}

function SelectContactModal(props: SelectContactModalProps) {
  const {
    isModalOpen,
    setIsModalOpen,
    label,
    contact,
    name,
    updateContact,
    contactList,
  } = props;

  return (
    <div>
      <h1 className="pb-0.5 font-medium">{label}:</h1>
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogTrigger asChild>
          <Button
            variant="ghost"
            className="m-0 block h-[130px] w-full p-0 pb-0.5 text-left"
          >
            <div className="flex flex-col px-2 text-sm font-normal text-gray-500">
              <div className="font-medium">{contact.name}</div>
              <p>{contact.owner}</p>
              <p>{contact.address.street}</p>
              <p>
                {contact.address.zip} {contact.address.state}
              </p>
              <p>{contact.address.country}</p>
              {!contact?.owner && <p className="h-5"></p>}
            </div>
          </Button>
        </DialogTrigger>
        <DialogContent className="max-h-[95vh] max-w-2xl gap-2 overflow-y-auto">
          <DialogHeader className="mb-2">
            <DialogTitle>Kontakt auswählen</DialogTitle>
            <DialogDescription>
              Wählen Sie einen Kontakt für die Rechnung aus.
            </DialogDescription>
          </DialogHeader>
          {contactList.map((contact) => (
            <Button
              key={contact.id}
              onClick={() => updateContact(contact.id, name)}
              variant="ghost"
              className="h-[3rem]"
              asChild
            >
              <div className="flex items-center justify-between rounded-lg border p-3 hover:bg-gray-50">
                <div className="flex-1">
                  <h4 className="font-medium">{contact.name}</h4>
                  <p className="text-sm text-gray-500">{contact.owner}</p>
                </div>

                <Plus className="text-gray-500" />
              </div>
            </Button>
          ))}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default SelectContactModal;
