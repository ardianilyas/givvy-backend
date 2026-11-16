import z from "zod";

export const createWithdrawalDto = z.object({
  amount: z.coerce.number().min(50000),
  bankAccountId: z.uuid(),
});

export type CreateWithdrawalDto = z.infer<typeof createWithdrawalDto>;
