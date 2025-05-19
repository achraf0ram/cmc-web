
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
  signup: (name: string, email: string, password: string, password_confirmation: string) => Promise<boolean>;
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
      try {
        setUser(JSON.parse(storedUser));
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      } catch (error) {
        console.error('Error parsing stored user:', error);
        // Handle corrupted localStorage data
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }
    setIsLoading(false);
  }, []);

  // Check for Google Auth callback
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const userData = urlParams.get('user');
    
    if (token && userData) {
      try {
        const user = JSON.parse(decodeURIComponent(userData));
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('token', token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        setUser(user);
        
        // Clean URL
        navigate('/', { replace: true });
        
        toast({
          title: "تم تسجيل الدخول بنجاح",
          description: "مرحباً بك في منصة CMC",
        });
      } catch (error) {
        console.error('Error processing Google auth callback:', error);
      }
    }
  }, [navigate]);

  // Login function
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      // Define API URL properly with a fallback
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
      
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
      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Signup function
  const signup = async (name: string, email: string, password: string, password_confirmation: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
      
      // First: get csrf-cookie from backend (required with sanctum)
      await axios.get(`${apiUrl}/sanctum/csrf-cookie`, {
        withCredentials: true,
      });

      // Second: send registration data
      const response = await axios.post(
        `${apiUrl}/register`,
        { name, email, password, password_confirmation },
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
