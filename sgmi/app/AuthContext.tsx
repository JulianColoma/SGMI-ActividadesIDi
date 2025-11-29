"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import path from 'path';
// Definimos el tipo para el objeto de usuario, basándonos en lo que devuelve la API
interface User {
  id: number;
  nombre: string;
  email: string;
  role: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null; // El usuario puede ser nulo si no está logueado
  login: (user: User) => void; // Actualizamos login para que reciba los datos del usuario
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    const verifySession = async () => {
      try {
        const res = await fetch('/api/usuario/verify', {credentials: 'include'});
        const data = await res.json();

        if (res.ok && data.isAuthorized) {
          setIsAuthenticated(true);
          setUser(data.user);
        } else {
          setIsAuthenticated(false);
          setUser(null);
        }
      } catch (error) {
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    verifySession();
  }, [pathname]);

  const login = (userData: User) => {
    // Al hacer login, guardamos los datos del usuario
    setIsAuthenticated(true);
    setUser(userData);
  };

  const logout = async () => {
    const res = await fetch('/api/usuario/logout', {
      method: 'POST',
      credentials: 'include'
    });
    if (!res.ok) {
      console.error("Error during logout");
    }else{
    setIsAuthenticated(false);
    setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
