import React from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { sampleProducts } from "@/constants/constants";

interface AddItemModalProps {
  addItem: (predefinedItem: (typeof sampleProducts)[0]) => void;
  setIsAddItemModalOpen: (isAddItemModalOpen: boolean) => void;
}

function AddItemModal(props: AddItemModalProps) {
  const { addItem, setIsAddItemModalOpen } = props;
  return (
    <div className="space-y-4">
      <div className="grid gap-3">
        {sampleProducts.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50"
          >
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium">{item.description}</h4>
                  <p className="text-sm text-gray-500">{item.category}</p>
                </div>
                <div className="text-right mr-4">
                  <p className="font-medium">{item.rate/100} €</p>
                  <p className="text-sm text-gray-500">{item.weight}</p>
                </div>
              </div>
            </div>
            <Button
              size="sm"
              onClick={() => addItem(item)}
              className="flex items-center gap-1"
            >
              <Plus className="h-3 w-3" />
              Add
            </Button>
          </div>
        ))}
      </div>
      <div className="flex justify-end pt-4 border-t">
        <Button variant="outline" onClick={() => setIsAddItemModalOpen(false)}>
          Close
        </Button>
      </div>
    </div>
  );
}

export default AddItemModal;
