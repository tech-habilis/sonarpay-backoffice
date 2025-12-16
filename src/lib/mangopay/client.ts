// eslint-disable-next-line @typescript-eslint/no-require-imports
const MangoPay = require("mangopay4-nodejs-sdk");

import {
  MANGOPAY_CLIENT_ID,
  MANGOPAY_CLIENT_API_KEY,
  MANGOPAY_BASE_URL,
  IS_DEVELOPMENT,
} from "../utils/constants";

// MangoPay SDK Configuration
export const MANGOPAY_CONFIG = {
  clientId: MANGOPAY_CLIENT_ID,
  clientApiKey: MANGOPAY_CLIENT_API_KEY,
  baseUrl: MANGOPAY_BASE_URL,
  debugMode: IS_DEVELOPMENT,
  connectionTimeout: 30000,
  responseTimeout: 80000,
  apiVersion: "v2.01",
} as const;

/**
 * Initialize and return a MangoPay client instance
 */
export function getMangopayClient() {
  console.log("🔍 [getMangopayClient] Initializing MangoPay client");
  console.log(
    "🔍 [getMangopayClient] MANGOPAY_CONFIG:",
    JSON.stringify(
      {
        ...MANGOPAY_CONFIG,
        clientApiKey: MANGOPAY_CONFIG.clientApiKey
          ? "***REDACTED***"
          : "MISSING",
      },
      null,
      2
    )
  );
  console.log("🔍 [getMangopayClient] MangoPay constructor:", typeof MangoPay);

  const client = new MangoPay(MANGOPAY_CONFIG);
  console.log("🔍 [getMangopayClient] Client created:", typeof client);
  console.log("🔍 [getMangopayClient] Client keys:", Object.keys(client || {}));
  console.log("🔍 [getMangopayClient] Client.Users:", client.Users);

  return client;
}
