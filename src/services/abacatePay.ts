import axios from 'axios';

const API_BASE_URL = 'https://api.abacatepay.com/v1';
const API_KEY = 'abc_dev_YbKKCjdDYEEERyTFFPRSkjty';

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

export interface BillingCreate {
  frequency: 'ONE_TIME';
  methods: ['PIX'];
  products: Array<{
    externalId: string;
    name: string;
    description?: string;
    quantity: number;
    price: number;
  }>;
  returnUrl: string;
  completionUrl: string;
  customerId?: string;
  customer?: CustomerCreate;
}

export const abacatePayService = {
  createCustomer: async (customer: CustomerCreate) => {
    const response = await abacatePayApi.post('/customer/create', customer);
    return response.data;
  },

  createBilling: async (billing: BillingCreate) => {
    const response = await abacatePayApi.post('/billing/create', billing);
    return response.data;
  },

  listCustomers: async () => {
    const response = await abacatePayApi.get('/customer/list');
    return response.data;
  },

  listBillings: async () => {
    const response = await abacatePayApi.get('/billing/list');
    return response.data;
  }
};

export default abacatePayService;
