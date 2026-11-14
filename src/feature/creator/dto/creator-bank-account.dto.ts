import z from "zod";

export const createCreatorBankAccountDto = z.object({
  bankCode: z.string({ error: "bank code is required" }),
  accountNumber: z.string({ error: "account number is required" }),
  accountName: z.string({ error: "account name is required" }),
  isDefault: z.boolean().optional(),
});

export const getCreatorId = z.uuid({ error: "Creator id is required and uuid format" });

export type CreateCreatorBankAccountDto = z.infer<typeof createCreatorBankAccountDto>;
