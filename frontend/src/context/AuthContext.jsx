import React, { createContext, useContext, useState, useEffect } from 'react';
import { getUser, TOKEN_STORAGE_KEY } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem(TOKEN_STORAGE_KEY));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      if (token && !user) {
        try {
          const userData = await getUser();
          setUser(userData);
        } catch (error) {
          console.error('Falha ao restaurar sessão:', error);
          // 🛡️ Apenas invalida se o erro for de autenticação (401/403)
          // Se for erro de rede (servidor fora/reiniciando), preservamos o token para quando voltar
          if (error.response?.status === 401 || error.response?.status === 403) {
            localStorage.removeItem(TOKEN_STORAGE_KEY);
            setToken(null);
          }
        }
      }
      setLoading(false);
    };

    initAuth();
  }, [token]);

  const login = (newToken, userData) => {
    localStorage.setItem(TOKEN_STORAGE_KEY, newToken);
    setToken(newToken);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated: !!token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
