import { z } from "zod";

export const createRentalRequestSchema = z
  .object({
    itemId: z.string().uuid("Invalid item ID"),
    startDate: z.string().min(1, "Start date is required"),
    endDate: z.string().min(1, "End date is required"),
    note: z.string().max(500, "Note must be less than 500 characters").optional(),
  })
  .refine(
    (data) => new Date(data.endDate) > new Date(data.startDate),
    {
      message: "End date must be after start date",
      path: ["endDate"],
    }
  );

export const updateRentalRequestSchema = z.object({
  status: z.enum(["approved", "declined", "returned"]),
});

export type CreateRentalRequestInput = z.infer<typeof createRentalRequestSchema>;
export type UpdateRentalRequestInput = z.infer<typeof updateRentalRequestSchema>;
