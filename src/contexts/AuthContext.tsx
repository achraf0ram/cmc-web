import React, { createContext, useContext, useState, useEffect } from "react";

type User = {
  id: string;
  fullName: string;
  email: string;
};

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (fullName: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  useEffect(() => {
    // Check if user is stored in localStorage
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      // Simulated login - in a real app, this would be an API call
      // For demo purposes, we'll accept any email that looks valid with any password
      if (!email.includes('@')) {
        return false;
      }
      
      // Create a mock user
      const mockUser: User = {
        id: `user_${Math.random().toString(36).substr(2, 9)}`,
        fullName: email.split('@')[0],
        email,
      };
      
      // Store user in localStorage
      localStorage.setItem("user", JSON.stringify(mockUser));
      setUser(mockUser);
      return true;
    } catch (error) {
      console.error("Login error:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (fullName: string, email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      // Simulated signup - in a real app, this would be an API call
      if (!email.includes('@') || !fullName || !password) {
        return false;
      }

      // Create a mock user
      const mockUser: User = {
        id: `user_${Math.random().toString(36).substr(2, 9)}`,
        fullName,
        email,
      };
      
      // Store user in localStorage
      localStorage.setItem("user", JSON.stringify(mockUser));
      setUser(mockUser);
      return true;
    } catch (error) {
      console.error("Signup error:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        isAuthenticated: !!user, 
        isLoading, 
        login, 
        signup, 
        logout 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};