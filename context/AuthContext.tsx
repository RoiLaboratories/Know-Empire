import { createContext, useContext, ReactNode } from 'react';
import { useFarcasterAuth, FarcasterUser } from '@/hooks/useFarcasterAuth';

interface AuthContextType {
  user: FarcasterUser | null;
  loading: boolean;
  signIn: () => Promise<boolean>;
  signOut: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const auth = useFarcasterAuth();

  return (
    <AuthContext.Provider value={auth}>
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
