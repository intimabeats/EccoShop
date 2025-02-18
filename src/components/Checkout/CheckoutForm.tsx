import React, { useState, useEffect } from 'react';
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
  Alert,
  Checkbox,
  FormControlLabel,
  Link,
} from '@mui/material';
import { useCart } from '../Cart/CartContext';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db, functions } from '../../config/firebase';
// Removed: import { CheckoutLogin } from './CheckoutLogin';  // No longer used
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { env } from '../../config/env';
import { httpsCallable } from 'firebase/functions';
import { AddressAutocomplete } from './AddressAutocomplete';

const StyledForm = styled('form')(({ theme }) => ({
  maxWidth: 600,
  margin: '0 auto',
  padding: theme.spacing(3),
  [theme.breakpoints.up('md')]: {
    padding: theme.spacing(4),
  },
}));

const steps = ['Dados Pessoais e Endereço', 'Pagamento'];

const stripePromise = loadStripe(env.stripe.publishableKey);

interface AddressComponents {
  street_number?: string;
  route?: string;
  neighborhood?: string;
  locality?: string;
  administrative_area_level_1?: string;
  postal_code?: string;
  country?: string;
}

const CheckoutForm: React.FC = () => {
  const { state: cartState } = useCart(); // Removed clearCart from here
  const { user } = useAuth();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const [createAccount, setCreateAccount] = useState(false);
  const [accountPassword, setAccountPassword] = useState({
    password: '',
    confirmPassword: '',
  });

  const [formData, setFormData] = useState({
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
      country: '',
    },
  });

  const extractAddressComponents = (
    place: google.maps.places.PlaceResult
  ): AddressComponents => {
    const components: AddressComponents = {};
    if (!place.address_components) {
      return components;
    }

    for (const component of place.address_components) {
      const type = component.types[0];
      switch (type) {
        case 'street_number':
          components.street_number = component.long_name;
          break;
        case 'route':
          components.route = component.long_name;
          break;
        case 'neighborhood':
        case 'sublocality_level_1':
          components.neighborhood = component.long_name;
          break;
        case 'locality':
          components.locality = component.long_name;
          break;
        case 'administrative_area_level_1':
          components.administrative_area_level_1 = component.short_name;
          break;
        case 'postal_code':
          components.postal_code = component.long_name;
          break;
        case 'country':
          components.country = component.long_name;
          break;
      }
    }
    return components;
  };

  const handleAddressSelect = (place: google.maps.places.PlaceResult) => {
    const addressComponents = extractAddressComponents(place);

    setFormData((prev) => ({
      ...prev,
      address: {
        street: `${addressComponents.route || ''}`,
        number: addressComponents.street_number || '',
        complement: '',
        neighborhood: addressComponents.neighborhood || '',
        city: addressComponents.locality || '',
        state: addressComponents.administrative_area_level_1 || '',
        zipCode: addressComponents.postal_code || '',
        country: addressComponents.country || '',
      },
    }));
  };

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: user.displayName || '',
        email: user.email || '',
      }));
    }
  }, [user]);

  useEffect(() => {
    if (cartState.items.length === 0) {
      navigate('/');
    }
  }, [cartState, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    const formatPhone = (phone: string) => {
      const cleaned = phone.replace(/\D/g, '');
      const match = cleaned.match(/^(\d{2})(\d{4,5})(\d{4})$/);
      if (match) {
        return `(${match[1]}) ${match[2]}-${match[3]}`;
      }
      return phone;
    };

    const formatZipCode = (zipCode: string) => {
      const cleaned = zipCode.replace(/\D/g, '');
      const match = cleaned.match(/^(\d{5})(\d{3})$/);
      if (match) {
        return `${match[1]}-${match[2]}`;
      }
      return zipCode;
    };

    let formattedValue = value;
    if (name === 'phone') {
      formattedValue = formatPhone(value);
    }
    if (name === 'address.zipCode') {
      formattedValue = formatZipCode(value);
    }

    if (name.includes('.')) {
      const [, child] = name.split('.');
      setFormData((prev) => ({
        ...prev,
        address: {
          ...prev.address,
          [child]: formattedValue,
        },
      }));
    } else if (name === 'password' || name === 'confirmPassword') {
      setAccountPassword((prev) => ({
        ...prev,
        [name]: formattedValue,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: formattedValue,
      }));
    }
  };

  const handleNext = () => {
    if (activeStep === 0 && !user && createAccount) {
      handleCreateAccount();
    } else {
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleCreateAccount = async () => {
    if (accountPassword.password !== accountPassword.confirmPassword) {
      setError('As senhas não coincidem');
      return;
    }

    if (accountPassword.password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    try {
      setLoading(true);
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        accountPassword.password
      );
      const newUser = userCredential.user;

      await setDoc(doc(db, 'users', newUser.uid), {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        taxId: formData.taxId,
        role: 'customer',
        createdAt: new Date(),
      });

      if (newUser) {
        await newUser.reload();
      }

      setActiveStep((prev) => prev + 1);
    } catch (error) {
      console.error('Erro ao criar conta:', error);
      setError('Erro ao criar conta. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // setActiveStep(prev => prev + 1); // Removed
  };

  // Removed the createPaymentIntent function here

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Stack spacing={3}>
            {!user && (
              <Box
                sx={{
                  backgroundColor: 'rgba(0,0,0,0.05)',
                  p: 2,
                  borderRadius: 2,
                }}
              >
                <Typography variant="body2" gutterBottom>
                  Já possui conta?
                  <Link href="/login" sx={{ ml: 1 }}>
                    Fazer login
                  </Link>
                </Typography>
              </Box>
            )}

            <TextField
              required
              fullWidth
              label="Nome Completo"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              disabled={!!user}
            />
            <TextField
              required
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              disabled={!!user}
            />
            <TextField
              required
              fullWidth
              label="Telefone"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="(99) 99999-9999"
            />
            <TextField
              required
              fullWidth
              label="CPF/CNPJ"
              name="taxId"
              value={formData.taxId}
              onChange={handleInputChange}
            />

            <AddressAutocomplete
              onAddressSelect={handleAddressSelect}
              defaultValue={`${formData.address.street}, ${formData.address.number} - ${formData.address.neighborhood}, ${formData.address.city} - ${formData.address.state}, ${formData.address.zipCode}`}
              required
            />
            <TextField
              fullWidth
              label="Complemento"
              name="address.complement"
              value={formData.address.complement}
              onChange={handleInputChange}
            />

            {!user && (
              <>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={createAccount}
                      onChange={(e) => setCreateAccount(e.target.checked)}
                    />
                  }
                  label="Criar minha conta para compras futuras"
                />

                {createAccount && (
                  <>
                    <TextField
                      required
                      fullWidth
                      type="password"
                      label="Senha"
                      name="password"
                      value={accountPassword.password}
                      onChange={handleInputChange}
                      helperText="Mínimo de 6 caracteres"
                    />
                    <TextField
                      required
                      fullWidth
                      type="password"
                      label="Confirmar Senha"
                      name="confirmPassword"
                      value={accountPassword.confirmPassword}
                      onChange={handleInputChange}
                    />
                  </>
                )}
              </>
            )}
          </Stack>
        );
      case 1:
        return (
          <Elements stripe={stripePromise}>
            <PaymentForm />
          </Elements>
        );
      default:
        return null;
    }
  };

  return (
    <StyledForm onSubmit={handleSubmit}>
      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {renderStepContent(activeStep)}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
        <Button disabled={activeStep === 0 || loading} onClick={handleBack}>
          Voltar
        </Button>
        {activeStep === steps.length - 1 ? null : (
          <Button variant="contained" onClick={handleNext} disabled={loading}>
            Próximo
          </Button>
        )}
      </Box>
    </StyledForm>
  );
};

const PaymentForm: React.FC = () => {
  const stripe = useStripe();
  const elements = useElements();
  const { state: cartState, clearCart } = useCart(); // Moved clearCart here
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const createPaymentIntentFunction = httpsCallable(functions, 'createPaymentIntent');
      const result = await createPaymentIntentFunction({
          items: cartState.items.map(item => ({
              id: item.product.id,
              quantity: item.quantity,
          })),
          total: cartState.total,
          name: formData.name,
          email: formData.email,
          address: formData.address
      });

      const data = result.data as { clientSecret: string };
      const clientSecret = data.clientSecret;

      if (!clientSecret) return;

      const cardElement = elements.getElement(CardElement);
      if (!cardElement) return;

      const { paymentIntent, error: confirmError } =
        await stripe.confirmCardPayment(clientSecret, {
          payment_method: {
            card: cardElement,
          },
        });

      if (confirmError) {
        setError(confirmError.message || 'An unknown error occurred'); // Fallback message
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        clearCart(); // Clear cart on success
        navigate('/success');
      }
    } catch (error) {
      setError(
        error instanceof Error ? error.message : 'An unexpected error occurred.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <CardElement
        options={{
          style: {
            base: {
              fontSize: '16px',
              color: '#424770',
              '::placeholder': {
                color: '#aab7c4',
              },
            },
            invalid: {
              color: '#9e2146',
            },
          },
        }}
      />
      <Button
        type="submit"
        disabled={!stripe || loading}
        variant="contained"
        sx={{ mt: 2 }}
        fullWidth
      >
        {loading ? 'Processando...' : 'Pagar'}
      </Button>
      {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
    </form>
  );
};

export default CheckoutForm;
