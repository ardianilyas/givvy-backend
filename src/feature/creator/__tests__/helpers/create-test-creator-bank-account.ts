import type { CreateCreatorBankAccountDto } from "../../dto/creator-bank-account.dto";
import { CreatorBankAccountService } from "../../services/creator-bank-account.service";

export async function createTestCreatorBankAccount(creatorId: string) {
  const creatorBankAccountService = new CreatorBankAccountService();

  const data: CreateCreatorBankAccountDto = {
    accountName: "Ardian Ilyas Fernanda",
    accountNumber: "1111444414",
    bankCode: "BCA",
  }

  const account = await creatorBankAccountService.createBankAccount(creatorId, data);

  if (!account) throw new Error("Failed to create bank account");

  return account;
}
