
import React, { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from "@/hooks/use-toast";

// Type definitions
type User = {
  id: number;
  fullName: string;
  email: string;
};

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
};

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Context provider
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  // Load user from localStorage when app starts
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
    setIsLoading(false);
  }, []);

  // Login function
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      // Define API URL properly
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8000/api";
      
      // First: csrf-cookie
      await axios.get(`${apiUrl}/sanctum/csrf-cookie`, {
        withCredentials: true,
      });

      // Second: login request
      const response = await axios.post(
        `${apiUrl}/login`,
        { email, password },
        {
          headers: {
            "Accept": "application/json",
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      
      const { user, token } = response.data;
      if (!user || !token) throw new Error("Invalid response data");
      
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('token', token);
      setUser(user);
      navigate('/');
      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Signup function - updated to use only 3 parameters to match usage in SignUp component
  const signup = async (name: string, email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      // First: get csrf-cookie from backend (required with sanctum)
      await axios.get(`${import.meta.env.VITE_API_URL}/sanctum/csrf-cookie`, {
        withCredentials: true,
      });

      // Second: send registration data
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/register`,
        { name, email, password }, // Removed password_confirmation to match signature
        {
          headers: { "Accept": "application/json" },
          withCredentials: true,
        }
      );
      const { user, token } = response.data;
      if (!user || !token) throw new Error("Invalid response data");
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('token', token);
      setUser(user);
      navigate('/');
      return true;
    } catch (error) {
      console.error('Signup error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
    delete axios.defaults.headers.common['Authorization'];
    navigate('/sign-in');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        signup,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Hook for easy context access
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
