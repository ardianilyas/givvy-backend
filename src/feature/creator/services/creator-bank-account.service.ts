import { BadRequestError } from "@/shared/errors/bad-request";
import { NotFoundError } from "@/shared/errors/not-found";
import type { CreateCreatorBankAccountDto } from "../dto/creator-bank-account.dto";
import { db } from "@/shared/db";
import { creatorBankAccounts } from "@/shared/db/schemas";
import { eq } from "drizzle-orm";
import { encrypt } from "@/shared/utils/encryption";

export class CreatorBankAccountService {
  async createBankAccount(creatorId: string, data: CreateCreatorBankAccountDto) {
    const bankCode = data.bankCode.trim().toUpperCase();
    const accountNumber = data.accountNumber.trim();
    const accountName = data.accountName.trim();

    if (!/^\d+$/.test(accountNumber)) {
      throw new BadRequestError("Invalid bank account number");
    }

    const [existingAccount] = await db
      .select({ id: creatorBankAccounts.id })
      .from(creatorBankAccounts)
      .where(eq(creatorBankAccounts.creatorId, creatorId))
      .limit(1);

    if (existingAccount) {
      throw new BadRequestError(
        "Creator already has a registered bank account. Use update instead.",
      );
    }

    const [account] = await db
      .insert(creatorBankAccounts)
      .values({
        creatorId,
        bankCode,
        accountNumberEncrypted: encrypt(accountNumber),
        accountNameEncrypted: encrypt(accountName),
        accountNumberLast4: accountNumber.slice(-4),
      })
      .returning({
        id: creatorBankAccounts.id,
        bankCode: creatorBankAccounts.bankCode,
        accountNumberLast4: creatorBankAccounts.accountNumberLast4,
        createdAt: creatorBankAccounts.createdAt,
      });

    return account;
  }

  async getBankAccount(creatorId: string) {
    const [account] = await db
      .select({
        id: creatorBankAccounts.id,
        bankCode: creatorBankAccounts.bankCode,
        accountNumberLast4: creatorBankAccounts.accountNumberLast4,
        createdAt: creatorBankAccounts.createdAt,
        updatedAt: creatorBankAccounts.updatedAt,
      })
      .from(creatorBankAccounts)
      .where(eq(creatorBankAccounts.creatorId, creatorId))
      .limit(1);

    if (!account) {
      throw new NotFoundError("Bank account not found");
    }

    return account;
  }

  async updateBankAccount(creatorId: string, data: CreateCreatorBankAccountDto) {
    const bankCode = data.bankCode.trim().toUpperCase();
    const accountNumber = data.accountNumber.trim();
    const accountName = data.accountName.trim();

    if (!/^\d+$/.test(accountNumber)) {
      throw new BadRequestError("Invalid bank account number");
    }

    const [account] = await db
      .update(creatorBankAccounts)
      .set({
        bankCode,
        accountNumberEncrypted: encrypt(accountNumber),
        accountNameEncrypted: encrypt(accountName),
        accountNumberLast4: accountNumber.slice(-4),
        updatedAt: new Date(),
      })
      .where(eq(creatorBankAccounts.creatorId, creatorId))
      .returning({
        id: creatorBankAccounts.id,
        bankCode: creatorBankAccounts.bankCode,
        accountNumberLast4: creatorBankAccounts.accountNumberLast4,
        updatedAt: creatorBankAccounts.updatedAt,
      });

    if (!account) {
      throw new NotFoundError("Bank account not found");
    }

    return account;
  }
}
