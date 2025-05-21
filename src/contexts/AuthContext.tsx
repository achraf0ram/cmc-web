// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

// Define User type
interface User {
  id: number;
  name: string;
  email: string;
  email_verified_at: string | null;
  created_at: string;
  updated_at: string;
  fullName?: string;
  phone?: string;
  photoURL?: string;
  provider?: string;
}

// Define context type
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (
    name: string,
    email: string,
    password: string,
    passwordConfirmation: string
  ) => Promise<{ success: boolean; errors?: Record<string, string[]> }>;
  logout: () => Promise<void>;
  updateUser: (userData: User) => Promise<boolean>;
  error: string | null;
  validationErrors: Record<string, string[]> | null;
  resetPassword: (
    email: string, 
    password: string, 
    passwordConfirmation: string, 
    token: string
  ) => Promise<boolean>;
  forgotPassword?: (email: string) => Promise<boolean>;
}

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Create axios instance
const api = axios.create({
  baseURL: "http://localhost:8000",
  withCredentials: true,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

// AuthProvider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<
    string,
    string[]
  > | null>(null);

  const getCsrf = async () => {
    await api.get("/sanctum/csrf-cookie");
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        await getCsrf();
        const res = await api.get("api/user");
        console.log("User data:", res.data);
        // Map backend response to our User interface
        const userData = {
          ...res.data,
          fullName: res.data.name, // Use name as fullName if not provided
          provider: res.data.provider || 'email', // Default to email provider
        };
        setUser(userData);
      } catch {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setError(null);
    setValidationErrors(null);
    try {
      await getCsrf();
      const res = await api.post("/login", { email, password });
      // Map backend response to our User interface
      const userData = {
        ...res.data.user || res.data,
        fullName: (res.data.user || res.data).name, // Use name as fullName
        provider: 'email', // Default to email provider
      };
      setUser(userData);
      return true;
    } catch (err: any) {
      if (err.response?.status === 422) {
        const errors = err.response.data.errors;
        setValidationErrors(errors);
        setError("Validation failed");
        return false;
      }
      const errorMessage = err.response?.data?.message || "Login failed";
      setError(errorMessage);
      return false;
    }
  };

  const register = async (
    name: string,
    email: string,
    password: string,
    passwordConfirmation: string
  ): Promise<{ success: boolean; errors?: Record<string, string[]> }> => {
    setError(null);
    setValidationErrors(null);
    try {
      await getCsrf();
      const res = await axios.post("http://localhost:8000/register", {
        name,
        email,
        password,
        password_confirmation: passwordConfirmation,
      });
      // Map backend response to our User interface
      const userData = {
        ...res.data.user || res.data,
        fullName: (res.data.user || res.data).name, // Use name as fullName
        provider: 'email', // Default to email provider
      };
      setUser(userData);
      return { success: true };
    } catch (err: any) {
      if (err.response?.status === 422) {
        const errors = err.response.data.errors;
        setValidationErrors(errors);
        setError("Validation failed");
        return { success: false, errors };
      }
      const errorMessage = err.response?.data?.message || "Registration failed";
      setError(errorMessage);
      return { success: false, errors: { general: [errorMessage] } };
    }
  };

  const updateUser = async (userData: User): Promise<boolean> => {
    setError(null);
    try {
      await getCsrf();
      const res = await api.put(`/api/user/${userData.id}`, userData);
      if (res.status === 200) {
        setUser(userData);
        return true;
      }
      return false;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || "Update failed";
      setError(errorMessage);
      return false;
    }
  };

  const logout = async () => {
    try {
      await api.post("/logout");
      setUser(null);
    } catch (err: any) {
      setError(err.response?.data?.message || "Logout failed");
    }
  };

  // Add resetPassword function
  const resetPassword = async (
    email: string,
    password: string,
    passwordConfirmation: string,
    token: string
  ): Promise<boolean> => {
    setError(null);
    setValidationErrors(null);
    try {
      await getCsrf();
      const res = await api.post("/reset-password", {
        email,
        password,
        password_confirmation: passwordConfirmation,
        token
      });
      
      if (res.status === 200) {
        return true;
      }
      return false;
    } catch (err: any) {
      if (err.response?.status === 422) {
        const errors = err.response.data.errors;
        setValidationErrors(errors);
        setError("Validation failed");
        return false;
      }
      const errorMessage = err.response?.data?.message || "Password reset failed";
      setError(errorMessage);
      return false;
    }
  };

  // Add forgotPassword function for completeness
  const forgotPassword = async (email: string): Promise<boolean> => {
    setError(null);
    setValidationErrors(null);
    try {
      await getCsrf();
      const res = await api.post("/forgot-password", { email });
      if (res.status === 200) {
        return true;
      }
      return false;
    } catch (err: any) {
      if (err.response?.status === 422) {
        const errors = err.response.data.errors;
        setValidationErrors(errors);
        setError("Validation failed");
        return false;
      }
      const errorMessage = err.response?.data?.message || "Password reset request failed";
      setError(errorMessage);
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        updateUser,
        error,
        validationErrors,
        resetPassword,
        forgotPassword
      }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
};
