import axios from 'axios';
import { env } from '../config/env';

const API_BASE_URL = '/abacatepay'; // Sem a URL completa
const API_KEY = env.abacatePay.apiKey;

const abacatePayApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Authorization': `Bearer ${API_KEY}`,
    'Content-Type': 'application/json'
  }
});

export interface CustomerCreate {
  name: string;
  cellphone: string;
  email: string;
  taxId: string;
}

export interface ProductBilling {
  externalId: string;
  name: string;
  description: string;
  quantity: number;
  price: number;
}

export interface BillingCreate {
  frequency: 'ONE_TIME';
  methods: ['PIX'];
  products: ProductBilling[];
  returnUrl: string;
  completionUrl: string;
  customerId?: string;
  customer?: CustomerCreate;
}

export const abacatePayService = {
  createCustomer: async (customer: CustomerCreate) => {
    try {
      // Garantir tipos serializáveis
      const sanitizedCustomer = {
        name: String(customer.name),
        cellphone: String(customer.cellphone),
        email: String(customer.email),
        taxId: String(customer.taxId)
      };

      const response = await abacatePayApi.post('/customer/create', sanitizedCustomer);
      return response.data;
    } catch (error) {
      console.error('Error creating customer:', error);
      throw error;
    }
  },

  createBilling: async (billing: BillingCreate) => {
    try {
      // Garantir tipos serializáveis
      const sanitizedBilling = {
        ...billing,
        products: billing.products.map(product => ({
          externalId: String(product.externalId),
          name: String(product.name),
          description: String(product.description || ''),
          quantity: Number(product.quantity),
          price: Number(product.price)
        })),
        customer: billing.customer ? {
          name: String(billing.customer.name),
          cellphone: String(billing.customer.cellphone),
          email: String(billing.customer.email),
          taxId: String(billing.customer.taxId)
        } : undefined
      };

      const response = await abacatePayApi.post('/billing/create', sanitizedBilling);
      return response.data;
    } catch (error) {
      console.error('Error creating billing:', error);
      throw error;
    }
  },

  listCustomers: async () => {
    try {
      const response = await abacatePayApi.get('/customer/list');
      return response.data;
    } catch (error) {
      console.error('Error listing customers:', error);
      throw error;
    }
  },

  listBillings: async () => {
    try {
      const response = await abacatePayApi.get('/billing/list');
      return response.data;
    } catch (error) {
      console.error('Error listing billings:', error);
      throw error;
    }
  }
};

export default abacatePayService;