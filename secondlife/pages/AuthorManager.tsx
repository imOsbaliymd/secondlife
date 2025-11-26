
import React, { useState, useRef } from 'react';
import { useData } from '../contexts/DataContext';
import { Plus, Trash2, X, Edit2, Upload, User } from 'lucide-react';
import { Author } from '../types';
import Pagination from '../components/Pagination';

const AuthorManager: React.FC = () => {
  const { authors, addAuthor, updateAuthor, deleteAuthor } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  
  const [formData, setFormData] = useState({ name: '', bio: '', avatar: '' });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [page, setPage] = useState(1);
  const pageSize = 9;
  const totalPages = Math.max(1, Math.ceil(authors.length / pageSize));
  const start = (page - 1) * pageSize;
  const pagedAuthors = authors.slice(start, start + pageSize);

  const openAddModal = () => {
    setEditingId(null);
    setFormData({ name: '', bio: '', avatar: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (author: Author) => {
    setEditingId(author.id);
    setFormData({ name: author.name, bio: author.bio, avatar: author.avatar });
    setIsModalOpen(true);
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      
      // 1. Try Server Upload
      try {
        const data = new FormData();
        data.append('file', file);
        const res = await fetch('/api/upload', { method: 'POST', body: data });
        
        if (res.ok) {
          const result = await res.json();
          setFormData(prev => ({ ...prev, avatar: result.url }));
          setIsUploading(false);
          return;
        }
      } catch (err) {
        console.warn("Server upload failed, fallback to base64");
      }

      // 2. Fallback to Base64 (Local Storage Limit 500KB)
      if (file.size > 500 * 1024) {
        alert("⚠️ 服务器未连接，且图片超过 500KB，无法保存到本地。\n请使用较小的图片。");
        setIsUploading(false);
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        setFormData(prev => ({ ...prev, avatar: base64 }));
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;
    
    // Default avatar if none provided
    const finalAvatar = formData.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name)}&background=random`;
    
    try {
      if (editingId) {
        updateAuthor({
          id: editingId,
          ...formData,
          avatar: finalAvatar
        });
      } else {
        addAuthor({ ...formData, avatar: finalAvatar });
      }

      setFormData({ name: '', bio: '', avatar: '' });
      setIsModalOpen(false);
    } catch (e) {
      alert("保存失败");
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">作者池</h1>
          <p className="text-gray-500 mt-1 text-sm">管理知识背后的声音，创建和关联作者。</p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors shadow-lg text-sm"
        >
          <Plus size={16} />
          添加新作者
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {pagedAuthors.map((author: Author) => (
          <div key={author.id} className="bg-white rounded-xl border border-gray-200 p-6 flex items-start gap-4 shadow-sm hover:shadow-md transition-shadow group relative">
            <img 
              src={author.avatar} 
              alt={author.name} 
              className="w-16 h-16 rounded-full object-cover border border-gray-100 flex-shrink-0"
            />
            <div className="min-w-0 flex-1">
              <h3 className="font-bold text-gray-900">{author.name}</h3>
              <p className="text-sm text-gray-500 line-clamp-2 mt-1 h-10">{author.bio || '暂无简介'}</p>
            </div>
            
            <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button 
                onClick={() => openEditModal(author)}
                className="p-1.5 text-gray-400 hover:text-blue-600 bg-gray-50 rounded-md"
                title="编辑"
              >
                <Edit2 size={14} />
              </button>
              <button 
                onClick={() => {
                   if(confirm('确定删除该作者吗？')) deleteAuthor(author.id);
                }}
                className="p-1.5 text-gray-400 hover:text-red-600 bg-gray-50 rounded-md"
                title="删除"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
        
        {authors.length === 0 && (
          <div className="col-span-full py-12 text-center text-gray-400 bg-gray-50 rounded-xl border-dashed border-2 border-gray-200">
            暂无作者信息
          </div>
        )}
      </div>
      <Pagination current={page} total={totalPages} onChange={setPage} />

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-[fadeIn_0.2s_ease-out]">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-gray-900">{editingId ? '编辑作者' : '添加新作者'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Avatar Upload */}
              <div className="flex flex-col items-center mb-4">
                <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={handleAvatarUpload}
                  accept="image/*"
                  className="hidden"
                />
                <div 
                  onClick={() => !isUploading && fileInputRef.current?.click()}
                  className="w-24 h-24 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:bg-gray-50 hover:border-blue-400 transition-all relative overflow-hidden group"
                >
                   {formData.avatar ? (
                     <>
                       <img src={formData.avatar} className="w-full h-full object-cover" alt="Preview" />
                       <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Edit2 className="text-white" size={20} />
                       </div>
                     </>
                   ) : (
                     <div className="text-gray-400 flex flex-col items-center">
                       {isUploading ? <div className="animate-spin mb-1">⟳</div> : <User size={32} />}
                       <span className="text-[10px] mt-1">上传头像</span>
                     </div>
                   )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">姓名</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="作者姓名"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">简介</label>
                <textarea
                  rows={3}
                  value={formData.bio}
                  onChange={e => setFormData({ ...formData, bio: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                  placeholder="简短的个人介绍..."
                />
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isUploading}
                  className="w-full bg-slate-900 text-white py-2.5 rounded-lg hover:bg-slate-800 transition-colors font-medium shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isUploading ? '正在上传图片...' : (editingId ? '保存修改' : '确认添加')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuthorManager;
