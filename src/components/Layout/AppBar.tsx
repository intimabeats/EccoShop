import React from 'react';
import {
  AppBar as MuiAppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  styled,
} from '@mui/material';
import { Menu as MenuIcon, ShoppingCart as CartIcon } from '@mui/icons-material';

export interface AppBarProps {
  onMenuClick: () => void;
  onCartClick: () => void;
  cartItemsCount: number;
}

const StyledAppBar = styled(MuiAppBar)(({ theme }) => ({
  backgroundColor: 'rgba(255, 255, 255, 0.8)',
  backdropFilter: 'blur(20px)',
  borderBottom: '1px solid',
  borderColor: theme.palette.divider,
  boxShadow: 'none',
  color: theme.palette.text.primary,
}));

export const AppBar: React.FC<AppBarProps> = ({
  onMenuClick,
  onCartClick,
  cartItemsCount
}) => {
  return (
    <StyledAppBar position="fixed">
      <Toolbar>
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          onClick={onMenuClick}
          sx={{ mr: 2, display: { md: 'none' } }}
        >
          <MenuIcon />
        </IconButton>
        <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
          Ecco Beauty Shop
        </Typography>
        <Box sx={{ position: 'relative' }}>
          <IconButton
            color="inherit"
            aria-label="carrinho"
            onClick={onCartClick}
          >
            <CartIcon />
            {cartItemsCount > 0 && (
              <Box
                sx={{
                  position: 'absolute',
                  top: -5,
                  right: -5,
                  backgroundColor: 'error.main',
                  color: 'white',
                  borderRadius: '50%',
                  width: 20,
                  height: 20,
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  fontSize: '0.75rem',
                }}
              >
                {cartItemsCount}
              </Box>
            )}
          </IconButton>
        </Box>
      </Toolbar>
    </StyledAppBar>
  );
};
