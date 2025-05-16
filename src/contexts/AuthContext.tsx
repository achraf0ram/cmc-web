import React, { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// أنواع البيانات
type User = {
  id: number;
  name: string;
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

// إنشاء السياق
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// مزود السياق
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  // تحميل المستخدم من localStorage عند بدء التطبيق
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
    setIsLoading(false);
  }, []);

  // تسجيل الدخول
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      // أولاً: csrf-cookie
      await axios.get(`${import.meta.env.VITE_API_URL}/sanctum/csrf-cookie`, {
        withCredentials: true,
      });

      // ثانياً: طلب الدخول
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL || "http://localhost:8000/api"}/login`,
        { email, password },
        {
          headers: {
            "Accept": "application/json",
          },
          withCredentials: true, // إذا كنت تستخدم sanctum
        }
      );
      const { user, token } = response.data;
      if (!user || !token) throw new Error("بيانات الاستجابة غير صحيحة");
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('token', token);
      setUser(user);
      navigate('/'); // الانتقال للواجهة الرئيسية بعد الدخول
      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // التسجيل
  const signup = async (name: string, email: string, password: string, password_confirmation: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      // أولاً: احصل على csrf-cookie من الباكند (مطلوب مع sanctum)
      await axios.get(`${import.meta.env.VITE_API_URL}/sanctum/csrf-cookie`, {
        withCredentials: true,
      });

      // ثانياً: أرسل بيانات التسجيل
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/register`,
        { name, email, password, password_confirmation },
        {
          headers: { "Accept": "application/json" },
          withCredentials: true,
        }
      );
      const { user, token } = response.data;
      if (!user || !token) throw new Error("بيانات الاستجابة غير صحيحة");
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

  // تسجيل الخروج
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

// هوك للوصول إلى السياق بسهولة
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};