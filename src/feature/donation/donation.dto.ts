import z from "zod";

export const createDonationDto = z.object({
  creatorId: z.uuid({ error: "Creator is required" }),
  amount: z.coerce.number({ error: "Amount is required number" }).min(10000, { error: "Amount minimum is 10000" }),
  message: z.string().optional(),
  isAnonymous: z.boolean().optional(),
});

export type CreateDonationDto = z.infer<typeof createDonationDto>;
