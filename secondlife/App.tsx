import React, { useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { DataProvider } from './contexts/DataContext';
import { AuthProvider } from './contexts/AuthContext';
import AdminLayout from './pages/AdminLayout';
import ArticleList from './pages/ArticleList';
import AuthorManager from './pages/AuthorManager';
import DomainManager from './pages/DomainManager';
import ArticleEditor from './pages/ArticleEditor';
import UserManager from './pages/UserManager';
import PublicLayout from './pages/PublicLayout';
import PublicHome from './pages/PublicHome';
import PublicArticle from './pages/PublicArticle';
import PublicAuthorProfile from './pages/PublicAuthorProfile';
import PublicDomainColumn from './pages/PublicDomainColumn';
import PublicAuthorColumn from './pages/PublicAuthorColumn';

// Helper component to scroll to top on route change
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

function App() {
  // 核心路由逻辑：区分前台和后台
  // 管理后台唯一入口: http://secondlife.group/?portal=manage
  const location = window.location;
  const hostname = location.hostname;
  const searchParams = new URLSearchParams(location.search);
  
  const isManageDomain = 
    hostname.startsWith('manage.') || 
    hostname.includes('manage') ||
    searchParams.get('portal') === 'manage';

  return (
    <DataProvider>
      <AuthProvider>
        <HashRouter>
          <ScrollToTop />
          <Routes>
            {isManageDomain ? (
              /* --- 后台管理系统路由 --- */
              <Route path="/" element={<AdminLayout />}>
                <Route index element={<ArticleList />} />
                <Route path="authors" element={<AuthorManager />} />
                <Route path="domains" element={<DomainManager />} />
                <Route path="users" element={<UserManager />} />
                <Route path="editor" element={<ArticleEditor />} />
                <Route path="editor/:id" element={<ArticleEditor />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Route>
            ) : (
              /* --- 前台展示系统路由 --- */
              <Route path="/" element={<PublicLayout />}>
                 <Route index element={<PublicHome />} />
                 <Route path="article/:id" element={<PublicArticle />} />
                 <Route path="author/:id" element={<PublicAuthorProfile />} />
                 <Route path="domains" element={<PublicDomainColumn />} />
                 <Route path="authors" element={<PublicAuthorColumn />} />
                 <Route path="*" element={<Navigate to="/" replace />} />
              </Route>
            )}
          </Routes>
        </HashRouter>
      </AuthProvider>
    </DataProvider>
  );
}

export default App;