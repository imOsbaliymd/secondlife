
import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { Link, useNavigate } from 'react-router-dom';
import { Edit2, Eye, Trash2, Search, Filter } from 'lucide-react';
import Pagination from '../components/Pagination';

const ArticleList: React.FC = () => {
  const { articles, authors, domains, deleteArticle } = useData();
  const navigate = useNavigate();
  const [filter, setFilter] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const filteredArticles = articles.filter(a => 
    a.title.toLowerCase().includes(filter.toLowerCase())
  );
  const totalPages = Math.max(1, Math.ceil(filteredArticles.length / pageSize));
  const start = (page - 1) * pageSize;
  const pagedArticles = filteredArticles.slice(start, start + pageSize);

  return (
    <div>
       <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">内容看板</h1>
          <p className="text-gray-500 mt-2 text-sm">管理知识库中的所有文章资源。</p>
        </div>
        <div className="flex gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="搜索文章..."
              value={filter}
              onChange={e => setFilter(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none w-64"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 text-sm font-medium">
            <Filter size={16} />
            筛选
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">文章标题</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">作者</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">领域</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">状态</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredArticles.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                  未找到相关文章。 <Link to="/editor" className="text-blue-600 hover:underline">去创作？</Link>
                </td>
              </tr>
            )}
            {pagedArticles.map((article) => {
              const author = authors.find(a => a.id === article.authorId);
              const articleDomains = domains.filter(d => article.domainIds.includes(d.id));
              
              return (
                <tr key={article.id} className="hover:bg-gray-50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="font-bold text-gray-900">{article.title || '无标题文章'}</div>
                    <div className="text-xs text-gray-400 mt-1">
                      发布于: {new Date(article.publishDate).toLocaleDateString('zh-CN')}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {author?.avatar ? (
                        <img src={author.avatar} alt="" className="w-6 h-6 rounded-full object-cover" />
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-gray-200"></div>
                      )}
                      <span className="text-sm text-gray-700">{author?.name || '未知作者'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {articleDomains.map(d => (
                        <span key={d.id} className="text-[10px] px-2 py-0.5 rounded-full bg-opacity-50 border border-transparent font-medium" style={{ backgroundColor: d.color, color: '#1e293b' }}>
                          {d.name}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      article.status === 'published' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {article.status === 'published' ? '已发布' : '草稿'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => navigate(`/editor/${article.id}`)}
                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title="编辑"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => {
                          if (window.confirm('确定要删除这篇文章吗？')) {
                            deleteArticle(article.id);
                          }
                        }}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="删除"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <Pagination current={page} total={totalPages} onChange={setPage} />
    </div>
  );
};

export default ArticleList;
