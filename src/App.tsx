import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { 
  CircularProgress, 
  Box, 
  Typography, 
  Alert 
} from '@mui/material';

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

// New Admin Imports
import AdminDashboard from './components/Admin/AdminDashboard';
import AdminHome from './components/Admin/AdminHome';
import UserManagement from './components/Admin/UserManagement';

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
  const [error, setError] = useState<string | null>(null);

  // Capturar erros da inicialização do Firebase
  useEffect(() => {
    const handleFirebaseError = (event: ErrorEvent) => {
      setError(event.error?.message || 'Erro na inicialização do Firebase');
    };
    window.addEventListener('error', handleFirebaseError);
    return () => window.removeEventListener('error', handleFirebaseError);
  }, []);

  if (error) {
    return (
      <Box 
        display="flex" 
        flexDirection="column"
        justifyContent="center" 
        alignItems="center" 
        height="100vh"
      >
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

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
                        element={<CheckoutForm />}
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
                            <AdminDashboard />
                          </ProtectedRoute>
                        }
                      >
                        <Route index element={<AdminHome />} />
                        <Route path="products" element={<ProductManagement />} />
                        <Route path="orders" element={<OrderTracking />} />
                        <Route path="users" element={<UserManagement />} />
                      </Route>
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
