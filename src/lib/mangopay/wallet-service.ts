import { getMangopayClient } from "./client";

export interface MangoPayWallet {
  Id: string;
  OwnerId: string;
  Balance: {
    Currency: string;
    Amount: number;
  };
  Currency: string;
  [key: string]: unknown;
}

/**
 * Service for managing MangoPay wallets
 */
export class MangoPayWalletService {
  /**
   * Create a wallet for a MangoPay user
   */
  async createWallet(mangoPayUserId: string): Promise<MangoPayWallet> {
    const api = getMangopayClient();

    const wallet = await api.Wallets.create({
      Owners: [mangoPayUserId],
      Currency: "EUR",
      Description: `Wallet for user ${mangoPayUserId}`,
    });

    return wallet;
  }
}

