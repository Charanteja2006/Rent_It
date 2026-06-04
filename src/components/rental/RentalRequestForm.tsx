"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2, CalendarDays } from "lucide-react";
import { createRentalRequestSchema, type CreateRentalRequestInput } from "@/lib/validations/rental";
import { daysBetween, formatPrice } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface RentalRequestFormProps {
  itemId: string;
  rentPerDay: number;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function RentalRequestForm({
  itemId,
  rentPerDay,
  onSuccess,
  onCancel,
}: RentalRequestFormProps) {
  const [estimatedCost, setEstimatedCost] = useState<number | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CreateRentalRequestInput>({
    resolver: zodResolver(createRentalRequestSchema),
    defaultValues: { itemId },
  });

  const startDate = watch("startDate");
  const endDate = watch("endDate");

  // Update cost estimate when dates change
  if (startDate && endDate && new Date(endDate) > new Date(startDate)) {
    const days = daysBetween(startDate, endDate);
    const cost = days * rentPerDay;
    if (cost !== estimatedCost) setEstimatedCost(cost);
  }

  const onSubmit = async (data: CreateRentalRequestInput) => {
    try {
      const res = await fetch("/api/rental-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to submit request");
      toast.success("Rental request submitted! The owner will review it.");
      onSuccess?.();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to submit request");
    }
  };

  const inputClass = (hasError?: boolean) =>
    cn(
      "w-full px-3.5 py-2.5 rounded-xl border bg-background text-sm",
      "focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all",
      hasError ? "border-destructive" : "border-input"
    );

  const today = new Date().toISOString().split("T")[0];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" id="rental-request-form">
      <input type="hidden" {...register("itemId")} />

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label htmlFor="rental-start" className="text-sm font-medium text-foreground">
            Start Date *
          </label>
          <input
            id="rental-start"
            type="date"
            min={today}
            {...register("startDate")}
            className={inputClass(!!errors.startDate)}
          />
          {errors.startDate && (
            <p className="text-xs text-destructive">{errors.startDate.message}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <label htmlFor="rental-end" className="text-sm font-medium text-foreground">
            End Date *
          </label>
          <input
            id="rental-end"
            type="date"
            min={startDate || today}
            {...register("endDate")}
            className={inputClass(!!errors.endDate)}
          />
          {errors.endDate && (
            <p className="text-xs text-destructive">{errors.endDate.message}</p>
          )}
        </div>
      </div>

      {/* Cost estimate */}
      {estimatedCost !== null && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-primary/5 border border-primary/20">
          <CalendarDays className="h-4 w-4 text-primary flex-shrink-0" />
          <p className="text-sm text-foreground">
            <span className="font-semibold text-primary">{formatPrice(estimatedCost)}</span>
            {" "}estimated total for{" "}
            <span className="font-semibold">{daysBetween(startDate, endDate)} day{daysBetween(startDate, endDate) !== 1 ? "s" : ""}</span>
            {" "}(paid in person)
          </p>
        </div>
      )}

      {/* Optional note */}
      <div className="space-y-1.5">
        <label htmlFor="rental-note" className="text-sm font-medium text-foreground">
          Message to Owner <span className="text-muted-foreground font-normal">(optional)</span>
        </label>
        <textarea
          id="rental-note"
          {...register("note")}
          rows={3}
          placeholder="Tell the owner why you need this item, or ask any questions..."
          className={cn(inputClass(!!errors.note), "resize-none")}
        />
        {errors.note && <p className="text-xs text-destructive">{errors.note.message}</p>}
      </div>

      <div className="flex gap-3">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            id="rental-request-cancel"
            className="flex-1 py-2.5 px-4 rounded-xl border border-border text-sm font-medium hover:bg-muted transition-colors"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          id="rental-request-submit"
          className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl gradient-brand text-white text-sm font-semibold hover:opacity-90 disabled:opacity-60 transition-all"
        >
          {isSubmitting ? (
            <><Loader2 className="h-4 w-4 animate-spin" /> Submitting...</>
          ) : (
            "Request to Rent"
          )}
        </button>
      </div>
    </form>
  );
}
