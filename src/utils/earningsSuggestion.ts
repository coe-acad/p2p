export const EARNINGS_SUGGESTION_KEY = "samai_earnings_suggestion";
export const EARNINGS_MODAL_PENDING_KEY = "samai_show_earnings_modal";
export const EARNINGS_MODAL_SEEN_KEY = "samai_earnings_modal_seen";

export type EarningsSuggestion = {
  minEarnings: number;
  maxEarnings: number;
  capacityKw: number;
  createdAt: string;
};

const parseCapacity = (value: unknown): number => {
  if (value === null || value === undefined) return 5;
  const numeric = parseInt(String(value), 10);
  return Number.isFinite(numeric) && numeric > 0 ? numeric : 5;
};

export const computeEarningsSuggestion = (capacityKw: number): EarningsSuggestion => {
  const baseMin = 80;
  const baseMax = 95;
  const additionalCapacity = Math.max(0, capacityKw - 5);
  const minEarnings = Math.round(baseMin + additionalCapacity * 1.6);
  const maxEarnings = Math.round(baseMax + additionalCapacity * 2.3);

  return {
    minEarnings,
    maxEarnings,
    capacityKw,
    createdAt: new Date().toISOString(),
  };
};

export const loadEarningsSuggestion = (): EarningsSuggestion | null => {
  const raw = localStorage.getItem(EARNINGS_SUGGESTION_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (
      typeof parsed?.minEarnings === "number" &&
      typeof parsed?.maxEarnings === "number" &&
      typeof parsed?.capacityKw === "number"
    ) {
      return parsed as EarningsSuggestion;
    }
  } catch {
    return null;
  }
  return null;
};

export const saveEarningsSuggestion = (vcData?: Record<string, unknown>): EarningsSuggestion => {
  const capacityKw = parseCapacity(vcData?.generationCapacity);
  const suggestion = computeEarningsSuggestion(capacityKw);
  localStorage.setItem(EARNINGS_SUGGESTION_KEY, JSON.stringify(suggestion));
  return suggestion;
};

export const getOrCreateEarningsSuggestion = (vcData?: Record<string, unknown>): EarningsSuggestion => {
  return loadEarningsSuggestion() ?? saveEarningsSuggestion(vcData);
};

export const markEarningsModalPending = (): void => {
  if (localStorage.getItem(EARNINGS_MODAL_SEEN_KEY) === "true") return;
  localStorage.setItem(EARNINGS_MODAL_PENDING_KEY, "true");
};

export const shouldShowEarningsModal = (): boolean => {
  const pending = localStorage.getItem(EARNINGS_MODAL_PENDING_KEY) === "true";
  const seen = localStorage.getItem(EARNINGS_MODAL_SEEN_KEY) === "true";
  return pending && !seen;
};

export const markEarningsModalSeen = (): void => {
  localStorage.setItem(EARNINGS_MODAL_SEEN_KEY, "true");
  localStorage.removeItem(EARNINGS_MODAL_PENDING_KEY);
};
