import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Store as StoreIcon,
  Inventory as InventoryIcon,
  Receipt as OrdersIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { AppBar } from './AppBar';
import { useCart } from '../Cart/CartContext';
import { CartDrawer } from '../Cart/CartDrawer';

const drawerWidth = 240;

const Layout: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { user } = useAuth();
  const { state: cartState } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);

  const isAdmin = user?.email?.endsWith('@admin.com');

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleCartToggle = () => {
    setCartOpen(!cartOpen);
  };

  const menuItems = [
    { text: 'Loja', icon: <StoreIcon />, path: '/' },
    ...(isAdmin ? [
      { text: 'Produtos', icon: <InventoryIcon />, path: '/admin/products' },
      { text: 'Pedidos', icon: <OrdersIcon />, path: '/admin/orders' },
    ] : []),
  ];

  const drawer = (
    <Box sx={{ mt: 8 }}>
      <List>
        {menuItems.map((item) => (
          <ListItem
            button
            key={item.text}
            onClick={() => {
              if (isMobile) {
                handleDrawerToggle();
              }
            }}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        onMenuClick={handleDrawerToggle}
        onCartClick={handleCartToggle}
        cartItemsCount={cartState.items.length}
      />

      {isAdmin && (
        <>
          <Drawer
            variant={isMobile ? 'temporary' : 'permanent'}
            open={isMobile ? mobileOpen : true}
            onClose={handleDrawerToggle}
            ModalProps={{
              keepMounted: true,
            }}
            sx={{
              width: drawerWidth,
              flexShrink: 0,
              '& .MuiDrawer-paper': {
                width: drawerWidth,
                boxSizing: 'border-box',
              },
            }}
          >
            {drawer}
          </Drawer>
        </>
      )}

      <CartDrawer
        open={cartOpen}
        onClose={handleCartToggle}
      />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${isAdmin ? drawerWidth : 0}px)` },
          mt: 8,
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default Layout;
