import { createContext, useContext, useState, type ReactNode, useEffect, useMemo } from 'react';
import axios from "axios";
import { useNavigate } from 'react-router';
import { axiosClient } from '~/utils/fetchClient';

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<boolean>;
  isAuthenticated: boolean;
  authLoading: boolean;
}

async function getCurrentUser() {
    try {
        const response = await axiosClient.get("auth/me")

        if (response.status === 200) {
            const currentUser = response.data.user;
            return currentUser as User;
        }

        return null
    } catch(err) {
        return null
    }
}

async function logOut() {
    try {
        const response = await axiosClient.post("sign/out")

        if (response.status === 200) {
            return true;
        }

        return false
    } catch(err) {
        return false
    }
}

async function logIn(email: string, password: string) {
    try {
        const response = await axiosClient.post("sign/in",{
            email: email, password: password
        });
        
        if (response.status === 200) {
            const currentUser = response.data.user;
            return currentUser as User;
        }

        return null
    } catch(err) {
        console.log(err);
        return null
    }
}

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const initAuth = async () => {
    setIsLoading(true);
    const currUser = await getCurrentUser();
    setUser(currUser)
    setIsLoading(false);
  }

  useEffect(() => {
    initAuth();
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const result = await logIn(email, password);
    console.log(result)
    if (result) {
        setUser(result);
        navigate("/dashboard")
        return true;
    } 

    return false;
  };

  const logout = async () => {
    const res = await logOut();
    if (res) {
        setUser(null);
    }

    return res;
  };

  const value = useMemo<AuthContextType>(() => {
    return {
      user,
      login,
      logout,
      isAuthenticated: !!user,
      authLoading: isLoading
    }
  }, [user, isLoading])

  if (isLoading) {
    return null;
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook for accessing auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
