"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { createItemSchema, type CreateItemInput } from "@/lib/validations/item";
import { ImageUploader } from "./ImageUploader";
import { TagSelector } from "./TagSelector";
import { cn } from "@/lib/utils";
import type { Item } from "@/types";

interface ItemFormProps {
  initialData?: Partial<Item>;
  mode?: "create" | "edit";
}

export function ItemForm({ initialData, mode = "create" }: ItemFormProps) {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CreateItemInput>({
    resolver: zodResolver(createItemSchema),
    defaultValues: {
      name: initialData?.name || "",
      description: initialData?.description || "",
      imageUrl: initialData?.imageUrl || "",
      tags: initialData?.tags || [],
      rentPerDay: initialData?.rentPerDay ? Number(initialData.rentPerDay) : undefined,
      availableFrom: initialData?.availableFrom
        ? new Date(initialData.availableFrom).toISOString().split("T")[0]
        : "",
      availableUntil: initialData?.availableUntil
        ? new Date(initialData.availableUntil).toISOString().split("T")[0]
        : "",
    },
  });

  const imageUrl = watch("imageUrl");

  const onSubmit = async (data: CreateItemInput) => {
    try {
      const url = mode === "edit" ? `/api/items/${initialData?.id}` : "/api/items";
      const method = mode === "edit" ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to save item");

      toast.success(mode === "edit" ? "Listing updated!" : "Listing created!");
      router.push(mode === "edit" ? `/items/${json.data.id}` : `/items/${json.data.id}`);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    }
  };

  const inputClass = (hasError?: boolean) =>
    cn(
      "w-full px-3.5 py-2.5 rounded-xl border bg-background text-sm text-foreground",
      "placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all",
      hasError ? "border-destructive" : "border-input"
    );

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" id="item-form">
      {/* Image Upload */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Item Photo *</label>
        <Controller
          name="imageUrl"
          control={control}
          render={() => (
            <ImageUploader
              onUploadComplete={(url) => setValue("imageUrl", url, { shouldValidate: true })}
              currentImageUrl={initialData?.imageUrl}
            />
          )}
        />
        {!imageUrl && errors.imageUrl && (
          <p className="text-xs text-destructive">{errors.imageUrl.message}</p>
        )}
      </div>

      {/* Name */}
      <div className="space-y-2">
        <label htmlFor="item-name" className="text-sm font-medium text-foreground">Item Name *</label>
        <input
          id="item-name"
          {...register("name")}
          placeholder="e.g. Sony A7III Camera"
          className={inputClass(!!errors.name)}
        />
        {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
      </div>

      {/* Description */}
      <div className="space-y-2">
        <label htmlFor="item-description" className="text-sm font-medium text-foreground">Description *</label>
        <textarea
          id="item-description"
          {...register("description")}
          rows={4}
          placeholder="Describe the item, its condition, any accessories included..."
          className={cn(inputClass(!!errors.description), "resize-none")}
        />
        {errors.description && (
          <p className="text-xs text-destructive">{errors.description.message}</p>
        )}
      </div>

      {/* Tags */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Tags *</label>
        <Controller
          name="tags"
          control={control}
          render={({ field }) => (
            <TagSelector value={field.value} onChange={field.onChange} />
          )}
        />
        {errors.tags && <p className="text-xs text-destructive">{errors.tags.message as string}</p>}
      </div>

      {/* Price */}
      <div className="space-y-2">
        <label htmlFor="item-price" className="text-sm font-medium text-foreground">Price per Day (USD) *</label>
        <div className="relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
          <input
            id="item-price"
            type="number"
            step="0.01"
            min="0"
            {...register("rentPerDay", { valueAsNumber: true })}
            placeholder="0.00"
            className={cn(inputClass(!!errors.rentPerDay), "pl-7")}
          />
        </div>
        {errors.rentPerDay && (
          <p className="text-xs text-destructive">{errors.rentPerDay.message}</p>
        )}
      </div>

      {/* Availability dates */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="available-from" className="text-sm font-medium text-foreground">
            Available From
          </label>
          <input
            id="available-from"
            type="date"
            {...register("availableFrom")}
            className={inputClass()}
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="available-until" className="text-sm font-medium text-foreground">
            Available Until
          </label>
          <input
            id="available-until"
            type="date"
            {...register("availableUntil")}
            className={inputClass()}
          />
        </div>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={isSubmitting}
        id="item-form-submit"
        className={cn(
          "w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl",
          "gradient-brand text-white font-semibold text-sm",
          "hover:opacity-90 disabled:opacity-60 transition-all duration-200"
        )}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            {mode === "edit" ? "Saving..." : "Creating..."}
          </>
        ) : (
          mode === "edit" ? "Save Changes" : "Create Listing"
        )}
      </button>
    </form>
  );
}
