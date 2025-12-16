// Forest Admin Configuration
export const FOREST_ENV_SECRET = process.env.FOREST_ENV_SECRET || "";

export const TOKEN_PATH = process.env.TOKEN_PATH || "/Users/antikode";

export const LOG_LEVEL = process.env.LOG_LEVEL || "Info";

// MangoPay Configuration
export const MANGOPAY_CLIENT_ID =
  process.env.MANGOPAY_CLIENT_ID || "sonarpaydev";

export const MANGOPAY_CLIENT_API_KEY =
  process.env.MANGOPAY_CLIENT_API_KEY || "";

export const MANGOPAY_BASE_URL =
  process.env.MANGOPAY_BASE_URL || "https://api.sandbox.mangopay.com";

// Supabase Configuration
export const SUPABASE_PROJECT_ID =
  process.env.SUPABASE_PROJECT_ID || "tjapmbkozozdolranijt";

export const SUPABASE_URL =
  process.env.SUPABASE_URL || "https://tjapmbkozozdolranijt.supabase.co";

export const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || "";

export const SUPABASE_SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY || "";

export const SUPABASE_PUBLISHABLE_KEY =
  process.env.SUPABASE_PUBLISHABLE_KEY || "";

export const SUPABASE_ACCESS_TOKEN = process.env.SUPABASE_ACCESS_TOKEN || "";

export const DATABASE_URL = process.env.DATABASE_URL || "";

export const IS_DEVELOPMENT = process.env.NODE_ENV !== "production";
