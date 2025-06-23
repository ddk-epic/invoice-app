import React from "react";
import { db } from "@/server/db";
import { productsSchema } from "@/server/db/schema";
import { sampleProducts } from "@/constants/constants";

const newItems = sampleProducts.map(
  ({
    category,
    description,
    brand,
    origin,
    weight,
    perBox,
    quantity,
    rate,
    amount,
  }) => ({
    category,
    description,
    brand,
    origin,
    weight,
    perBox,
    quantity,
    rate,
    amount,
  })
);

function SandboxPage() {
  return (
    <main>
      <div className="wrapper top flex py-12 gap-4">
        Seed Function:
        <form
          action={async () => {
            "use server";

            const productsInsert = await db
              .insert(productsSchema)
              .values(newItems);
            console.log(productsInsert);
          }}
        >
          <button className="px-1 outline rounded-md" type="submit">
            Seed DB
          </button>
        </form>
      </div>
    </main>
  );
}

export default SandboxPage;
