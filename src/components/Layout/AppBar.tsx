import React from 'react';
import {
  AppBar as MuiAppBar,
  styled,
} from '@mui/material';
import { ShoppingCart as CartIcon } from '@mui/icons-material';

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
    return null; // Adicionei um retorno temporário
};
