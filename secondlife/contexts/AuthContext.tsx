
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useData } from './DataContext';

export interface User {
  id: string;
  username: string;
  password: string; 
  role: 'admin' | 'user';
}

interface AuthContextType {
  users: User[];
  currentUser: User | null;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  addUser: (username: string, password: string) => void;
  deleteUser: (id: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Consume users from DataContext (which syncs with Server)
  const { users, addUser: dataAddUser, deleteUser: dataDeleteUser, generateId } = useData();
  
  // Current session still lives in localstorage for UX (remember me)
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('sl_current_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem('sl_current_user', JSON.stringify(currentUser));
      } else {
        localStorage.removeItem('sl_current_user');
      }
    } catch (e) {
      console.error("Failed to save session", e);
    }
  }, [currentUser]);

  const login = (username: string, password: string): boolean => {
    const user = users.find(u => u.username === username && u.password === password);
    if (user) {
      setCurrentUser(user);
      return true;
    }
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const addUser = (username: string, password: string) => {
    if (users.some(u => u.username === username)) {
      alert('用户名已存在');
      return;
    }
    const newUser: User = {
      id: generateId(), // Use generator from DataContext
      username,
      password,
      role: 'user'
    };
    dataAddUser(newUser); // Delegate to DataContext
  };

  const deleteUser = (id: string) => {
    dataDeleteUser(id); // Delegate to DataContext
  };

  return (
    <AuthContext.Provider value={{ users, currentUser, login, logout, addUser, deleteUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
