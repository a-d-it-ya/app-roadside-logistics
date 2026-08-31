import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthModalMode, AuthIntent, SignUpPayload, LoginPayload } from '../types/auth';
import { authService } from '../services/authService';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isAuthModalOpen: boolean;
  authModalMode: AuthModalMode;
  authIntent: AuthIntent;
  openAuthModal: (mode?: AuthModalMode, intent?: AuthIntent) => void;
  closeAuthModal: () => void;
  signIn: (payload: LoginPayload) => Promise<User>;
  signUp: (payload: SignUpPayload) => Promise<User>;
  signOut: () => Promise<void>;
  updateProfile: (updates: { fullName?: string; phone?: string }) => Promise<User>;
  fetchCurrentUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => authService.getCachedUser());
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<AuthModalMode>('SIGN_IN');
  const [authIntent, setAuthIntent] = useState<AuthIntent>('GENERAL');

  // Verify and fetch fresh session from backend on mount
  useEffect(() => {
    let isMounted = true;

    async function initSession() {
      try {
        const freshUser = await authService.getCurrentUser();
        if (isMounted) {
          setUser(freshUser);
        }
      } catch (err) {
        if (isMounted) {
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    initSession();

    // Listen for session expiry from API interceptor
    const handleAuthExpired = () => {
      setUser(null);
      openAuthModal('SIGN_IN', 'GENERAL');
    };

    window.addEventListener('rsl_auth_expired', handleAuthExpired);
    return () => {
      isMounted = false;
      window.removeEventListener('rsl_auth_expired', handleAuthExpired);
    };
  }, []);

  const openAuthModal = (mode: AuthModalMode = 'SIGN_IN', intent: AuthIntent = 'GENERAL') => {
    setAuthModalMode(mode);
    setAuthIntent(intent);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const signIn = async (payload: LoginPayload): Promise<User> => {
    setIsLoading(true);
    try {
      const authenticatedUser = await authService.signIn(payload);
      setUser(authenticatedUser);
      setIsAuthModalOpen(false);
      return authenticatedUser;
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (payload: SignUpPayload): Promise<User> => {
    setIsLoading(true);
    try {
      const newUser = await authService.signUp(payload);
      setUser(newUser);
      setIsAuthModalOpen(false);
      return newUser;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async (): Promise<void> => {
    setIsLoading(true);
    try {
      await authService.signOut();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (updates: { fullName?: string; phone?: string }): Promise<User> => {
    setIsLoading(true);
    try {
      const updatedUser = await authService.updateProfile(updates);
      setUser(updatedUser);
      return updatedUser;
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCurrentUser = async (): Promise<void> => {
    const freshUser = await authService.getCurrentUser();
    setUser(freshUser);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        isAuthModalOpen,
        authModalMode,
        authIntent,
        openAuthModal,
        closeAuthModal,
        signIn,
        signUp,
        signOut,
        updateProfile,
        fetchCurrentUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
