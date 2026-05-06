import { createApiClient, requestWithRetry } from '@/services/apiClient';

const generateUUID = () => 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
  const r = (Math.random() * 16) | 0;
  const v = c === 'x' ? r : (r & 0x3) | 0x8;
  return v.toString(16);
});

// Call Python BPP service directly (adapters handle Beckn protocol signing/validation for callbacks)
const BPP_URL = 'http://localhost:3002';
const bppClient = createApiClient(BPP_URL);

export interface OrderDetails {
  offer_id: string;
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

const DEFAULT_BAP_ID = import.meta.env.VITE_ORDER_BAP_ID || 'atria-p2p-trading-bap.com';
const DEFAULT_BAP_URI = import.meta.env.VITE_ORDER_BAP_URI || 'http://atria-bap:8001/bap/receiver';
const DEFAULT_BPP_ID = import.meta.env.VITE_ORDER_BPP_ID || 'atria-p2p-trading-bpp';
const DEFAULT_BPP_URI = import.meta.env.VITE_ORDER_BPP_URI || 'https://atria-bpp.atriauniversity.ai';

const createContext = () => ({
  action: 'select',
  transaction_id: `txn-${generateUUID()}`,
  message_id: `msg-${generateUUID()}`,
  timestamp: new Date().toISOString(),
  // Participant identifiers must match registered keys used by adapters for signing.
  bap_id: DEFAULT_BAP_ID,
  bap_uri: DEFAULT_BAP_URI,
  bpp_id: DEFAULT_BPP_ID,
  bpp_uri: DEFAULT_BPP_URI,
  domain: 'beckn.one:deg:p2p-trading-interdiscom:2.0.0',
  ttl: 'PT30S',
});

export const orderService = {
  async select(orderDetails: OrderDetails, buyerPhone?: string): Promise<SelectResponse> {
    const context = createContext();

    const payload: any = {
      context: { ...context, action: 'select' },
      message: {
        order: {
          'beckn:orderItems': [
            {
              'beckn:id': `item-${generateUUID()}`,
              'beckn:quantity': {
                unitQuantity: orderDetails.quantity,
              },
              'beckn:acceptedOffer': {
                'beckn:id': orderDetails.offer_id,
              },
            },
          ],
        },
      },
    };

    if (buyerPhone) {
      payload.buyerPhone = buyerPhone;
    }

    try {
      const response = await requestWithRetry<any>(
        bppClient,
        {
          url: '/select',
          method: 'POST',
          data: payload,
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
    orderDetails: OrderDetails
  ): Promise<InitResponse> {
    const context = createContext();
    (context as any).transaction_id = transactionId;
    (context as any).action = 'init';

    const payload = {
      context: { ...context, action: 'init' },
      message: {
        order: {
          'beckn:orderItems': [
            {
              'beckn:id': `item-${generateUUID()}`,
              'beckn:quantity': {
                unitQuantity: orderDetails.quantity,
              },
              'beckn:acceptedOffer': {
                'beckn:id': orderDetails.offer_id,
                'beckn:price': {
                  value: orderDetails.price_per_unit * orderDetails.quantity,
                  currency: 'INR',
                },
              },
            },
          ],
          'beckn:fulfillment': {},
          'beckn:payment': {
            'beckn:uri': 'https://razorpay.com',
            'beckn:tlMethod': 'http',
            'beckn:paymentStatus': 'NOT_PAID',
          },
        },
      },
    };

    try {
      const response = await requestWithRetry<any>(
        bppClient,
        {
          url: '/init',
          method: 'POST',
          data: payload,
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
    const context = createContext();
    (context as any).transaction_id = transactionId;
    (context as any).action = 'confirm';

    const payload = {
      context: { ...context, action: 'confirm' },
      message: {
        order: orderData,
      },
    };

    try {
      const response = await requestWithRetry<any>(
        bppClient,
        {
          url: '/confirm',
          method: 'POST',
          data: payload,
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
};
