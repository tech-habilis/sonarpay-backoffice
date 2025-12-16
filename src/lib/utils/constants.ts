// Forest Admin Configuration
export const FOREST_ENV_SECRET =
  process.env.FOREST_ENV_SECRET ||
  "5925c5efe650f262525513d9e3981f98f712ba31b5b6e8a7b873421f794d4d92";

export const TOKEN_PATH = process.env.TOKEN_PATH || "/Users/antikode";

export const LOG_LEVEL = process.env.LOG_LEVEL || "Info";

// MangoPay Configuration
export const MANGOPAY_CLIENT_ID =
  process.env.MANGOPAY_CLIENT_ID || "sonarpaydev";

export const MANGOPAY_CLIENT_API_KEY =
  process.env.MANGOPAY_CLIENT_API_KEY ||
  "JdXXhYY76qJlJo0qDYCSsQ1TzDyT4dEyrfC99gzASrJogV2SeA";

export const MANGOPAY_BASE_URL =
  process.env.MANGOPAY_BASE_URL || "https://api.sandbox.mangopay.com";

// Supabase Configuration
export const SUPABASE_PROJECT_ID =
  process.env.SUPABASE_PROJECT_ID || "cuuzmaxskfxalaqgupve";

export const SUPABASE_URL =
  process.env.SUPABASE_URL || "https://cuuzmaxskfxalaqgupve.supabase.co";

export const SUPABASE_ANON_KEY =
  process.env.SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN1dXptYXhza2Z4YWxhcWd1cHZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAwNzQ2NTUsImV4cCI6MjA3NTY1MDY1NX0.x23mNRFfaTflLClmKoQL4rQAFBslMmb_AJhWeLfBCEk";

export const SUPABASE_SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN1dXptYXhza2Z4YWxhcWd1cHZlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDA3NDY1NSwiZXhwIjoyMDc1NjUwNjU1fQ.Tq7ivUl6hDBxOspgUxjzLXaz914WOhoBqlV9LjzC6Lc";

export const SUPABASE_PUBLISHABLE_KEY =
  process.env.SUPABASE_PUBLISHABLE_KEY ||
  "sb_publishable_vPNYCTpCFuEJX0SrlE6OnQ_HJk4dbBR";

export const SUPABASE_ACCESS_TOKEN =
  process.env.SUPABASE_ACCESS_TOKEN ||
  "sbp_8e69803f67645ae5799e005740fe0ef5f1fa2b25";

export const IS_DEVELOPMENT = process.env.NODE_ENV !== "production";
