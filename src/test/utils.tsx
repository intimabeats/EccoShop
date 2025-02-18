import React, { PropsWithChildren } from 'react';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { theme } from '../theme';
import { AuthProvider } from '../contexts/AuthContext';
import { CartProvider } from '../components/Cart/CartContext';
import { NotificationProvider } from '../contexts/NotificationContext';
import { LoadingProvider } from '../contexts/LoadingContext';

const AllTheProviders = ({ children }: PropsWithChildren) => {
  return (
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <AuthProvider>
          <CartProvider>
            <NotificationProvider>
              <LoadingProvider>
                {children}
              </LoadingProvider>
            </NotificationProvider>
          </CartProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
};

const customRender = (ui: React.ReactElement, options = {}) =>
  render(ui, {
    wrapper: AllTheProviders,
    ...options,
  });

// Re-export everything
export * from '@testing-library/react';

// Override render method
export { customRender as render };
