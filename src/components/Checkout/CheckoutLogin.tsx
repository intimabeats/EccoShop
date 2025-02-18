import React, { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Link,
  Divider,
  Alert,
} from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';

interface CheckoutLoginProps {
  onLoginSuccess: () => void;
  onCreateAccount: () => void;
}

export const CheckoutLogin: React.FC<CheckoutLoginProps> = ({ 
  onLoginSuccess, 
  onCreateAccount 
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { signIn } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      await signIn(email, password);
      onLoginSuccess();
    } catch (error) {
      setError('Email ou senha incorretos');
    }
  };

  return (
    <Box 
      sx={{ 
        maxWidth: 400, 
        margin: 'auto', 
        padding: 3,
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2
      }}
    >
      <Typography variant="h5" gutterBottom>
        Fazer Login
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <TextField
          fullWidth
          margin="normal"
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <TextField
          fullWidth
          margin="normal"
          label="Senha"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        
        <Button
          type="submit"
          fullWidth
          variant="contained"
          sx={{ mt: 2, mb: 2 }}
        >
          Entrar
        </Button>
      </form>

      <Divider sx={{ my: 2 }}>ou</Divider>

      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="body2" sx={{ mb: 2 }}>
          Não tem uma conta?
        </Typography>
        <Button
          variant="outlined"
          fullWidth
          onClick={onCreateAccount}
        >
          Criar Conta
        </Button>

        <Typography variant="body2" sx={{ mt: 2 }}>
          <Link href="/login">Esqueceu sua senha?</Link>
        </Typography>
      </Box>
    </Box>
  );
};
