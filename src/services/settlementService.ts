import { z } from "zod";
import { getAuthHeaders } from "@/services/authHeaders";
import {
  createApiClient,
  requestWithRetry,
  resolveRequiredEnv,
  toApiError,
  type RequestOptions,
} from "@/services/apiClient";

/**
 * Settlements & payout methods.
 *
 * Everything goes through our own backends — sellers via the BPP, buyers via
 * the BAP. The frontend never talks to atria-payments directly; the backends
 * anchor identity to the Firebase token and proxy over signed HTTP.
 */

const BPP_URL = resolveRequiredEnv(import.meta.env.VITE_BACKEND_URL, "http://localhost:3002", "VITE_BACKEND_URL");
const BAP_URL = resolveRequiredEnv(import.meta.env.VITE_BAP_URL, "http://localhost:8001", "VITE_BAP_URL");
const bppClient = createApiClient(BPP_URL);
const bapClient = createApiClient(BAP_URL);

// ---------------------------------------------------------------------------
// Schemas — mirror the backend response shapes exactly.
// ---------------------------------------------------------------------------

export const PayoutAccountSchema = z.object({
  seller_phone: z.string().nullable().optional(),
  mode: z.enum(["bank", "upi"]),
  masked_target: z.string(),
  account_holder_name: z.string().nullable().optional(),
  status: z.string(),
});

const PayoutAccountEnvelopeSchema = z.object({
  replayed: z.boolean().optional(),
  account: PayoutAccountSchema,
});

export const SettlementSchema = z.object({
  txn_id: z.string().nullable().optional(),
  status: z.string(),
  outcome: z.string().nullable().optional(),
  ordered_kwh: z.number().nullable().optional(),
  allocated_kwh: z.number().nullable().optional(),
  payout_amount_paise: z.number().nullable().optional(),
  payout_status: z.string().nullable().optional(),
  created_at: z.string().nullable().optional(),
  settled_at: z.string().nullable().optional(),
});

const SettlementsEnvelopeSchema = z.object({
  settlements: z.array(SettlementSchema).optional().default([]),
});

export const RefundSchema = z.object({
  txn_id: z.string().nullable().optional(),
  amount_paise: z.number().nullable().optional(),
  status: z.string(),
  reason: z.string().nullable().optional(),
  created_at: z.string().nullable().optional(),
});

const RefundsEnvelopeSchema = z.object({
  refunds: z.array(RefundSchema).optional().default([]),
});

export type PayoutAccount = z.infer<typeof PayoutAccountSchema>;
export type Settlement = z.infer<typeof SettlementSchema>;
export type Refund = z.infer<typeof RefundSchema>;

export interface SavePayoutDetailsRequest {
  mode: "bank" | "upi";
  account_holder_name: string;
  ifsc?: string;
  account_number?: string;
  vpa?: string;
}

// ---------------------------------------------------------------------------
// Seller (BPP)
// ---------------------------------------------------------------------------

/** The seller's masked payout method, or null when none is on file yet. */
export const getPayoutDetails = async (options?: RequestOptions): Promise<PayoutAccount | null> => {
  try {
    const headers = await getAuthHeaders();
    const data = await requestWithRetry<unknown>(
      bppClient,
      { url: "/api/seller/payout-details", method: "GET", headers },
      options
    );
    return PayoutAccountEnvelopeSchema.parse(data).account;
  } catch (error) {
    const apiError = toApiError(error, "Failed to fetch payout details");
    if (apiError.status === 404) {
      return null; // not onboarded yet — expected state, not an error
    }
    throw apiError;
  }
};

export const savePayoutDetails = async (
  request: SavePayoutDetailsRequest,
  options?: RequestOptions
): Promise<PayoutAccount> => {
  try {
    const headers = await getAuthHeaders();
    const data = await requestWithRetry<unknown>(
      bppClient,
      { url: "/api/seller/payout-details", method: "POST", data: request, headers },
      // No automatic retries on submission: the backend is idempotent for the
      // same target, but a user-corrected resubmit must not race a retry.
      { ...options, retries: 0 }
    );
    return PayoutAccountEnvelopeSchema.parse(data).account;
  } catch (error) {
    throw toApiError(error, "Failed to save payout details");
  }
};

/** The seller's settlements (one per trade that reached a terminal outcome). */
export const getSellerSettlements = async (options?: RequestOptions): Promise<Settlement[]> => {
  try {
    const headers = await getAuthHeaders();
    const data = await requestWithRetry<unknown>(
      bppClient,
      { url: "/api/seller/settlements", method: "GET", headers },
      options
    );
    return SettlementsEnvelopeSchema.parse(data).settlements;
  } catch (error) {
    throw toApiError(error, "Failed to fetch settlements");
  }
};

// ---------------------------------------------------------------------------
// Buyer (BAP)
// ---------------------------------------------------------------------------

/** The buyer's refunds, keyed by transaction. */
export const getBuyerRefunds = async (options?: RequestOptions): Promise<Refund[]> => {
  try {
    const headers = await getAuthHeaders();
    const data = await requestWithRetry<unknown>(
      bapClient,
      { url: "/api/buyer/refunds", method: "GET", headers },
      options
    );
    return RefundsEnvelopeSchema.parse(data).refunds;
  } catch (error) {
    throw toApiError(error, "Failed to fetch refunds");
  }
};

// ---------------------------------------------------------------------------
// Display helpers — one place for money/status formatting so every surface
// renders settlements identically.
// ---------------------------------------------------------------------------

export const paiseToRupees = (paise: number | null | undefined): number =>
  typeof paise === "number" ? paise / 100 : 0;

export const formatRupees = (paise: number | null | undefined): string =>
  `₹${paiseToRupees(paise).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
