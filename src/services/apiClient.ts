import axios, { AxiosError, type AxiosInstance, type AxiosRequestConfig } from "axios";

export interface RequestOptions {
  signal?: AbortSignal;
  timeoutMs?: number;
  retries?: number;
  retryDelayMs?: number;
}

export interface ApiErrorShape {
  message: string;
  status?: number;
  code?: string;
  isTimeout?: boolean;
  isNetworkError?: boolean;
}

const DEFAULT_TIMEOUT_MS = 10000;
const DEFAULT_RETRIES = 2;
const DEFAULT_RETRY_DELAY_MS = 300;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const createApiClient = (baseURL: string): AxiosInstance => {
  return axios.create({
    baseURL,
    timeout: DEFAULT_TIMEOUT_MS,
  });
};

const isRetryableError = (error: AxiosError): boolean => {
  if (error.code === "ERR_CANCELED") return false;
  if (error.code === "ECONNABORTED") return true;
  if (!error.response) return true;
  const status = error.response.status;
  return status === 408 || status === 429 || status >= 500;
};

export const toApiError = (error: unknown, fallbackMessage: string): ApiErrorShape => {
  if (axios.isAxiosError(error)) {
    const message =
      (typeof error.response?.data === "object" &&
      error.response?.data &&
      "error" in error.response.data
        ? String((error.response.data as { error?: string }).error)
        : undefined) ||
      error.message ||
      fallbackMessage;

    return {
      message,
      status: error.response?.status,
      code: error.code,
      isTimeout: error.code === "ECONNABORTED",
      isNetworkError: !error.response,
    };
  }

  return { message: error instanceof Error ? error.message : fallbackMessage };
};

export const requestWithRetry = async <T>(
  client: AxiosInstance,
  config: AxiosRequestConfig,
  options?: RequestOptions
): Promise<T> => {
  const retries = options?.retries ?? DEFAULT_RETRIES;
  const retryDelayMs = options?.retryDelayMs ?? DEFAULT_RETRY_DELAY_MS;
  const timeout = options?.timeoutMs ?? DEFAULT_TIMEOUT_MS;

  for (let attempt = 0; ; attempt += 1) {
    try {
      const response = await client.request<T>({
        ...config,
        timeout,
        signal: options?.signal,
      });
      return response.data;
    } catch (error) {
      if (!axios.isAxiosError(error) || attempt >= retries || !isRetryableError(error)) {
        throw error;
      }
      const backoffMs = retryDelayMs * 2 ** attempt;
      await sleep(backoffMs);
    }
  }
};

