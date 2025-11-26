
import React, { useState } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, LogIn, X, AlertCircle, Lock } from 'lucide-react';

const PublicLayout: React.FC = () => {
  const { currentUser, logout, login } = useAuth();
  const navigate = useNavigate();
  
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    
    if (login(username, password)) {
      setIsLoginModalOpen(false);
      setUsername('');
      setPassword('');
      setLoginError('');
    } else {
      setLoginError('账号或密码错误，请重试');
    }
  };

  const openLoginModal = () => {
    setIsLoginModalOpen(true);
    setLoginError('');
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
             <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center text-white font-serif font-bold text-xl">S</div>
             <span className="font-serif font-bold text-xl tracking-tight text-slate-900">SecondLife</span>
          </Link>
          
          <nav className="flex items-center gap-6">
            {/* Removed Admin Dashboard Link */}
            
            {currentUser ? (
              <div className="flex items-center gap-4">
                 <div className="flex items-center gap-2">
                   <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-700 uppercase">
                     {currentUser.username.charAt(0)}
                   </div>
                   <span className="text-sm font-medium text-gray-900">{currentUser.username}</span>
                 </div>
                 <button 
                  onClick={handleLogout}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                  title="退出登录"
                 >
                   <LogOut size={16} />
                 </button>
              </div>
            ) : (
              <button 
                onClick={openLoginModal}
                className="flex items-center gap-1.5 text-sm font-medium text-slate-700 hover:text-blue-600 transition-colors"
              >
                <LogIn size={16} />
                登录
              </button>
            )}
          </nav>
        </div>
      </header>
      
      <main className="pb-20">
        <Outlet />
      </main>

      <footer className="bg-white border-t border-gray-200 py-12">
         <div className="max-w-7xl mx-auto px-6 text-center">
            <h2 className="font-serif text-2xl font-bold text-gray-900 mb-4">用知识开启你的第二人生</h2>
            <p className="text-gray-500 text-sm">© 2024 SecondLife Knowledge Base. All rights reserved.</p>
         </div>
      </footer>

      {/* Login Modal */}
      {isLoginModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm relative overflow-hidden">
            <button 
              onClick={() => setIsLoginModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={20} />
            </button>
            
            <div className="p-8">
              <div className="flex justify-center mb-6">
                 <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center text-white shadow-lg transform rotate-3">
                    <Lock size={20} />
                 </div>
              </div>
              
              <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">欢迎回来</h2>
              <p className="text-center text-gray-500 text-sm mb-8">请登录您的账号以访问完整内容</p>

              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <input
                    type="text"
                    placeholder="请输入账号"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none transition-all text-sm"
                  />
                </div>
                <div>
                  <input
                    type="password"
                    placeholder="请输入密码"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none transition-all text-sm"
                  />
                </div>

                {loginError && (
                  <div className="flex items-center gap-2 text-red-600 text-xs bg-red-50 p-3 rounded-lg border border-red-100 animate-[shake_0.5s_ease-in-out]">
                    <AlertCircle size={14} />
                    {loginError}
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-slate-800 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 mt-2"
                >
                  立即登录
                </button>
              </form>

              <div className="mt-6 text-center text-xs text-gray-400 border-t border-gray-100 pt-4 space-y-1">
                <p>没有账号？请联系管理员：</p>
                <p className="font-bold text-slate-700">小红书：@第二人生计划</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PublicLayout;
