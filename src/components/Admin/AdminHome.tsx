import React from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  CardHeader,
} from '@mui/material';
import {
  Inventory as ProductIcon,
  ShoppingCart as OrderIcon,
  AttachMoney as RevenueIcon,
} from '@mui/icons-material';

const AdminHome: React.FC = () => {
  // Dados fictícios para demonstração
  const dashboardStats = [
    {
      title: 'Total de Produtos',
      value: 150,
      icon: <ProductIcon />,
      color: 'primary'
    },
    {
      title: 'Pedidos Pendentes',
      value: 25,
      icon: <OrderIcon />,
      color: 'warning'
    },
    {
      title: 'Receita Total',
      value: 'R$ 45.678,90',
      icon: <RevenueIcon />,
      color: 'success'
    }
  ];

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard Administrativo
      </Typography>

      <Grid container spacing={3}>
        {dashboardStats.map((stat) => (
          <Grid item xs={12} sm={4} key={stat.title}>
            <Card>
              <CardHeader
                avatar={React.cloneElement(stat.icon, { 
                  color: stat.color,
                  sx: { fontSize: 50 } 
                })}
                title={stat.title}
                titleTypographyProps={{ variant: 'subtitle1' }}
              />
              <CardContent>
                <Typography variant="h5" color="text.primary">
                  {stat.value}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">Produtos Recentes</Typography>
            {/* Adicionar lista de produtos recentes */}
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">Pedidos Recentes</Typography>
            {/* Adicionar lista de pedidos recentes */}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminHome;
