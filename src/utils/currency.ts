export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value / 100);
};

export const parseCurrency = (value: string): number => {
  const numbers = value.replace(/\D/g, '');
  return parseInt(numbers, 10);
};

export const formatPriceInput = (value: string): string => {
  const numbers = value.replace(/\D/g, '');
  const amount = parseInt(numbers, 10) / 100;
  return amount.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

export const calculateDiscount = (price: number, discountPercentage: number): number => {
  return Math.round(price * (1 - discountPercentage / 100));
};

export const calculateInstallments = (price: number, numberOfInstallments: number): number => {
  return Math.ceil(price / numberOfInstallments);
};
