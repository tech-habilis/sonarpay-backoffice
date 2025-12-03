import { Schema } from "../../../typings";
import { getMangopayClient } from "./client";

export interface CreateMangoPayUserParams {
  email: string;
  firstName: string;
  lastName: string;
  dateOfBirth?: string | Date | number;
  nationality?: string;
  countryOfResidence?: string;
  address?: {
    addressLine1: string;
    city: string;
    postalCode: string;
    country: string;
  };
  userType: "reseller" | "client";
  companyName?: string;
  legalPersonType?: "BUSINESS" | "ORGANIZATION";
  companyNumber?: string;
  tag?: string;
  termsAndConditionsAccepted?: boolean;
}

export interface MangoPayUser {
  Id: string;
  Email: string;
  FirstName: string;
  LastName: string;
  KYCStatus?: string;
  [key: string]: unknown;
}

/**
 * Service for managing MangoPay users
 */
export class MangoPayUserService {
  /**
   * Create a MangoPay user from user data and merchant data
   */
  async createUserFromData(
    userData: Schema["users"]["plain"],
    merchantData: {
      businessName: string;
      siret: string | null;
      userId: string;
    }
  ): Promise<string> {
    console.log(
      "🔍 [MangoPayUserService.createUserFromData] Starting user creation"
    );
    console.log(
      "🔍 [MangoPayUserService.createUserFromData] userData:",
      JSON.stringify(userData, null, 2)
    );
    console.log(
      "🔍 [MangoPayUserService.createUserFromData] merchantData:",
      JSON.stringify(merchantData, null, 2)
    );

    // Convert date of birth to Unix timestamp (seconds)
    let dateOfBirthTimestamp: number;
    if (userData.date_of_birth) {
      dateOfBirthTimestamp = Math.floor(
        new Date(userData.date_of_birth).getTime() / 1000
      );
    } else {
      // Default to a valid date if not provided (required by Mangopay)
      dateOfBirthTimestamp = Math.floor(
        new Date("1985-01-01").getTime() / 1000
      );
    }

    // Use user's country for both nationality and countryOfResidence
    const country = userData.country || "FR";
    const nationality = country;
    const countryOfResidence = country;

    // Prepare address - use merchant address if available, otherwise use defaults
    const address = {
      addressLine1: "Business address to be provided",
      city: "Paris",
      postalCode: "75001",
      country: country,
    };

    const createUserParams: CreateMangoPayUserParams = {
      email: userData.email,
      firstName: userData.first_name,
      lastName: userData.last_name,
      dateOfBirth: dateOfBirthTimestamp,
      nationality: nationality,
      countryOfResidence: countryOfResidence,
      address: address,
      userType: "reseller",
      companyName: merchantData.businessName,
      legalPersonType: "BUSINESS",
      companyNumber: merchantData.siret || "",
      tag: `reseller-${merchantData.userId}`,
      termsAndConditionsAccepted: true,
    };

    console.log(
      "🔍 [MangoPayUserService.createUserFromData] Calling createUser with params:",
      JSON.stringify(createUserParams, null, 2)
    );

    const mangopayUser = await this.createUser(createUserParams);

    console.log(
      "🔍 [MangoPayUserService.createUserFromData] Created Mangopay user:",
      JSON.stringify(mangopayUser, null, 2)
    );
    console.log(
      "🔍 [MangoPayUserService.createUserFromData] Mangopay user ID:",
      mangopayUser.Id
    );

    return mangopayUser.Id;
  }

  /**
   * Create a MangoPay user with the provided parameters
   */
  async createUser(params: CreateMangoPayUserParams): Promise<MangoPayUser> {
    console.log("🔍 [MangoPayUserService.createUser] Starting createUser");
    console.log(
      "🔍 [MangoPayUserService.createUser] params:",
      JSON.stringify(params, null, 2)
    );

    const api = getMangopayClient();
    console.log("🔍 [MangoPayUserService.createUser] MangoPay client obtained");
    console.log("🔍 [MangoPayUserService.createUser] api type:", typeof api);
    console.log("🔍 [MangoPayUserService.createUser] api:", api);
    console.log("🔍 [MangoPayUserService.createUser] api.Users:", api.Users);
    console.log(
      "🔍 [MangoPayUserService.createUser] api.Users type:",
      typeof api.Users
    );

    if (api.Users) {
      console.log(
        "🔍 [MangoPayUserService.createUser] api.Users.create:",
        typeof api.Users.create
      );
      console.log(
        "🔍 [MangoPayUserService.createUser] api.Users keys:",
        Object.keys(api.Users)
      );
    } else {
      console.error(
        "❌ [MangoPayUserService.createUser] api.Users is undefined!"
      );
      console.log(
        "🔍 [MangoPayUserService.createUser] api keys:",
        Object.keys(api || {})
      );
    }

    // Convert date of birth to Unix timestamp if it's a Date or string
    let dateOfBirth: number;
    if (typeof params.dateOfBirth === "number") {
      dateOfBirth = params.dateOfBirth;
    } else if (params.dateOfBirth instanceof Date) {
      dateOfBirth = Math.floor(params.dateOfBirth.getTime() / 1000);
    } else if (typeof params.dateOfBirth === "string") {
      dateOfBirth = Math.floor(new Date(params.dateOfBirth).getTime() / 1000);
    } else {
      // Default to a valid date if not provided (required by Mangopay)
      dateOfBirth = Math.floor(new Date("1985-01-01").getTime() / 1000);
    }

    // Determine if this is a LEGAL user (merchant/reseller) or NATURAL user (client)
    const isLegalUser = params.userType === "reseller" || !!params.companyName;
    console.log(
      "🔍 [MangoPayUserService.createUser] isLegalUser:",
      isLegalUser
    );

    let mangopayUser;

    if (isLegalUser) {
      // For LEGAL users (merchants), MangoPay requires different field names
      const address = params.address || {
        addressLine1: "Business address to be provided",
        city: "Paris",
        postalCode: "75001",
        country: "FR",
      };

      // CompanyNumber is required for LEGAL users
      if (!params.companyNumber || params.companyNumber.trim() === "") {
        throw new Error(
          "CompanyNumber (SIRET) is required for LEGAL users but was not provided"
        );
      }

      const legalUserData = {
        PersonType: "LEGAL",
        Name: params.companyName || `${params.firstName} ${params.lastName}`,
        Email: params.email,
        LegalPersonType: params.legalPersonType || "BUSINESS",
        LegalRepresentativeFirstName: params.firstName,
        LegalRepresentativeLastName: params.lastName,
        LegalRepresentativeEmail: params.email,
        LegalRepresentativeBirthday: dateOfBirth,
        LegalRepresentativeNationality: params.nationality || "FR",
        LegalRepresentativeCountryOfResidence:
          params.countryOfResidence || "FR",
        HeadquartersAddress: {
          AddressLine1: address.addressLine1,
          City: address.city,
          PostalCode: address.postalCode,
          Country: address.country,
        },
        CompanyNumber: params.companyNumber,
        UserCategory: "Owner",
        Tag: params.tag,
        TermsAndConditionsAccepted: params.termsAndConditionsAccepted ?? true,
      };

      console.log(
        "🔍 [MangoPayUserService.createUser] Creating LEGAL user with data:",
        JSON.stringify(legalUserData, null, 2)
      );
      console.log(
        "🔍 [MangoPayUserService.createUser] About to call api.Users.create..."
      );

      try {
        mangopayUser = await api.Users.create(legalUserData);
        console.log(
          "🔍 [MangoPayUserService.createUser] LEGAL user created successfully:",
          JSON.stringify(mangopayUser, null, 2)
        );
      } catch (error) {
        console.error(
          "❌ [MangoPayUserService.createUser] Error creating LEGAL user:",
          error
        );
        console.error("❌ [MangoPayUserService.createUser] Error details:", {
          message: (error as Error).message,
          stack: (error as Error).stack,
          name: (error as Error).name,
        });
        throw error;
      }
    } else {
      // For NATURAL users (clients)
      const address = params.address || {
        addressLine1: "Address to be provided",
        city: "Paris",
        postalCode: "75001",
        country: "FR",
      };

      const naturalUserData = {
        PersonType: "NATURAL",
        FirstName: params.firstName,
        LastName: params.lastName,
        Email: params.email,
        Birthday: dateOfBirth,
        Nationality: params.nationality || "FR",
        CountryOfResidence: params.countryOfResidence || "FR",
        Address: {
          AddressLine1: address.addressLine1,
          City: address.city,
          PostalCode: address.postalCode,
          Country: address.country,
        },
        UserCategory: "Owner",
        Tag: params.tag,
        TermsAndConditionsAccepted: params.termsAndConditionsAccepted ?? true,
      };

      console.log(
        "🔍 [MangoPayUserService.createUser] Creating NATURAL user with data:",
        JSON.stringify(naturalUserData, null, 2)
      );
      console.log(
        "🔍 [MangoPayUserService.createUser] About to call api.Users.create..."
      );

      try {
        mangopayUser = await api.Users.create(naturalUserData);
        console.log(
          "🔍 [MangoPayUserService.createUser] NATURAL user created successfully:",
          JSON.stringify(mangopayUser, null, 2)
        );
      } catch (error) {
        console.error(
          "❌ [MangoPayUserService.createUser] Error creating NATURAL user:",
          error
        );
        console.error("❌ [MangoPayUserService.createUser] Error details:", {
          message: (error as Error).message,
          stack: (error as Error).stack,
          name: (error as Error).name,
        });
        throw error;
      }
    }

    return mangopayUser;
  }
}
