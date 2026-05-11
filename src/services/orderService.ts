import { createApiClient, requestWithRetry, resolveRequiredEnv } from '@/services/apiClient';
import { getAuthHeaders } from '@/services/authHeaders';

const generateUUID = () => 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
  const r = (Math.random() * 16) | 0;
  const v = c === 'x' ? r : (r & 0x3) | 0x8;
  return v.toString(16);
});

const BAP_URL = resolveRequiredEnv(import.meta.env.VITE_BAP_URL, 'http://localhost:8001', 'VITE_BAP_URL');
const bapClient = createApiClient(BAP_URL);

export interface OrderDetails {
  offer_id: string;
  seller_id?: string;
  bpp_id?: string;
  bpp_uri?: string;
  offer_item_ids?: string[];
  offer_provider?: string;
  offer_descriptor?: Record<string, unknown>;
  offer_price?: Record<string, unknown>;
  offer_attributes?: Record<string, unknown>;
  quantity: number;
  price_per_unit: number;
  seller_name: string;
  delivery_start: string;
  delivery_end: string;
}

export interface SelectResponse {
  transactionId: string;
  order: any;
}

export interface InitResponse {
  transactionId: string;
  order: any;
}

export interface ConfirmResponse {
  transactionId: string;
  order: any;
  orderId: string;
}

export interface TradeStatusResponse {
  status: boolean;
  price: number | null;
  state: string | null;
}

export interface OrderStateResponse {
  order_state: string | null;
  context: any;
  order: any;
}

const DEFAULT_BAP_ID = import.meta.env.VITE_ORDER_BAP_ID || 'atria-p2p-trading-bap.com';
const DEFAULT_BAP_URI = resolveRequiredEnv(
  import.meta.env.VITE_ORDER_BAP_URI,
  'https://atria-bap.atriauniversity.ai/bap/receiver',
  'VITE_ORDER_BAP_URI'
);
const DEFAULT_BPP_ID = import.meta.env.VITE_ORDER_BPP_ID || 'atria-p2p-trading-bpp';
const DEFAULT_BPP_URI = resolveRequiredEnv(
  import.meta.env.VITE_ORDER_BPP_URI || import.meta.env.VITE_BACKEND_URL,
  'https://atria-bpp.atriauniversity.ai',
  'VITE_ORDER_BPP_URI'
);

const createContext = (orderDetails?: Pick<OrderDetails, 'bpp_id' | 'bpp_uri'>) => ({
  version: '2.0.0',
  action: 'select',
  transaction_id: `txn-${generateUUID()}`,
  message_id: `msg-${generateUUID()}`,
  timestamp: new Date().toISOString(),
  // Participant identifiers must match registered keys used by adapters for signing.
  bap_id: DEFAULT_BAP_ID,
  bap_uri: DEFAULT_BAP_URI,
  bpp_id: orderDetails?.bpp_id || DEFAULT_BPP_ID,
  bpp_uri: orderDetails?.bpp_uri || DEFAULT_BPP_URI,
  domain: 'beckn.one:deg:p2p-trading-interdiscom:2.0.0',
  ttl: 'PT30S',
});

const extractOrderAmount = (order: any): number | null => {
  const paymentValue = order?.['beckn:payment']?.['beckn:amount']?.value;
  if (typeof paymentValue === 'number') {
    return paymentValue;
  }
  if (typeof paymentValue === 'string' && paymentValue.trim()) {
    const parsed = Number(paymentValue);
    if (!Number.isNaN(parsed)) return parsed;
  }

  const orderValue = order?.['beckn:orderValue']?.value ?? order?.orderValue?.total;
  if (typeof orderValue === 'number') {
    return orderValue;
  }
  if (typeof orderValue === 'string' && orderValue.trim()) {
    const parsed = Number(orderValue);
    if (!Number.isNaN(parsed)) return parsed;
  }

  return null;
};

const buildSelectOrderItem = (orderDetails: OrderDetails) => {
  const orderedItemId = orderDetails.offer_item_ids?.[0] || `item-${generateUUID()}`;
  const acceptedOfferProvider = orderDetails.offer_provider || orderDetails.seller_id || '';
  const acceptedOfferDescriptor = orderDetails.offer_descriptor || {
    '@type': 'beckn:Descriptor',
    'schema:name': orderDetails.seller_name
      ? `${orderDetails.seller_name} - Energy Offer`
      : 'Energy Offer',
  };
  const acceptedOfferItems = orderDetails.offer_item_ids?.length
    ? orderDetails.offer_item_ids
    : [orderedItemId];

  return {
    'beckn:id': orderedItemId,
    'beckn:orderedItem': orderedItemId,
    'beckn:quantity': {
      unitQuantity: orderDetails.quantity,
    },
    'beckn:acceptedOffer': {
      '@context':
        'https://raw.githubusercontent.com/beckn/protocol-specifications-v2/tags/core-2.0.0-rc-eos-release/schema/core/v2/context.jsonld',
      '@type': 'beckn:Offer',
      'beckn:id': orderDetails.offer_id,
      'beckn:provider': acceptedOfferProvider,
      'beckn:items': acceptedOfferItems,
      'beckn:descriptor': acceptedOfferDescriptor,
      ...(orderDetails.offer_price ? { 'beckn:price': orderDetails.offer_price } : {}),
      ...(orderDetails.offer_attributes
        ? { 'beckn:offerAttributes': orderDetails.offer_attributes }
        : {}),
    },
  };
};

const buildSelectedOrderFallback = (orderDetails: OrderDetails) => ({
  'beckn:orderItems': [
    buildSelectOrderItem(orderDetails),
  ],
});

export const orderService = {
  async select(orderDetails: OrderDetails): Promise<SelectResponse> {
    const context = createContext(orderDetails);

    const payload: any = {
      context: { ...context, action: 'select' },
      message: {
        order: {
          'beckn:orderItems': [
            buildSelectOrderItem(orderDetails),
          ],
        },
      },
    };

    try {
      const headers = await getAuthHeaders();
      const response = await requestWithRetry<any>(
        bapClient,
        {
          url: '/select',
          method: 'POST',
          data: payload,
          headers,
        },
        {
          timeoutMs: 10000,
          retries: 1,
        }
      );

      return {
        transactionId: (context as any).transaction_id,
        order: response.message?.order || {},
      };
    } catch (error) {
      console.error('Select failed:', error);
      throw error;
    }
  },

  async init(
    transactionId: string,
    orderDetails: OrderDetails,
    orderData?: any
  ): Promise<InitResponse> {
    const context = createContext(orderDetails);
    (context as any).transaction_id = transactionId;
    (context as any).action = 'init';

    const baseOrder = orderData && typeof orderData === 'object'
      ? structuredClone(orderData)
      : buildSelectedOrderFallback(orderDetails);

    const fulfillment = baseOrder['beckn:fulfillment'];
    if (
      fulfillment &&
      typeof fulfillment === 'object' &&
      !Array.isArray(fulfillment) &&
      Object.keys(fulfillment).length === 0
    ) {
      delete baseOrder['beckn:fulfillment'];
    }
    baseOrder['beckn:payment'] = baseOrder['beckn:payment'] ?? {
      '@context':
        'https://raw.githubusercontent.com/beckn/protocol-specifications-v2/tags/core-2.0.0-rc-eos-release/schema/core/v2/context.jsonld',
      '@type': 'beckn:Payment',
      'beckn:paymentStatus': 'PENDING',
    };

    const payload = {
      context: { ...context, action: 'init' },
      message: {
        order: baseOrder,
      },
    };

    try {
      const headers = await getAuthHeaders();
      const response = await requestWithRetry<any>(
        bapClient,
        {
          url: '/init',
          method: 'POST',
          data: payload,
          headers,
        },
        {
          timeoutMs: 10000,
          retries: 1,
        }
      );

      return {
        transactionId,
        order: response.message?.order || {},
      };
    } catch (error) {
      console.error('Init failed:', error);
      throw error;
    }
  },

  async confirm(
    transactionId: string,
    orderDetails: OrderDetails,
    orderData: any
  ): Promise<ConfirmResponse> {
    const context = createContext(orderDetails);
    (context as any).transaction_id = transactionId;
    (context as any).action = 'confirm';

    const payload = {
      context: { ...context, action: 'confirm' },
      message: {
        order: orderData,
      },
    };

    try {
      const headers = await getAuthHeaders();
      const response = await requestWithRetry<any>(
        bapClient,
        {
          url: '/confirm',
          method: 'POST',
          data: payload,
          headers,
        },
        {
          timeoutMs: 10000,
          retries: 1,
        }
      );

      return {
        transactionId,
        order: response.message?.order || {},
        orderId: response.message?.order?.['beckn:id'] || 'unknown',
      };
    } catch (error) {
      console.error('Confirm failed:', error);
      throw error;
    }
  },

  async getTradeStatus(transactionId: string): Promise<TradeStatusResponse> {
    const state = await this.getOrderState(transactionId);
    return {
      status: state.order_state === 'CONFIRMED',
      price: extractOrderAmount(state.order),
      state: state.order_state,
    };
  },

  async getOrderState(transactionId: string): Promise<OrderStateResponse> {
    const headers = await getAuthHeaders();
    return requestWithRetry<OrderStateResponse>(
      bapClient,
      {
        url: `/api/order-state?transaction_id=${encodeURIComponent(transactionId)}`,
        method: 'GET',
        headers,
      },
      {
        timeoutMs: 10000,
        retries: 1,
      }
    );
  },

  async waitForQuotation(
    transactionId: string,
    options?: { maxAttempts?: number; delayMs?: number }
  ): Promise<OrderStateResponse> {
    const maxAttempts = options?.maxAttempts ?? 20;
    const delayMs = options?.delayMs ?? 1000;

    for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
      const state = await this.getOrderState(transactionId);
      if ((state.order_state === 'INITIATED' || state.order_state === 'CONFIRMED') && state.order) {
        return state;
      }

      if (attempt < maxAttempts - 1) {
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }

    throw new Error('Quotation is still pending');
  },

  async waitForSelectedOrder(
    transactionId: string,
    options?: { maxAttempts?: number; delayMs?: number }
  ): Promise<OrderStateResponse> {
    const maxAttempts = options?.maxAttempts ?? 20;
    const delayMs = options?.delayMs ?? 1000;

    for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
      const state = await this.getOrderState(transactionId);
      if (state.order_state === 'SELECTED' && state.order) {
        return state;
      }

      if (attempt < maxAttempts - 1) {
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }

    throw new Error('Selected order is still pending');
  },

  async waitForConfirmation(
    transactionId: string,
    options?: { maxAttempts?: number; delayMs?: number }
  ): Promise<TradeStatusResponse> {
    const maxAttempts = options?.maxAttempts ?? 20;
    const delayMs = options?.delayMs ?? 1000;

    for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
      const state = await this.getOrderState(transactionId);
      if (state.order_state === 'CONFIRMED' && state.order) {
        return {
          status: true,
          price: extractOrderAmount(state.order),
          state: state.order_state,
        };
      }

      if (attempt < maxAttempts - 1) {
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }

    const finalState = await this.getOrderState(transactionId);
    if (finalState.order_state === 'CONFIRMED' && finalState.order) {
      return {
        status: true,
        price: extractOrderAmount(finalState.order),
        state: finalState.order_state,
      };
    }

    throw new Error('Confirmation is still pending or failed validation');
  },
};
