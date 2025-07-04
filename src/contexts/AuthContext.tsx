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

type UserSettings = {
  id: string;
  user_id: string;
  email_notifications: boolean;
  new_requests_notifications: boolean;
  request_updates_notifications: boolean;
  language: string;
  theme: string;
  created_at: string;
  updated_at: string;
};

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  userSettings: UserSettings | null;
  session: Session | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (fullName: string, email: string, password: string, phone?: string) => Promise<boolean>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<boolean>;
  register: (name: string, email: string, password: string, phone?: string) => Promise<boolean>;
  updateUser: (userData: Partial<UserProfile>) => Promise<boolean>;
  updateSettings: (settings: Partial<UserSettings>) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Admin email configuration
const ADMIN_EMAIL = "cmc.rh.ram@gmail.com";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [userSettings, setUserSettings] = useState<UserSettings | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Check if current user is admin
  const isAdmin = user?.email === ADMIN_EMAIL;

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session);
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          setTimeout(async () => {
            await fetchUserProfile(session.user.id);
            await fetchUserSettings(session.user.id);
          }, 0);
        } else {
          setProfile(null);
          setUserSettings(null);
        }
        
        setIsLoading(false);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserProfile(session.user.id);
        fetchUserSettings(session.user.id);
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

  const fetchUserSettings = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        console.error('خطأ في جلب الإعدادات:', error);
        return;
      }

      if (data) {
        setUserSettings(data);
      }
    } catch (error) {
      console.error('خطأ في جلب الإعدادات:', error);
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
        throw error;
      }

      return true;
    } catch (error) {
      console.error('خطأ في تسجيل الدخول:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (fullName: string, email: string, password: string, phone?: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      const redirectUrl = `${window.location.origin}/login`;
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            phone: phone || '',
          },
          emailRedirectTo: redirectUrl,
        },
      });

      if (error) {
        console.error('خطأ في إنشاء الحساب:', error);
        throw error;
      }

      return true;
    } catch (error) {
      console.error('خطأ في إنشاء الحساب:', error);
      throw error;
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
        throw error;
      }

      return true;
    } catch (error) {
      console.error('خطأ في إعادة تعيين كلمة المرور:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string, phone?: string): Promise<boolean> => {
    return signup(name, email, password, phone);
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

      await fetchUserProfile(user.id);
      return true;
    } catch (error) {
      console.error('خطأ في تحديث الملف الشخصي:', error);
      return false;
    }
  };

  const updateSettings = async (settings: Partial<UserSettings>): Promise<boolean> => {
    try {
      if (!user) return false;
      
      const { error } = await supabase
        .from('user_settings')
        .update({
          email_notifications: settings.email_notifications,
          new_requests_notifications: settings.new_requests_notifications,
          request_updates_notifications: settings.request_updates_notifications,
          language: settings.language,
          theme: settings.theme,
        })
        .eq('user_id', user.id);

      if (error) {
        console.error('خطأ في تحديث الإعدادات:', error);
        return false;
      }

      await fetchUserSettings(user.id);
      return true;
    } catch (error) {
      console.error('خطأ في تحديث الإعدادات:', error);
      return false;
    }
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user,
        profile,
        userSettings,
        session,
        isAuthenticated: !!user, 
        isAdmin,
        isLoading, 
        login, 
        signup, 
        logout,
        resetPassword,
        register,
        updateUser,
        updateSettings
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
