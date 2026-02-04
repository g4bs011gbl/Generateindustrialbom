import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';

interface User {
  id: string;
  nome: string;
  email: string;
  empresa: string;
  cargo?: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, senha: string) => Promise<boolean>;
  register: (nome: string, email: string, senha: string, empresa: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Carregar usuário do localStorage ao montar
  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      setUser(userData);
      setIsAuthenticated(true);
    }
  }, []);

  const register = async (nome: string, email: string, senha: string, empresa: string): Promise<boolean> => {
    try {
      // Simular registro (em produção, seria API call)
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      
      // Verificar se email já existe
      if (users.some((u: any) => u.email === email)) {
        toast.error('Email já cadastrado!');
        return false;
      }

      const newUser: User & { senha: string } = {
        id: Date.now().toString(),
        nome,
        email,
        empresa,
        senha, // Em produção, seria hash
      };

      users.push(newUser);
      localStorage.setItem('users', JSON.stringify(users));

      // Auto login após registro
      const { senha: _, ...userWithoutPassword } = newUser;
      setUser(userWithoutPassword);
      setIsAuthenticated(true);
      localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));

      toast.success('Cadastro realizado com sucesso!');
      return true;
    } catch (error) {
      toast.error('Erro ao realizar cadastro');
      return false;
    }
  };

  const login = async (email: string, senha: string): Promise<boolean> => {
    try {
      // Simular login (em produção, seria API call)
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const foundUser = users.find((u: any) => u.email === email && u.senha === senha);

      if (!foundUser) {
        toast.error('Email ou senha incorretos');
        return false;
      }

      const { senha: _, ...userWithoutPassword } = foundUser;
      setUser(userWithoutPassword);
      setIsAuthenticated(true);
      localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));

      toast.success(`Bem-vindo, ${foundUser.nome}!`);
      return true;
    } catch (error) {
      toast.error('Erro ao fazer login');
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('currentUser');
    toast.info('Logout realizado com sucesso');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isAuthenticated }}>
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
