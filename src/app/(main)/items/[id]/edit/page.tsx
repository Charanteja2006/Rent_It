import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ItemForm } from "@/components/items/ItemForm";
import type { Metadata } from "next";

interface EditItemPageProps {
  params: { id: string };
}

export const metadata: Metadata = { title: "Edit Listing" };

export default async function EditItemPage({ params }: EditItemPageProps) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const item = await prisma.item.findUnique({ where: { id: params.id } });
  if (!item) notFound();
  if (item.ownerId !== session.user.id) redirect(`/items/${params.id}`);

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Edit Listing</h1>
        <p className="text-muted-foreground mt-2">Update the details for &ldquo;{item.name}&rdquo;</p>
      </div>
      <div className="rounded-2xl border border-border bg-card p-6 sm:p-8">
        <ItemForm
          mode="edit"
          initialData={{
            id: item.id,
            name: item.name,
            description: item.description,
            imageUrl: item.imageUrl,
            tags: item.tags,
            rentPerDay: Number(item.rentPerDay),
            availableFrom: item.availableFrom,
            availableUntil: item.availableUntil,
          }}
        />
      </div>
    </div>
  );
}
