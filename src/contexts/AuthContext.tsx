
import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

type UserProfile = {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  created_at: string;
  updated_at: string;
};

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (fullName: string, email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  updateUser: (userData: Partial<UserProfile>) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // إعداد مستمع تغيير حالة المصادقة
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session);
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // جلب الملف الشخصي للمستخدم
          setTimeout(async () => {
            await fetchUserProfile(session.user.id);
          }, 0);
        } else {
          setProfile(null);
        }
        
        setIsLoading(false);
      }
    );

    // التحقق من الجلسة الحالية
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserProfile(session.user.id);
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('خطأ في جلب الملف الشخصي:', error);
        return;
      }

      if (data) {
        setProfile(data);
      }
    } catch (error) {
      console.error('خطأ في جلب الملف الشخصي:', error);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('خطأ في تسجيل الدخول:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('خطأ في تسجيل الدخول:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (fullName: string, email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) {
        console.error('خطأ في إنشاء الحساب:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('خطأ في إنشاء الحساب:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('خطأ في تسجيل الخروج:', error);
      }
    } catch (error) {
      console.error('خطأ في تسجيل الخروج:', error);
    }
  };

  const resetPassword = async (email: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        console.error('خطأ في إعادة تعيين كلمة المرور:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('خطأ في إعادة تعيين كلمة المرور:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    return signup(name, email, password);
  };

  const updateUser = async (userData: Partial<UserProfile>): Promise<boolean> => {
    try {
      if (!user) return false;
      
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: userData.full_name,
          phone: userData.phone,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) {
        console.error('خطأ في تحديث الملف الشخصي:', error);
        return false;
      }

      // إعادة جلب الملف الشخصي المحدث
      await fetchUserProfile(user.id);
      return true;
    } catch (error) {
      console.error('خطأ في تحديث الملف الشخصي:', error);
      return false;
    }
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user,
        profile,
        session,
        isAuthenticated: !!user, 
        isLoading, 
        login, 
        signup, 
        logout,
        resetPassword,
        register,
        updateUser
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
