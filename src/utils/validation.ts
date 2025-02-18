import * as yup from 'yup';

const phoneRegExp = /^\(\d{2}\) \d{5}-\d{4}$/;
const cpfRegExp = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/;
const cnpjRegExp = /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/;
const cepRegExp = /^\d{5}-\d{3}$/;

export const formatPhone = (value: string): string => {
  const numbers = value.replace(/\D/g, '');
  if (numbers.length <= 11) {
    return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  }
  return value;
};

export const formatCPF = (value: string): string => {
  const numbers = value.replace(/\D/g, '');
  return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
};

export const formatCNPJ = (value: string): string => {
  const numbers = value.replace(/\D/g, '');
  return numbers.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
};

export const formatCEP = (value: string): string => {
  const numbers = value.replace(/\D/g, '');
  return numbers.replace(/(\d{5})(\d{3})/, '$1-$2');
};

export const schemas = {
  customer: yup.object().shape({
    name: yup
      .string()
      .required('Nome é obrigatório')
      .min(3, 'Nome deve ter no mínimo 3 caracteres'),
    
    email: yup
      .string()
      .required('Email é obrigatório')
      .email('Email inválido'),
    
    phone: yup
      .string()
      .required('Telefone é obrigatório')
      .matches(phoneRegExp, 'Telefone inválido'),
    
    taxId: yup
      .string()
      .required('CPF/CNPJ é obrigatório')
      .test('taxId', 'CPF/CNPJ inválido', (value) => {
        if (!value) return false;
        return cpfRegExp.test(value) || cnpjRegExp.test(value);
      }),
  }),

  address: yup.object().shape({
    zipCode: yup
      .string()
      .required('CEP é obrigatório')
      .matches(cepRegExp, 'CEP inválido'),
    
    street: yup
      .string()
      .required('Rua é obrigatória')
      .min(3, 'Rua deve ter no mínimo 3 caracteres'),
    
    number: yup
      .string()
      .required('Número é obrigatório'),
    
    complement: yup
      .string(),
    
    neighborhood: yup
      .string()
      .required('Bairro é obrigatório'),
    
    city: yup
      .string()
      .required('Cidade é obrigatória'),
    
    state: yup
      .string()
      .required('Estado é obrigatório')
      .length(2, 'Use a sigla do estado'),
  }),

  product: yup.object().shape({
    name: yup
      .string()
      .required('Nome é obrigatório')
      .min(3, 'Nome deve ter no mínimo 3 caracteres'),
    
    description: yup
      .string()
      .required('Descrição é obrigatória')
      .min(10, 'Descrição deve ter no mínimo 10 caracteres'),
    
    price: yup
      .number()
      .required('Preço é obrigatório')
      .min(0, 'Preço deve ser maior que zero'),
    
    stock: yup
      .number()
      .required('Estoque é obrigatório')
      .min(0, 'Estoque não pode ser negativo')
      .integer('Estoque deve ser um número inteiro'),
    
    category: yup
      .string()
      .required('Categoria é obrigatória'),
  }),
};
