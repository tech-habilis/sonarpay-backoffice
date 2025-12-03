import type { Agent } from "@forestadmin/forest-cloud";
import { Schema } from "../../typings";
import { MangoPayUserService } from "../lib/mangopay/user-service";
import { MangoPayWalletService } from "../lib/mangopay/wallet-service";
import {
  createSupabaseClient,
  createServiceRoleClient,
} from "../lib/supabase/client";

/**
 * Generate a unique referral code in the format: 8 uppercase alphanumeric characters (e.g., "QN8FEZ48")
 */
function generateReferralCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Register the "Add New Merchant" action for the merchants collection
 */
export function registerCreateMerchantAction(agent: Agent<Schema>) {
  agent.customizeCollection("merchants", (collection) => {
    collection.addAction("Add New Merchant", {
      scope: "Global",
      form: [
        {
          label: "Business Name",
          type: "String",
          isRequired: true,
          description: "The name of the business",
        },
        {
          label: "Business Type",
          type: "Enum",
          enumValues: ["goods", "services"],
          isRequired: true,
          description: "Type of business",
        },
        {
          label: "Email",
          type: "String",
          isRequired: true,
          description: "Email address for the user account",
        },
        {
          label: "First Name",
          type: "String",
          isRequired: true,
          description: "First name of the user",
        },
        {
          label: "Last Name",
          type: "String",
          isRequired: true,
          description: "Last name of the user",
        },
        {
          label: "Country",
          type: "String",
          isRequired: true,
          description: "Country code (e.g., FR, US) for the user",
        },
        {
          label: "Password",
          type: "String",
          isRequired: true,
          description: "Password for the user account (minimum 6 characters)",
        },
        {
          label: "Company Number (SIRET)",
          type: "String",
          isRequired: true,
          description:
            "Company registration number (SIRET) required for MangoPay LEGAL user",
        },
        {
          label: "Address Line 1",
          type: "String",
          isRequired: false,
          description: "Business address line 1",
        },
        {
          label: "City",
          type: "String",
          isRequired: false,
          description: "City for the business address",
        },
        {
          label: "Postal Code",
          type: "String",
          isRequired: false,
          description: "Postal code for the business address",
        },
      ],
      execute: async (context, resultBuilder) => {
        try {
          // Get form values
          const formValues = context.formValues;

          // Extract form field values
          const businessName = formValues["Business Name"] as string;
          const businessType = formValues["Business Type"] as
            | "goods"
            | "services";
          const email = formValues["Email"] as string;
          const firstName = formValues["First Name"] as string;
          const lastName = formValues["Last Name"] as string;
          const country = formValues["Country"] as string;
          const password = formValues["Password"] as string;
          const companyNumber = formValues["Company Number (SIRET)"] as string;
          const addressLine1 = formValues["Address Line 1"] as
            | string
            | undefined;
          const city = formValues["City"] as string | undefined;
          const postalCode = formValues["Postal Code"] as string | undefined;

          // Validate required fields
          if (
            !businessName ||
            !businessType ||
            !email ||
            !firstName ||
            !lastName ||
            !country ||
            !password ||
            !companyNumber
          ) {
            return resultBuilder.error("All fields are required");
          }

          // Validate email format
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(email)) {
            return resultBuilder.error("Invalid email format");
          }

          // Validate password (minimum 6 characters, matching reference validation)
          if (password.length < 6) {
            return resultBuilder.error(
              "Password must be at least 6 characters"
            );
          }

          // Step 1: Create user in Supabase Auth using standard signUp method
          const supabase = createSupabaseClient();
          let authData;
          try {
            const { data, error: authError } = await supabase.auth.signUp({
              email,
              password,
              options: {
                data: {
                  first_name: firstName,
                  last_name: lastName,
                  business_name: businessName,
                  user_type: "merchant",
                },
              },
            });

            if (authError) {
              console.error("Auth signup error:", authError);
              return resultBuilder.error(
                `Failed to create user account: ${authError.message}`
              );
            }

            if (!data.user) {
              return resultBuilder.error(
                "Failed to create user account: No user data returned from auth"
              );
            }

            authData = data;
            // Skip email confirmation gate and proceed with setup immediately
            console.log(
              "⚙️  Skipping email confirmation gate; proceeding with merchant setup"
            );
          } catch (authError) {
            console.error("Auth signup error:", authError);
            return resultBuilder.error(
              `Failed to create user account: ${(authError as Error).message}`
            );
          }

          // Store auth user ID for use throughout the function
          // authData.user is guaranteed to be non-null at this point due to the check above
          const authUserId = authData.user!.id;

          const usersCollection = context.dataSource.getCollection("users");

          // Generate unique referral code for the user
          let userReferralCode: string;
          let isUserCodeUnique = false;
          let userAttempts = 0;
          const maxAttempts = 10;

          while (!isUserCodeUnique && userAttempts < maxAttempts) {
            userReferralCode = generateReferralCode();
            const existingUsers = await usersCollection.list(
              {
                conditionTree: {
                  field: "referral_code",
                  operator: "Equal",
                  value: userReferralCode,
                },
              },
              ["id"]
            );

            if (existingUsers.length === 0) {
              isUserCodeUnique = true;
            } else {
              userAttempts++;
            }
          }

          if (!isUserCodeUnique) {
            return resultBuilder.error(
              "Failed to generate unique user referral code. Please try again."
            );
          }

          // Generate unique referral code for the merchant
          let merchantReferralCode: string;
          let isMerchantCodeUnique = false;
          let merchantAttempts = 0;

          while (!isMerchantCodeUnique && merchantAttempts < maxAttempts) {
            merchantReferralCode = generateReferralCode();
            const existingMerchants = await context.collection.list(
              {
                conditionTree: {
                  field: "referral_code",
                  operator: "Equal",
                  value: merchantReferralCode,
                },
              },
              ["id"]
            );

            if (existingMerchants.length === 0) {
              isMerchantCodeUnique = true;
            } else {
              merchantAttempts++;
            }
          }

          if (!isMerchantCodeUnique) {
            return resultBuilder.error(
              "Failed to generate unique merchant referral code. Please try again."
            );
          }

          // Step 3: Create user record in database using the auth user ID
          let createdUser;
          try {
            const serviceSupabase = createServiceRoleClient();
            const now = new Date().toISOString();

            const { data: insertedUser, error: insertError } =
              await serviceSupabase
                .from("users")
                .insert({
                  id: authUserId, // Use the same ID from Supabase Auth
                  email: email,
                  first_name: firstName,
                  last_name: lastName,
                  country: country,
                  user_type: "reseller", // Using "reseller" as per schema type definition
                  referral_code: userReferralCode!,
                  is_active: true,
                  kyc_status: "pending",
                  created_at: now,
                  updated_at: now,
                })
                .select()
                .single();

            if (insertError) {
              throw insertError;
            }

            if (!insertedUser) {
              return resultBuilder.error(
                "Failed to create user: No data returned"
              );
            }

            createdUser = insertedUser;
          } catch (userError) {
            // Clean up the auth user if user record creation fails
            try {
              const serviceSupabase = createServiceRoleClient();
              await serviceSupabase.auth.admin.deleteUser(authUserId);
            } catch (cleanupError) {
              console.error(
                "Failed to cleanup auth user after user creation error:",
                cleanupError
              );
            }
            return resultBuilder.error(
              `Failed to create user: ${(userError as Error).message}`
            );
          }

          // Create Mangopay user
          let mangopayUserId: string;
          try {
            console.log("🔍 [create-merchant] About to create Mangopay user");
            console.log(
              "🔍 [create-merchant] createdUser:",
              JSON.stringify(createdUser, null, 2)
            );
            console.log("🔍 [create-merchant] businessName:", businessName);

            const mangoPayUserService = new MangoPayUserService();
            console.log(
              "🔍 [create-merchant] MangoPayUserService instance created"
            );

            // Build address object only if at least one field is provided
            const hasAddressData =
              (addressLine1 && addressLine1.trim()) ||
              (city && city.trim()) ||
              (postalCode && postalCode.trim());

            mangopayUserId = await mangoPayUserService.createUserFromData(
              createdUser as Schema["users"]["plain"],
              {
                businessName,
                siret: companyNumber,
                userId: createdUser.id,
                address: hasAddressData
                  ? {
                      addressLine1: addressLine1?.trim() || undefined,
                      city: city?.trim() || undefined,
                      postalCode: postalCode?.trim() || undefined,
                      country: country,
                    }
                  : undefined,
              }
            );

            console.log(
              "🔍 [create-merchant] Mangopay user created successfully, ID:",
              mangopayUserId
            );

            // Update user record with Mangopay user ID
            const serviceSupabase = createServiceRoleClient();
            const { error: updateError } = await serviceSupabase
              .from("users")
              .update({
                mangopay_user_id: mangopayUserId,
                updated_at: new Date().toISOString(),
              })
              .eq("id", createdUser.id);

            if (updateError) {
              throw updateError;
            }
          } catch (mangopayError) {
            // If Mangopay user creation fails, clean up the created user and auth user
            try {
              const serviceSupabase = createServiceRoleClient();
              const { error: deleteError } = await serviceSupabase
                .from("users")
                .delete()
                .eq("id", createdUser.id);

              if (deleteError) {
                console.error(
                  "Failed to cleanup user after Mangopay error:",
                  deleteError
                );
              }
            } catch (cleanupError) {
              console.error(
                "Failed to cleanup user after Mangopay error:",
                cleanupError
              );
            }
            try {
              const serviceSupabase = createServiceRoleClient();
              await serviceSupabase.auth.admin.deleteUser(authUserId);
            } catch (cleanupError) {
              console.error(
                "Failed to cleanup auth user after Mangopay error:",
                cleanupError
              );
            }
            return resultBuilder.error(
              `Failed to create Mangopay user: ${
                (mangopayError as Error).message
              }`
            );
          }

          // Create MangoPay wallet for the merchant
          let mangopayWalletId: string;
          try {
            const mangoPayWalletService = new MangoPayWalletService();
            const mangopayWallet = await mangoPayWalletService.createWallet(
              mangopayUserId
            );
            mangopayWalletId = mangopayWallet.Id;
          } catch (walletError) {
            // If wallet creation fails, clean up the created user and auth user
            // Note: We can't easily delete Mangopay user, but we can delete the local user and auth user
            try {
              const serviceSupabase = createServiceRoleClient();
              const { error: deleteError } = await serviceSupabase
                .from("users")
                .delete()
                .eq("id", createdUser.id);

              if (deleteError) {
                console.error(
                  "Failed to cleanup user after wallet error:",
                  deleteError
                );
              }
            } catch (cleanupError) {
              console.error(
                "Failed to cleanup user after wallet error:",
                cleanupError
              );
            }
            try {
              const serviceSupabase = createServiceRoleClient();
              await serviceSupabase.auth.admin.deleteUser(authUserId);
            } catch (cleanupError) {
              console.error(
                "Failed to cleanup auth user after wallet error:",
                cleanupError
              );
            }
            return resultBuilder.error(
              `Failed to create Mangopay wallet: ${
                (walletError as Error).message
              }`
            );
          }

          // Create the new merchant record
          let merchant;
          try {
            const serviceSupabase = createServiceRoleClient();
            const now = new Date().toISOString();

            const { data: insertedMerchant, error: insertError } =
              await serviceSupabase
                .from("merchants")
                .insert({
                  business_name: businessName,
                  business_type: businessType,
                  referral_code: merchantReferralCode!,
                  user_id: createdUser.id,
                  mangopay_merchant_id: mangopayUserId,
                  mangopay_wallet_id: mangopayWalletId,
                  siret: companyNumber,
                  address_line1: addressLine1 || null,
                  city: city || null,
                  postal_code: postalCode || null,
                  country: country || null,
                  created_at: now,
                  updated_at: now,
                })
                .select()
                .single();

            if (insertError) {
              throw insertError;
            }

            if (!insertedMerchant) {
              return resultBuilder.error(
                "Failed to create merchant: No data returned"
              );
            }

            merchant = insertedMerchant;
          } catch (merchantError) {
            // If merchant creation fails, clean up user and auth user
            try {
              const serviceSupabase = createServiceRoleClient();
              const { error: deleteError } = await serviceSupabase
                .from("users")
                .delete()
                .eq("id", createdUser.id);

              if (deleteError) {
                console.error(
                  "Failed to cleanup user after merchant error:",
                  deleteError
                );
              }
            } catch (cleanupError) {
              console.error(
                "Failed to cleanup user after merchant error:",
                cleanupError
              );
            }
            try {
              const serviceSupabase = createServiceRoleClient();
              await serviceSupabase.auth.admin.deleteUser(authUserId);
            } catch (cleanupError) {
              console.error(
                "Failed to cleanup auth user after merchant error:",
                cleanupError
              );
            }
            return resultBuilder.error(
              `Failed to create merchant: ${(merchantError as Error).message}`
            );
          }

          return resultBuilder.success(
            `Merchant "${businessName}" created successfully with ID: ${merchant.id}. User ID: ${createdUser.id}, Mangopay user ID: ${mangopayUserId}, Wallet ID: ${mangopayWalletId}`
          );
        } catch (error) {
          return resultBuilder.error((error as Error).message);
        }
      },
    });
  });
}
