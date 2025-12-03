// eslint-disable-next-line @typescript-eslint/no-require-imports
const MangoPay = require("mangopay4-nodejs-sdk");

const MANGOPAY_CLIENT_ID = process.env.MANGOPAY_CLIENT_ID || "sonarpaydev";
const MANGOPAY_CLIENT_API_KEY = process.env.MANGOPAY_CLIENT_API_KEY || "";
const MANGOPAY_BASE_URL =
  process.env.MANGOPAY_BASE_URL || "https://api.sandbox.mangopay.com";
const IS_DEVELOPMENT = process.env.NODE_ENV !== "production";

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
