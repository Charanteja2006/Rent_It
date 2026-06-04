import type { Metadata } from "next";
import { ItemForm } from "@/components/items/ItemForm";

export const metadata: Metadata = {
  title: "Create New Listing",
  description: "List your item for rent on RentIt",
};

export default function NewItemPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Create a New Listing</h1>
        <p className="text-muted-foreground mt-2">
          Share your item with the community. Fill in the details below.
        </p>
      </div>
      <div className="rounded-2xl border border-border bg-card p-6 sm:p-8">
        <ItemForm mode="create" />
      </div>
    </div>
  );
}
