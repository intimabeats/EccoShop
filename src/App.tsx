import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { CircularProgress, Box, Typography } from '@mui/material';

// Import theme and providers
import { theme } from './theme';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './components/Cart/CartContext';
import { ProtectedRoute } from './components/Auth/ProtectedRoute';
import { NotificationProvider } from './contexts/NotificationContext';
import { LoadingProvider } from './contexts/LoadingContext';

// Import components with default export
import Layout from './components/Layout/Layout';
import ProductList from './components/Products/ProductList';
import CheckoutForm from './components/Checkout/CheckoutForm';
import PaymentSuccess from './components/Checkout/PaymentSuccess';
import ProductManagement from './components/Admin/ProductManagement';
import OrderTracking from './components/Admin/OrderTracking';
import Login from './components/Auth/Login';

// Import DevMenu
import { DevMenu } from './components/Common/DevMenu';

const LoadingFallback = () => (
  <Box 
    display="flex" 
    flexDirection="column"
    justifyContent="center" 
    alignItems="center" 
    height="100vh"
  >
    <CircularProgress />
    <Typography variant="h6" sx={{ mt: 2 }}>
      Carregando aplicação...
    </Typography>
  </Box>
);

const App: React.FC = () => {
  console.log('App component rendering');

  return (
    <React.Suspense fallback={<LoadingFallback />}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthProvider>
          <CartProvider>
            <NotificationProvider>
              <LoadingProvider>
                <BrowserRouter>
                  <Routes>
                    <Route path="/login" element={<Login />} />
                    
                    <Route path="/" element={<Layout />}>
                      <Route index element={<ProductList />} />
                      
                      <Route
                        path="checkout"
                        element={
                          <ProtectedRoute>
                            <CheckoutForm />
                          </ProtectedRoute>
                        }
                      />
                      
                      <Route
                        path="success"
                        element={
                          <ProtectedRoute>
                            <PaymentSuccess />
                          </ProtectedRoute>
                        }
                      />
                      
                      {/* Admin Routes */}
                      <Route
                        path="admin"
                        element={
                          <ProtectedRoute adminOnly>
                            <Navigate to="/admin/products" replace />
                          </ProtectedRoute>
                        }
                      />
                      
                      <Route
                        path="admin/products"
                        element={
                          <ProtectedRoute adminOnly>
                            <ProductManagement />
                          </ProtectedRoute>
                        }
                      />
                      
                      <Route
                        path="admin/orders"
                        element={
                          <ProtectedRoute adminOnly>
                            <OrderTracking />
                          </ProtectedRoute>
                        }
                      />
                    </Route>
                  </Routes>
                  
                  {/* Developer Menu */}
                  <DevMenu />
                </BrowserRouter>
              </LoadingProvider>
            </NotificationProvider>
          </CartProvider>
        </AuthProvider>
      </ThemeProvider>
    </React.Suspense>
  );
};

export default App;
