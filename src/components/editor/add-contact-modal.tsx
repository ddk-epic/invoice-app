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
  name: string;
  updateContact: (id: string, name: string) => void;
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
            className="h-[130px] w-full p-0 pb-0.5 m-0 block text-left"
          >
            {contact ? (
              <div className="flex flex-col px-2 text-sm text-gray-500 font-normal">
                <div className="font-medium">{contact.name}</div>
                <p>{contact?.owner}</p>
                <p>{contact.address?.street}</p>
                <p>
                  {contact.address?.zip} {contact.address?.state}
                </p>
                <p>{contact.address?.country}</p>
                {!contact?.owner && <p className="h-5"></p>}
              </div>
            ) : (
              <div className="flex justify-center items-center w-full h-full space-x-2 text-base text-gray-500 border-2 border-dashed rounded-lg">
                <Plus className="h-4 w-4" />
                <p>{label} hinzufügen</p>
              </div>
            )}
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl max-h-[95vh] overflow-y-auto gap-2">
          <DialogHeader className="mb-2">
            <DialogTitle>Kontakt auswählen</DialogTitle>
          </DialogHeader>
          {contactList.map((contact) => (
            <Button
              // @ts-ignore
              key={contact.id}
              onClick={() => updateContact(contact.id.toString(), name)}
              variant="ghost"
              className="h-[3rem]"
              asChild
            >
              <div className="flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50">
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
