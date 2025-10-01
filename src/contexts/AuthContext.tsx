import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'employee';
  cargo?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (emailOrCpf: string, password: string, isAdmin?: boolean) => Promise<{ error?: string }>;
  logout: () => Promise<void>;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const savedUser = localStorage.getItem('rodoil_user');
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
    } catch (error) {
      console.error('Error checking user:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (emailOrCpf: string, password: string, isAdmin: boolean = false) => {
    try {
      let query = supabase
        .from('users')
        .select('*')
        .eq('blocked', false)
        .limit(1);

      // Admin login usa email, funcionário usa CPF
      if (isAdmin) {
        query = query.eq('email', emailOrCpf);
      } else {
        query = query.eq('cpf', emailOrCpf);
      }

      const { data: users, error } = await query;

      if (error) throw error;
      
      if (!users || users.length === 0) {
        return { error: 'Credenciais inválidas' };
      }

      const userData = users[0];

      // Para demo: aceitar senha padrão do admin
      // Em produção, usar bcrypt para comparar password_hash
      const isValidPassword = 
        (emailOrCpf === 'caminhocerto93@gmail.com' && password === '1285041') ||
        (password === '1285041'); // Temporário para todos os usuários em demo

      if (!isValidPassword) {
        return { error: 'Credenciais inválidas' };
      }

      const userInfo: User = {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        role: userData.role,
        cargo: userData.cargo,
      };
      
      setUser(userInfo);
      localStorage.setItem('rodoil_user', JSON.stringify(userInfo));
      return {};
    } catch (error) {
      console.error('Login error:', error);
      return { error: 'Erro ao fazer login' };
    }
  };

  const logout = async () => {
    setUser(null);
    localStorage.removeItem('rodoil_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        isAdmin: user?.role === 'admin',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
