import React, { useEffect } from 'react';
import {
  Box,
  Stack,
  TextField,
  Button,
  Typography,
  Stepper,
  Step,
  StepLabel,
  styled,
  CircularProgress,
  Alert,
} from '@mui/material';
import * as Yup from 'yup';
import { useCart } from '../Cart/CartContext';
import { abacatePayService } from '../../services/abacatePay';
import { useNavigate } from 'react-router-dom';

const StyledForm = styled('form')(({ theme }) => ({
  maxWidth: 600,
  margin: '0 auto',
  padding: theme.spacing(3),
  [theme.breakpoints.up('md')]: {
    padding: theme.spacing(4),
  },
}));

const steps = ['Dados Pessoais', 'Endereço', 'Pagamento'];

// Esquemas de validação
const personalInfoSchema = Yup.object().shape({
  name: Yup.string()
    .required('Nome completo é obrigatório')
    .min(3, 'Nome deve ter pelo menos 3 caracteres'),
  email: Yup.string()
    .required('Email é obrigatório')
    .email('Email inválido'),
  phone: Yup.string()
    .required('Telefone é obrigatório')
    .matches(/^\(\d{2}\)\s\d{4,5}-\d{4}$/, 'Telefone inválido. Use o formato (99) 99999-9999'),
  taxId: Yup.string()
    .required('CPF/CNPJ é obrigatório')
    .test('is-valid-tax-id', 'CPF/CNPJ inválido', (value) => {
      // Validação básica de CPF/CNPJ
      const cleanValue = value.replace(/[^\d]/g, '');
      return cleanValue.length === 11 || cleanValue.length === 14;
    }),
});

const addressSchema = Yup.object().shape({
  street: Yup.string().required('Rua é obrigatória'),
  number: Yup.string().required('Número é obrigatório'),
  neighborhood: Yup.string().required('Bairro é obrigatório'),
  city: Yup.string().required('Cidade é obrigatória'),
  state: Yup.string()
    .required('Estado é obrigatório')
    .length(2, 'Use a sigla do estado'),
  zipCode: Yup.string()
    .required('CEP é obrigatório')
    .matches(/^\d{5}-\d{3}$/, 'CEP inválido. Use o formato 99999-999'),
});

const CheckoutForm: React.FC = () => {
  const { state: cartState, clearCart } = useCart();
  const [activeStep, setActiveStep] = React.useState(0);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [validationErrors, setValidationErrors] = React.useState<{[key: string]: string}>({});
  const navigate = useNavigate();

  const [formData, setFormData] = React.useState({
    name: '',
    email: '',
    phone: '',
    taxId: '',
    address: {
      street: '',
      number: '',
      complement: '',
      neighborhood: '',
      city: '',
      state: '',
      zipCode: '',
    },
  });

  // Formatar telefone
  const formatPhone = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{2})(\d{4,5})(\d{4})$/);
    if (match) {
      return `(${match[1]}) ${match[2]}-${match[3]}`;
    }
    return value;
  };

  // Formatar CEP
  const formatZipCode = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{5})(\d{3})$/);
    if (match) {
      return `${match[1]}-${match[2]}`;
    }
    return value;
  };

  useEffect(() => {
    console.log('Cart State:', cartState);
    if (cartState.items.length === 0) {
      navigate('/');
    }
  }, [cartState, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let formattedValue = value;

    // Formatação condicional
    if (name === 'phone') {
      formattedValue = formatPhone(value);
    }
    if (name === 'address.zipCode') {
      formattedValue = formatZipCode(value);
    }

    if (name.includes('.')) {
      const [, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [child]: formattedValue
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: formattedValue,
      }));
    }

    // Limpar erro específico ao digitar
    if (validationErrors[name]) {
      setValidationErrors(prev => {
        const newErrors = {...prev};
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateStep = async () => {
    try {
      setError(null);
      setValidationErrors({});

      switch (activeStep) {
        case 0:
          await personalInfoSchema.validate(formData, { abortEarly: false });
          break;
        case 1:
          await addressSchema.validate(formData.address, { abortEarly: false });
          break;
      }
      
      // Se passou pela validação, avança
      setActiveStep(prev => prev + 1);
    } catch (err) {
      if (err instanceof Yup.ValidationError) {
        const errors: {[key: string]: string} = {};
        err.inner.forEach(error => {
          if (error.path) {
            errors[error.path] = error.message;
          }
        });
        setValidationErrors(errors);
        setError('Por favor, corrija os erros no formulário.');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validação final antes do envio
      await personalInfoSchema.validate(formData, { abortEarly: false });
      await addressSchema.validate(formData.address, { abortEarly: false });

      console.log('Submitting checkout with data:', {
        cartItems: cartState.items,
        formData
      });

      // Criar uma cópia profunda dos itens do carrinho para garantir serializabilidade
      const cartItems = cartState.items.map(item => ({
        externalId: String(item.product.id), 
        name: String(item.product.name),
        description: String(item.product.description || ''),
        quantity: Number(item.quantity),
        price: Number(item.product.price)
      }));

      // Validar dados antes do envio
      if (cartItems.length === 0) {
        throw new Error('Carrinho está vazio');
      }

      // Create billing
      const billing = await abacatePayService.createBilling({
        frequency: 'ONE_TIME',
        methods: ['PIX'],
        products: cartItems,
        returnUrl: `${window.location.origin}/cart`,
        completionUrl: `${window.location.origin}/success`,
        customer: {
          name: String(formData.name),
          email: String(formData.email),
          cellphone: String(formData.phone),
          taxId: String(formData.taxId),
        },
      });

      console.log('Billing response:', billing);

      // Redirect to payment
      if (billing.url) {
        window.location.href = billing.url;
      } else {
        throw new Error('Nenhuma URL de pagamento recebida');
      }

      clearCart();
    } catch (error) {
      console.error('Checkout error:', error);
      setError(error instanceof Error ? error.message : 'Erro desconhecido no checkout');
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Stack spacing={3}>
            {error && <Alert severity="error" sx={{ width: '100%', mb: 2 }}>{error}</Alert>}
            <TextField
              required
              fullWidth
              label="Nome Completo"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              error={!!validationErrors.name}
              helperText={validationErrors.name}
            />
            <TextField
              required
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              error={!!validationErrors.email}
              helperText={validationErrors.email}
            />
            <TextField
              required
              fullWidth
              label="Telefone"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="(99) 99999-9999"
              error={!!validationErrors.phone}
              helperText={validationErrors.phone}
            />
            <TextField
              required
              fullWidth
              label="CPF/CNPJ"
              name="taxId"
              value={formData.taxId}
              onChange={handleInputChange}
              error={!!validationErrors.taxId}
              helperText={validationErrors.taxId}
            />
          </Stack>
        );
      case 1:
        return (
          <Stack spacing={3}>
            {error && <Alert severity="error" sx={{ width: '100%', mb: 2 }}>{error}</Alert>}
            <TextField
              required
              fullWidth
              label="CEP"
              name="address.zipCode"
              value={formData.address.zipCode}
              onChange={handleInputChange}
              placeholder="99999-999"
              error={!!validationErrors.zipCode}
              helperText={validationErrors.zipCode}
            />
            <TextField
              required
              fullWidth
              label="Rua"
              name="address.street"
              value={formData.address.street}
              onChange={handleInputChange}
              error={!!validationErrors.street}
              helperText={validationErrors.street}
            />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                required
                fullWidth
                label="Número"
                name="address.number"
                value={formData.address.number}
                onChange={handleInputChange}
                error={!!validationErrors.number}
                helperText={validationErrors.number}
              />
              <TextField
                fullWidth
                label="Complemento"
                name="address.complement"
                value={formData.address.complement}
                onChange={handleInputChange}
              />
            </Box>
            <TextField
              required
              fullWidth
              label="Bairro"
              name="address.neighborhood"
              value={formData.address.neighborhood}
              onChange={handleInputChange}
              error={!!validationErrors.neighborhood}
              helperText={validationErrors.neighborhood}
            />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                required
                fullWidth
                label="Cidade"
                name="address.city"
                value={formData.address.city}
                onChange={handleInputChange}
                error={!!validationErrors.city}
                helperText={validationErrors.city}
              />
              <TextField
                required
                fullWidth
                label="Estado"
                name="address.state"
                value={formData.address.state}
                onChange={handleInputChange}
                error={!!validationErrors.state}
                helperText={validationErrors.state}
              />
            </Box>
          </Stack>
        );
      case 2:
        return (
          <Stack spacing={3}>
            <Typography variant="h6">Resumo do Pedido</Typography>
            {cartState.items.map(item => (
              <Box key={item.product.id} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography>
                  {item.product.name} x {item.quantity}
                </Typography>
                <Typography>
                  {new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  }).format(item.product.price * item.quantity / 100)}
                </Typography>
              </Box>
            ))}
            <Box sx={{ borderTop: 1, borderColor: 'divider', pt: 2, mt: 2 }}>
              <Typography variant="h6" sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Total</span>
                <span>
                  {new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  }).format(cartState.total / 100)}
                </span>
              </Typography>
            </Box>
          </Stack>
        );
      default:
        return null;
    }
  };

  return (
    <StyledForm onSubmit={handleSubmit}>
      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map(label => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {renderStepContent(activeStep)}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
        <Button
          disabled={activeStep === 0 || loading}
          onClick={() => setActiveStep(prev => prev - 1)}
        >
          Voltar
        </Button>
        {activeStep === steps.length - 1 ? (
          <Button
            variant="contained"
            type="submit"
            disabled={loading}
            startIcon={loading && <CircularProgress size={20} />}
          >
            Finalizar Compra
          </Button>
        ) : (
          <Button
            variant="contained"
            onClick={validateStep}
            disabled={loading}
          >
            Próximo
          </Button>
        )}
      </Box>
    </StyledForm>
  );
};

export default CheckoutForm;
