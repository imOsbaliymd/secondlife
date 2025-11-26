
import React, { useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, Tag, PenTool, LogOut, UserCog, Lock, AlertCircle, ShieldCheck, Cloud, Database, WifiOff } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';

const AdminLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, login, currentUser } = useAuth();
  const { isCloud } = useData();
  
  // Login State for standalone admin login page
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (login(username, password)) {
      // Login success, state updates automatically
    } else {
      setError('认证失败：账号密码错误或无权限');
    }
  };

  // SECURITY GUARD:
  // If no user or not admin, show the Login Screen instead of the Dashboard
  if (!currentUser || currentUser.role !== 'admin') {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 animate-[fadeIn_0.5s_ease-out] relative z-10">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl flex items-center justify-center text-white mx-auto mb-4 shadow-lg shadow-slate-500/30">
              <ShieldCheck size={32} />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">SecondLife 管理控制台</h1>
            <p className="text-blue-600 font-medium mt-2 text-sm bg-blue-50 inline-block px-3 py-1 rounded-full border border-blue-100">
              管理端入口
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">管理员账号</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-slate-800 focus:border-transparent outline-none transition-all"
                placeholder="请输入 Admin ID"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">安全密码</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-slate-800 focus:border-transparent outline-none transition-all"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-600 text-xs bg-red-50 p-3 rounded-lg border border-red-100">
                <AlertCircle size={14} />
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
            >
              验证并登录
            </button>
          </form>
          
          <div className="mt-8 text-center border-t border-gray-100 pt-6">
             <p className="text-xs text-gray-400">此系统仅限内部工作人员访问</p>
             <p className="text-xs text-gray-300 mt-1">IP: {window.location.hostname}</p>
          </div>
        </div>
      </div>
    );
  }

  // Updated paths to use root relative paths since we are on the manage subdomain
  const navItems = [
    { path: '/', label: '内容管理', icon: LayoutDashboard, exact: true },
    { path: '/editor', label: '创作文章', icon: PenTool, exact: false },
    { path: '/authors', label: '作者管理', icon: Users, exact: false },
    { path: '/domains', label: '领域分类', icon: Tag, exact: false },
    { path: '/users', label: '用户管理', icon: UserCog, exact: false },
  ];

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col shadow-xl z-20">
        <div className="p-6 border-b border-slate-700">
          <h1 className="text-2xl font-serif font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
            SecondLife
          </h1>
          <p className="text-xs text-slate-400 mt-1">后台管理系统</p>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            // Handle exact matching for root
            const isActive = item.exact 
              ? location.pathname === item.path 
              : location.pathname.startsWith(item.path) && item.path !== '/';

            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.exact}
                className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  isActive 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' 
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon size={18} />
                <span className="font-medium text-sm">{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-700 space-y-2">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 text-slate-400 hover:text-red-400 text-sm w-full px-4 py-2 rounded transition-colors"
          >
            <LogOut size={16} />
            <span>退出登录</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative bg-gray-50/50">
        <header className="bg-white h-16 border-b border-gray-200 sticky top-0 z-10 flex items-center justify-between px-8 shadow-sm">
            <h2 className="text-lg font-bold text-gray-800">
              {navItems.find(i => i.exact ? location.pathname === i.path : location.pathname.startsWith(i.path) && i.path !== '/')?.label || '内容管理'}
            </h2>
            
            <div className="flex items-center gap-6">
              {/* DATA STATUS INDICATOR */}
              <div 
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border ${
                  isCloud 
                    ? 'bg-green-50 text-green-700 border-green-200' 
                    : 'bg-amber-50 text-amber-700 border-amber-200'
                }`}
                title={isCloud ? "数据已实时同步至服务器硬盘" : "无法连接服务器，数据仅保存在本地浏览器"}
              >
                {isCloud ? <Cloud size={14} /> : <WifiOff size={14} />}
                {isCloud ? '数据已同步至服务器' : '本地存储模式 (未备份)'}
              </div>

              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-500">{currentUser?.username}</span>
                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-500 to-emerald-500 flex items-center justify-center text-white font-bold shadow-md uppercase">
                  {currentUser?.username.charAt(0) || 'A'}
                </div>
              </div>
            </div>
        </header>
        <div className="p-8 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
