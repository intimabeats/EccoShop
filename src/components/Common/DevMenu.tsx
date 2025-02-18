import React, { useState } from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Box,
  Typography,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Store as StoreIcon,
  ShoppingCart as CartIcon,
  AdminPanelSettings as AdminIcon,
  Login as LoginIcon,
  CheckCircle as SuccessIcon,
  Payment as PaymentIcon, // Import PaymentIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const devRoutes = [
  { path: '/', label: 'Loja', icon: <StoreIcon /> },
  { path: '/login', label: 'Login', icon: <LoginIcon /> },
  { path: '/checkout', label: 'Checkout', icon: <PaymentIcon /> },
  { path: '/success', label: 'Pagamento Concluído', icon: <SuccessIcon /> },
  { path: '/admin/products', label: 'Gerenciar Produtos', icon: <AdminIcon /> },
  { path: '/admin/orders', label: 'Acompanhar Pedidos', icon: <CartIcon /> },
];

export const DevMenu: React.FC = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const toggleDrawer = () => {
    setOpen(!open);
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    setOpen(false);
  };

  return (
    <>
      <Box
        sx={{
          position: 'fixed',
          bottom: 16,
          left: 16,
          zIndex: 9999,
        }}
      >
        <IconButton
          color="primary"
          aria-label="menu de desenvolvedor"
          onClick={toggleDrawer}
          sx={{
            backgroundColor: 'rgba(0,0,0,0.7)',
            color: 'white',
            '&:hover': {
              backgroundColor: 'rgba(0,0,0,0.9)',
            },
          }}
        >
          <MenuIcon />
        </IconButton>
      </Box>

      <Drawer
        anchor="left"
        open={open}
        onClose={toggleDrawer}
        sx={{
          '& .MuiDrawer-paper': {
            width: 250,
            backgroundColor: 'rgba(0,0,0,0.9)',
            color: 'white',
          },
        }}
      >
        <Box
          sx={{
            width: 250,
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Box
            sx={{
              backgroundColor: 'rgba(255,255,255,0.1)',
              p: 2,
              textAlign: 'center',
            }}
          >
            <Typography variant="h6" color="white">
              Menu de Desenvolvedor
            </Typography>
          </Box>

          <List>
            {devRoutes.map((route) => (
              <ListItem
                button
                key={route.path}
                onClick={() => handleNavigation(route.path)}
                sx={{
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.1)',
                  },
                }}
              >
                <ListItemIcon sx={{ color: 'white' }}>
                  {route.icon}
                </ListItemIcon>
                <ListItemText primary={route.label} />
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>
    </>
  );
};
