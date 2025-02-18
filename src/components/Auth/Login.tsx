import React, { useState, useCallback } from 'react';
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Paper,
  Alert,
  Link,
  Snackbar,
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  createUserWithEmailAndPassword,
  AuthError
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useAuth } from '../../contexts/AuthContext';
import { auth, db, checkNetworkConnection } from '../../config/firebase';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [networkError, setNetworkError] = useState(false);

  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from?.pathname || '/';

  const getErrorMessage = useCallback((error: unknown): string => {
    if (error instanceof Error) {
      const authError = error as AuthError;
      switch (authError.code) {
        case 'auth/network-request-failed':
          setNetworkError(true);
          return 'Erro de conexão. Verifique sua internet.';
        case 'auth/email-already-in-use':
          return 'Este email já está em uso.';
        case 'auth/invalid-email':
          return 'Email inválido.';
        case 'auth/weak-password':
          return 'Senha muito fraca. Use pelo menos 6 caracteres.';
        default:
          return authError.message || 'Erro desconhecido durante o registro.';
      }
    }
    return 'Erro desconhecido.';
  }, []);

  const handleNetworkRetry = async () => {
    const connectionRestored = await checkNetworkConnection();
    if (connectionRestored) {
      setNetworkError(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Validações básicas
      if (!email || !password) {
        setError('Por favor, preencha todos os campos.');
        return;
      }

      if (password.length < 6) {
        setError('A senha deve ter pelo menos 6 caracteres.');
        return;
      }

      if (isRegistering) {
        // Registro de novo usuário (admin)
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Adicionar informações de admin no Firestore
        await setDoc(doc(db, 'users', user.uid), {
          email: user.email,
          role: 'admin',
          createdAt: new Date(),
          uid: user.uid
        });

        // Fazer login após o registro
        await signIn(email, password);
        navigate(from, { replace: true });
      } else {
        // Login normal
        await signIn(email, password);
        navigate(from, { replace: true });
      }
    } catch (error) {
      console.error('Login/Registro error:', error);
      const errorMessage = getErrorMessage(error);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Snackbar
        open={networkError}
        autoHideDuration={6000}
        onClose={() => setNetworkError(false)}
        message="Erro de conexão"
        action={
          <Button color="secondary" size="small" onClick={handleNetworkRetry}>
            Tentar Novamente
          </Button>
        }
      />

      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
          }}
        >
          <Typography component="h1" variant="h5" sx={{ mb: 3 }}>
            {isRegistering ? 'Registrar Admin' : 'Login'}
          </Typography>

          {error && (
            <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
            <TextField
              margin="normal"
              required
              fullWidth
              label="Email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <TextField
              margin="normal"
              required
              fullWidth
              label="Senha"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              helperText={isRegistering ? "A senha deve ter pelo menos 6 caracteres" : ""}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              sx={{ mt: 3, mb: 2 }}
            >
              {loading
                ? (isRegistering ? 'Registrando...' : 'Entrando...')
                : (isRegistering ? 'Registrar' : 'Entrar')
              }
            </Button>

            <Box sx={{ textAlign: 'center' }}>
              <Link
                component="button"
                variant="body2"
                onClick={() => {
                  setIsRegistering(!isRegistering);
                  setError(''); // Limpar erros ao trocar modo
                }}
                type="button"
              >
                {isRegistering
                  ? 'Já tem uma conta? Faça login'
                  : 'Registrar nova conta de admin'
                }
              </Link>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Login;
