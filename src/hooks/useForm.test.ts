import React from 'react';
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
} from '@mui/material';
import { useCart } from '../Cart/CartContext';
import { abacatePayService } from '../../services/abacatePay';

const StyledForm = styled('form')(({ theme }) => ({
  maxWidth: 600,
  margin: '0 auto',
  padding: theme.spacing(3),
  [theme.breakpoints.up('md')]: {
    padding: theme.spacing(4),
  },
}));

const steps = ['Dados Pessoais', 'Endereço', 'Pagamento'];

const CheckoutForm: React.FC = () => {
  const { state: cartState, clearCart } = useCart();
  const [activeStep, setActiveStep] = React.useState(0);
  const [loading, setLoading] = React.useState(false);
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [, child] = name.split('.'); // Only use the child part
      setFormData(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleNext = () => {
    setActiveStep(prev => prev + 1);
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Create billing
      const billing = await abacatePayService.createBilling({
        frequency: 'ONE_TIME',
        methods: ['PIX'],
        products: cartState.items.map(item => ({
          externalId: item.product.id,
          name: item.product.name,
          description: item.product.description,
          quantity: item.quantity,
          price: item.product.price,
        })),
        returnUrl: `${window.location.origin}/cart`,
        completionUrl: `${window.location.origin}/success`,
        customer: {
          name: formData.name,
          email: formData.email,
          cellphone: formData.phone,
          taxId: formData.taxId,
        },
      });

      // Redirect to payment
      if (billing.url) {
        window.location.href = billing.url;
      }

      clearCart();
    } catch (error) {
      console.error('Checkout error:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Stack spacing={3}>
            <TextField
              required
              fullWidth
              label="Nome Completo"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
            />
            <TextField
              required
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
            />
            <TextField
              required
              fullWidth
              label="Telefone"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
            />
            <TextField
              required
              fullWidth
              label="CPF/CNPJ"
              name="taxId"
              value={formData.taxId}
              onChange={handleInputChange}
            />
          </Stack>
        );
      case 1:
        return (
          <Stack spacing={3}>
            <TextField
              required
              fullWidth
              label="CEP"
              name="address.zipCode"
              value={formData.address.zipCode}
              onChange={handleInputChange}
            />
            <TextField
              required
              fullWidth
              label="Rua"
              name="address.street"
              value={formData.address.street}
              onChange={handleInputChange}
            />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                required
                fullWidth
                label="Número"
                name="address.number"
                value={formData.address.number}
                onChange={handleInputChange}
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
            />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                required
                fullWidth
                label="Cidade"
                name="address.city"
                value={formData.address.city}
                onChange={handleInputChange}
              />
              <TextField
                required
                fullWidth
                label="Estado"
                name="address.state"
                value={formData.address.state}
                onChange={handleInputChange}
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
          onClick={handleBack}
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
            onClick={handleNext}
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
