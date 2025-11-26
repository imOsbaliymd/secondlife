
import React, { useState } from 'react';
import { useAuth, User } from '../contexts/AuthContext';
import { Plus, Trash2, Key, User as UserIcon } from 'lucide-react';
import Pagination from '../components/Pagination';

const UserManager: React.FC = () => {
  const { users, addUser, deleteUser } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 12;
  const totalPages = Math.max(1, Math.ceil(users.length / pageSize));
  const start = (page - 1) * pageSize;
  const pagedUsers = users.slice(start, start + pageSize);

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (username && password) {
      addUser(username, password);
      setUsername('');
      setPassword('');
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">用户管理</h1>
          <p className="text-gray-500 mt-1 text-sm">创建账号，分配给读者以访问内容。</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Create User Form */}
        <div className="md:col-span-1">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 sticky top-24">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Plus size={18} className="text-blue-600" />
              添加新用户
            </h3>
            <form onSubmit={handleAddUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">用户名 / 账号</label>
                <div className="relative">
                   <UserIcon size={16} className="absolute left-3 top-2.5 text-gray-400" />
                   <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                    placeholder="输入账号"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">初始密码</label>
                <div className="relative">
                   <Key size={16} className="absolute left-3 top-2.5 text-gray-400" />
                   <input
                    type="text"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                    placeholder="设置密码"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full bg-slate-900 text-white py-2 rounded-lg hover:bg-slate-800 transition-colors shadow-lg text-sm font-medium"
              >
                创建用户
              </button>
            </form>
          </div>
        </div>

        {/* User List */}
        <div className="md:col-span-2">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
             <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
               <h3 className="font-bold text-gray-800">已注册用户 ({users.length})</h3>
             </div>
             <div className="divide-y divide-gray-100">
               {pagedUsers.map((user) => (
                 <div key={user.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors group">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold uppercase shadow-sm ${user.role === 'admin' ? 'bg-purple-500' : 'bg-blue-500'}`}>
                        {user.username.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{user.username}</p>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                           <span className="bg-gray-100 px-1.5 py-0.5 rounded border border-gray-200">密码: {user.password}</span>
                           {user.role === 'admin' && <span className="text-purple-600 font-bold">管理员</span>}
                        </div>
                      </div>
                    </div>
                    
                    {user.role !== 'admin' && (
                      <button
                        onClick={() => {
                          if (confirm(`确定要删除用户 ${user.username} 吗？`)) {
                            deleteUser(user.id);
                          }
                        }}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                        title="删除用户"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                 </div>
               ))}
             </div>
             <Pagination current={page} total={totalPages} onChange={setPage} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserManager;
