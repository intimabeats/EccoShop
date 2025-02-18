import React from 'react';
import { Box, Typography, Button, Container } from '@mui/material';
import { CheckCircle } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const PaymentSuccess: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
          textAlign: 'center',
          gap: 3,
        }}
      >
        <CheckCircle
          sx={{
            fontSize: 80,
            color: 'success.main',
          }}
        />
        
        <Typography variant="h4" component="h1" gutterBottom>
          Pagamento Confirmado!
        </Typography>
        
        <Typography variant="body1" color="text.secondary" paragraph>
          Seu pedido foi processado com sucesso. Você receberá um e-mail com os detalhes da compra.
        </Typography>

        <Button
          variant="contained"
          onClick={() => navigate('/')}
          sx={{ mt: 2 }}
        >
          Voltar para a Loja
        </Button>
      </Box>
    </Container>
  );
};

export default PaymentSuccess;
