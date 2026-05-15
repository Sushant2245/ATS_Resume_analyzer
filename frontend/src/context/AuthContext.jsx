import { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/auth.service';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('ats_token');
    const savedUser = localStorage.getItem('ats_user');
    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
        setIsAuthenticated(true);
      } catch {
        localStorage.removeItem('ats_token');
        localStorage.removeItem('ats_user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const response = await authService.login(email, password);
    const { token, user: userData } = response.data;
    localStorage.setItem('ats_token', token);
    localStorage.setItem('ats_user', JSON.stringify(userData));
    setUser(userData);
    setIsAuthenticated(true);
    return response;
  };

  const signup = async (name, email, password) => {
    const response = await authService.signup(name, email, password);
    const { token, user: userData } = response.data;
    localStorage.setItem('ats_token', token);
    localStorage.setItem('ats_user', JSON.stringify(userData));
    setUser(userData);
    setIsAuthenticated(true);
    return response;
  };

  const logout = () => {
    localStorage.removeItem('ats_token');
    localStorage.removeItem('ats_user');
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated, loading, login, signup, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
