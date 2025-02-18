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
  CircularProgress,
  Alert,
  Checkbox,
  FormControlLabel,
  Link,
} from '@mui/material';
import { useCart } from '../Cart/CartContext';
import { abacatePayService } from '../../services/abacatePay';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../../config/firebase';
import { CheckoutLogin } from './CheckoutLogin';

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
  const { user } = useAuth();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Estado para criar conta
  const [showLogin, setShowLogin] = useState(false);
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
    },
  });

  // Preencher dados do usuário automaticamente se estiver logado
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.displayName || '',
        email: user.email || '',
      }));
	  setShowLogin(false);
    }
  }, [user]);

  // Verificar se o carrinho está vazio
  useEffect(() => {
    if (cartState.items.length === 0) {
      navigate('/');
    }
  }, [cartState, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Formatação de telefone
    const formatPhone = (phone: string) => {
      const cleaned = phone.replace(/\D/g, '');
      const match = cleaned.match(/^(\d{2})(\d{4,5})(\d{4})$/);
      if (match) {
        return `(${match[1]}) ${match[2]}-${match[3]}`;
      }
      return phone;
    };

    // Formatação de CEP
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
      setFormData(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [child]: formattedValue
        }
      }));
    } else if (name === 'password' || name === 'confirmPassword') {
      setAccountPassword(prev => ({
        ...prev,
        [name]: formattedValue
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: formattedValue,
      }));
    }
  };

  const handleNext = () => {
    setActiveStep(prev => prev + 1);
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
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

      // Salvar informações adicionais no Firestore
      await setDoc(doc(db, 'users', newUser.uid), {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        taxId: formData.taxId,
        role: 'customer',
        createdAt: new Date(),
      });

      // Opcional: atualizar perfil do usuário
      if (newUser) {
        await newUser.reload();
      }
    } catch (error) {
      console.error('Erro ao criar conta:', error);
      setError('Erro ao criar conta. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Se não estiver logado, mostrar tela de login
    if (!user) {
      setShowLogin(true);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Criar cobrança
      const cartItems = cartState.items.map(item => ({
        externalId: String(item.product.id), 
        name: String(item.product.name),
        description: String(item.product.description || ''),
        quantity: Number(item.quantity),
        price: Number(item.product.price)
      }));

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
  
    // Se estiver na tela de login
  if (showLogin) {
    return (
      <CheckoutLogin 
        onLoginSuccess={() => {
          setShowLogin(false);
          // Pode adicionar lógica adicional se necessário
        }}
        onCreateAccount={() => {
          setShowLogin(false);
          setCreateAccount(true);
        }}
      />
    );
  }

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Stack spacing={3}>
            {!user && (
              <Box sx={{ 
                backgroundColor: 'rgba(0,0,0,0.05)', 
                p: 2, 
                borderRadius: 2 
              }}>
                <Typography variant="body2" gutterBottom>
                  Já possui conta? 
                  <Link 
                    href="/login" 
                    sx={{ ml: 1 }}
                  >
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
          <Stack spacing={3}>
            <TextField
              required
              fullWidth
              label="CEP"
              name="address.zipCode"
              value={formData.address.zipCode}
              onChange={handleInputChange}
              placeholder="99999-999"
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

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

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

  return (
    <StyledForm onSubmit={handleSubmit}>
      {/* Conteúdo anterior permanece o mesmo */}
    </StyledForm>
  );
};

export default CheckoutForm;
