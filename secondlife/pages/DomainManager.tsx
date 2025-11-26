
import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { Plus, X, Tag, Edit2, Save } from 'lucide-react';
import { Domain } from '../types';

const DomainManager: React.FC = () => {
  const { domains, addDomain, updateDomain, deleteDomain } = useData();
  const [inputValue, setInputValue] = useState('');
  const [colorValue, setColorValue] = useState('#dbeafe'); // Default light blue
  const [editingDomain, setEditingDomain] = useState<Domain | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    if (editingDomain) {
      updateDomain({ ...editingDomain, name: inputValue.trim(), color: colorValue });
      setEditingDomain(null);
    } else {
      addDomain(inputValue.trim(), colorValue);
    }
    setInputValue('');
    setColorValue('#dbeafe');
  };

  const startEdit = (domain: Domain) => {
    setEditingDomain(domain);
    setInputValue(domain.name);
    setColorValue(domain.color);
  };

  const cancelEdit = () => {
    setEditingDomain(null);
    setInputValue('');
    setColorValue('#dbeafe');
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">领域池</h1>
        <p className="text-gray-500 mt-1 text-sm">创建知识分类，便于文章的归档和检索。您可以为每个领域指定专属颜色。</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <form onSubmit={handleSubmit} className="flex gap-4 mb-8 items-end">
          <div className="relative flex-1">
            <label className="block text-xs font-bold text-gray-500 mb-1 ml-1">领域名称</label>
            <div className="relative">
              <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="例如: 哲学, 商业..."
                className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-colors ${
                  editingDomain ? 'border-amber-300 bg-amber-50 focus:border-amber-500' : 'border-gray-300 focus:border-blue-500'
                }`}
              />
            </div>
          </div>
          
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1 ml-1">标签颜色</label>
            <div className="flex items-center gap-2 h-[42px] border border-gray-300 rounded-lg px-2 bg-white">
              <input
                type="color"
                value={colorValue}
                onChange={(e) => setColorValue(e.target.value)}
                className="w-8 h-8 rounded cursor-pointer border-none p-0 bg-transparent"
                title="选择颜色"
              />
              <span className="text-xs text-gray-500 font-mono w-16">{colorValue}</span>
            </div>
          </div>
          
          <div className="h-[42px]">
            {editingDomain ? (
               <div className="flex gap-2 h-full">
                 <button
                  type="button"
                  onClick={cancelEdit}
                  className="px-4 bg-gray-100 text-gray-600 font-medium rounded-lg hover:bg-gray-200 transition-colors h-full"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-6 bg-amber-500 text-white font-medium rounded-lg hover:bg-amber-600 shadow-lg transition-colors flex items-center gap-2 h-full"
                >
                  <Save size={18} />
                  更新
                </button>
               </div>
            ) : (
              <button
                type="submit"
                disabled={!inputValue.trim()}
                className="px-6 bg-slate-900 text-white font-medium rounded-lg hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg flex items-center gap-2 h-full"
              >
                <Plus size={18} />
                添加
              </button>
            )}
          </div>
        </form>

        <div className="flex flex-wrap gap-3">
          {domains.length === 0 && (
            <p className="text-gray-400 italic">暂无领域。</p>
          )}
          {domains.map((domain) => (
            <div
              key={domain.id}
              className={`group flex items-center gap-2 pl-4 pr-2 py-2 rounded-full font-medium border border-transparent transition-all hover:shadow-md cursor-default`}
              style={{ backgroundColor: domain.color, color: '#1e293b' }} // Dark text for pastel colors
            >
              <span>{domain.name}</span>
              <div className="flex items-center gap-1 ml-1 pl-2 border-l border-black/10 opacity-60 group-hover:opacity-100">
                <button
                  onClick={() => startEdit(domain)}
                  className="p-1 hover:bg-black/10 rounded-full transition-colors"
                  title="重命名/调色"
                >
                  <Edit2 size={12} />
                </button>
                <button
                  onClick={() => {
                    if (confirm(`确定删除领域 "${domain.name}" 吗？`)) {
                       deleteDomain(domain.id);
                    }
                  }}
                  className="p-1 hover:bg-black/10 rounded-full transition-colors"
                  title="删除"
                >
                  <X size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DomainManager;
