import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
export {};
// User type definition
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
  const [authToken, setAuthToken] = useState<string | null>(localStorage.getItem("authToken"));

  // تحديث المستخدم عند تغيّر authToken
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      setUser(null);
    }
    setIsLoading(false);
  }, [authToken]);

  // Login method
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      const response = await axios.post(
        "http://localhost:8000/api/login",
        { email, password },
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );

      if (response.data.token && response.data.user) {
        const userData: User = {
          id: response.data.user.id,
          fullName: response.data.user.name,
          email: response.data.user.email,
        };

        localStorage.setItem("user", JSON.stringify(userData));
        localStorage.setItem("authToken", response.data.token);

        setUser(userData);
        setAuthToken(response.data.token);
        return true;
      }

      return false;
    } catch (error) {
      console.error("Login error:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Signup method
  const signup = async (fullName: string, email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      const response = await axios.post(
        "http://localhost:8000/api/register",
        { name: fullName, email, password },
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );

      if (response.data.token && response.data.user) {
        const userData: User = {
          id: response.data.user.id,
          fullName: response.data.user.name,
          email: response.data.user.email,
        };

        localStorage.setItem("user", JSON.stringify(userData));
        localStorage.setItem("authToken", response.data.token);

        setUser(userData);
        setAuthToken(response.data.token);
        return true;
      }

      return false;
    } catch (error) {
      console.error("Signup error:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout method
  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("authToken");
    setUser(null);
    setAuthToken(null);
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

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

const SignInPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // اجلب القيم من الفورم
    const email = /* ... */;
    const password = /* ... */;
    const success = await login(email, password);
    if (success) {
      navigate("/"); // أو navigate("/home") حسب ما تريد
    } else {
      // عرض رسالة خطأ
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* ...حقول الإدخال... */}
      <button type="submit">تسجيل الدخول</button>
    </form>
  );
};

export default SignInPage;
