import React, { createContext, useContext, useState, ReactNode, useEffect, useRef } from 'react';
import { Author, Domain, Article } from '../types';
import { User } from './AuthContext';

interface DataContextType {
  authors: Author[];
  domains: Domain[];
  articles: Article[];
  users: User[];
  
  addAuthor: (author: Omit<Author, 'id'>) => void;
  updateAuthor: (author: Author) => void;
  deleteAuthor: (id: string) => void;
  
  addDomain: (name: string, color: string) => void;
  updateDomain: (domain: Domain) => void;
  deleteDomain: (id: string) => void;
  
  saveArticle: (article: Article) => void;
  deleteArticle: (id: string) => void;

  addUser: (user: User) => void;
  deleteUser: (id: string) => void;

  getAuthorById: (id: string) => Author | undefined;
  getDomainById: (id: string) => Domain | undefined;
  generateId: () => string;
  
  isCloud: boolean;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const generateId = () => {
  // 生成兼容性好的随机ID
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
};

// Initial admin user fallback
const DEFAULT_USERS = [{ id: '1', username: 'admin', password: 'password', role: 'admin' } as User];

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [authors, setAuthors] = useState<Author[]>([]);
  const [domains, setDomains] = useState<Domain[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  
  const [isCloud, setIsCloud] = useState(false);
  const isInitialLoad = useRef(true);

  // 1. 初始化加载数据：只从服务器加载
  useEffect(() => {
    const loadData = async () => {
      try {
        console.log("📡 Fetching data from /api/data...");
        const res = await fetch('/api/data');
        if (res.ok) {
          const data = await res.json();
          setAuthors(data.authors || []);
          setDomains(data.domains || []);
          setArticles(data.articles || []);
          // 如果服务器没用户数据，使用默认admin
          setUsers((data.users && data.users.length > 0) ? data.users : DEFAULT_USERS);
          setIsCloud(true);
          console.log("✅ Data loaded from SERVER");
        } else {
          console.error(`❌ Failed to load data from server. Status: ${res.status} ${res.statusText}`);
          setIsCloud(false);
        }
      } catch (e) {
        console.error("❌ Server unreachable. Check if Node backend is running:", e);
        setIsCloud(false);
      }
      isInitialLoad.current = false;
    };
    
    loadData();
  }, []);

  // 2. 数据变动时：保存到服务器
  useEffect(() => {
    if (isInitialLoad.current) return;
    
    const saveData = async () => {
      const payload = { authors, domains, articles, users };
      
      try {
        await fetch('/api/data', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        setIsCloud(true);
      } catch (e) {
        setIsCloud(false);
        console.error("Failed to save to server", e);
      }
    };

    // 防抖保存，避免频繁请求
    const timeout = setTimeout(saveData, 500);
    return () => clearTimeout(timeout);
  }, [authors, domains, articles, users]);

  // --- 增删改查逻辑 ---

  const addAuthor = (authorData: Omit<Author, 'id'>) => {
    const newAuthor: Author = { ...authorData, id: generateId() };
    setAuthors(prev => [...prev, newAuthor]);
  };

  const updateAuthor = (updatedAuthor: Author) => {
    setAuthors(prev => prev.map(a => a.id === updatedAuthor.id ? updatedAuthor : a));
  };

  const deleteAuthor = (id: string) => {
    setAuthors(prev => prev.filter(a => a.id !== id));
  };

  const getAuthorById = (id: string) => authors.find(a => a.id === id);

  const addDomain = (name: string, color: string) => {
    const newDomain: Domain = { id: generateId(), name, color: color || '#e2e8f0' };
    setDomains(prev => [...prev, newDomain]);
  };

  const updateDomain = (updatedDomain: Domain) => {
    setDomains(prev => prev.map(d => d.id === updatedDomain.id ? updatedDomain : d));
  };

  const deleteDomain = (id: string) => {
    setDomains(prev => prev.filter(d => d.id !== id));
  };

  const getDomainById = (id: string) => domains.find(d => d.id === id);

  const saveArticle = (article: Article) => {
    setArticles(prev => {
      const exists = prev.find(a => a.id === article.id);
      if (exists) {
        return prev.map(a => a.id === article.id ? article : a);
      }
      return [article, ...prev];
    });
  };

  const deleteArticle = (id: string) => {
    setArticles(prev => prev.filter(a => a.id !== id));
  };

  const addUser = (user: User) => {
    setUsers(prev => [...prev, user]);
  };

  const deleteUser = (id: string) => {
    setUsers(prev => prev.filter(u => u.id !== id));
  };

  return (
    <DataContext.Provider value={{
      authors, domains, articles, users,
      addAuthor, updateAuthor, deleteAuthor,
      addDomain, updateDomain, deleteDomain,
      saveArticle, deleteArticle,
      addUser, deleteUser,
      getAuthorById, getDomainById,
      generateId,
      isCloud
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};