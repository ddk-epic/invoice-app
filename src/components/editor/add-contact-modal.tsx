import React from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Contact } from "@/constants/types";

interface SelectContactModalProps {
  isModalOpen: boolean;
  setIsModalOpen: (isContactModalOpen: boolean) => void;
  label: string;
  contact: Contact | null;
  setter: (contact: Contact) => void;
  updateContact: (id: string, setter: (contact: Contact) => void) => void;
  contactList: Contact[];
}

function SelectContactModal(props: SelectContactModalProps) {
  const {
    isModalOpen,
    setIsModalOpen,
    label,
    contact,
    setter,
    updateContact,
    contactList,
  } = props;

  return (
    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" className="h-[140px] p-0 m-0 block text-left">
          {contact ? (
            <div className="flex flex-col px-2 text-sm text-gray-500 font-normal">
              <div className="font-medium">{contact.name}</div>
              <p>{contact?.owner}</p>
              <p>{contact.address?.street}</p>
              <p>
                {contact.address?.zip} {contact.address?.state}
              </p>
              <p>{contact.address?.country}</p>
            </div>
          ) : (
            <div className="flex justify-center items-center w-full h-full space-x-2 text-base text-gray-500 border-2 border-dashed rounded-lg">
              <Plus className="h-4 w-4" size="icon" />
              <p>{label} hinzufügen</p>
            </div>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[95vh] overflow-y-auto gap-2">
        <DialogHeader>
          <DialogTitle>Kontakt auswählen</DialogTitle>
        </DialogHeader>
        {contactList.map((contact) => (
          <Button
            key={contact.id}
            onClick={() => updateContact(contact.id, setter)}
            variant="ghost"
            className="h-[3rem]"
            asChild
          >
            <div
              key={contact.id}
              className="flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50"
            >
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
  );
}

export default SelectContactModal;
