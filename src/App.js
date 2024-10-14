import React, { useState, useEffect, useCallback } from 'react';
import { ChakraProvider } from '@chakra-ui/react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import theme from './theme';
import AuthForm from './Auth/auth';
import Fcom from './Fcom';
import NavBar from './NavBar';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  const handleLogin = (token) => {
    localStorage.setItem('authToken', token);
    setIsAuthenticated(true);
  };
  const handleLogout = () => {
    console.log("Logout function called");
    localStorage.removeItem('authToken');
    setIsAuthenticated(false);
    navigate('/auth');
  };

  useEffect(() => {
    console.log("Authentication state:", isAuthenticated);
  }, [isAuthenticated]);

  const PrivateRoute = ({ children }) => {
    if (isLoading) {
      return <div>Loading...</div>;
    }
    return isAuthenticated ? children : <Navigate to="/auth" />;
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <ChakraProvider theme={theme}>
      {isAuthenticated}
      <Routes>
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Fcom onlogOut={handleLogout}/>
            </PrivateRoute>
          }
        />
        <Route
          path="/auth"
          element={
            isAuthenticated ? (
              <Navigate to="/" />
            ) : (
              <AuthForm onLogin={handleLogin} />
            )
          }
        />
      </Routes>
    </ChakraProvider>
  );
}

function AppWrapper() {
  return (
    <Router>
      <App />
    </Router>
  );
}

export default AppWrapper;