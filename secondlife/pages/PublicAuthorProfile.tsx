
import React, { useMemo, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useData } from '../contexts/DataContext';
import { ArrowLeft, BookOpen, User } from 'lucide-react';
import Pagination from '../components/Pagination';

const PublicAuthorProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { authors, articles, domains } = useData();

  const author = authors.find(a => a.id === id);

  const authorArticles = useMemo(() => {
    return articles
      .filter(a => a.authorId === id && a.status === 'published')
      .sort((a, b) => new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime());
  }, [articles, id]);

  const [page, setPage] = useState(1);
  const pageSize = 9;
  const totalPages = Math.max(1, Math.ceil(authorArticles.length / pageSize));
  const start = (page - 1) * pageSize;
  const pagedAuthorArticles = authorArticles.slice(start, start + pageSize);

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/', { replace: true });
    }
  };

  if (!author) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-xl text-gray-500 mb-4">未找到该作者</p>
          <Link to="/" className="text-blue-600 hover:underline">返回首页</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sticky Top Bar 
          z-40 ensures it sits above the main layout header (usually z-30) if they overlap, 
          or guarantees clickability.
      */}
      <div className="sticky top-0 bg-white/90 backdrop-blur-md z-40 border-b border-gray-200 transition-all">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center gap-4">
           <button 
             onClick={handleBack} 
             className="flex items-center gap-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 px-3 py-2 rounded-lg transition-colors cursor-pointer"
           >
             <ArrowLeft size={20} />
             <span className="font-medium text-sm">返回</span>
           </button>
           <span className="font-bold text-gray-900 truncate">{author.name} 的主页</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
         {/* Author Hero Section */}
         <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden mb-12">
            <div className="bg-slate-900 h-32 md:h-48 relative overflow-hidden">
               <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
            </div>
            <div className="px-8 pb-8 md:px-12 md:pb-12 relative">
               <div className="flex flex-col md:flex-row gap-6 md:gap-10 items-start">
                  <div className="-mt-16 relative">
                     <img 
                       src={author.avatar} 
                       alt={author.name} 
                       className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white shadow-xl object-cover bg-white" 
                     />
                  </div>
                  <div className="flex-1 pt-2 md:pt-6">
                     <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">{author.name}</h1>
                     <div className="flex items-center gap-2 text-gray-500 mb-6">
                       <User size={16} />
                       <span className="text-sm">内容创作者</span>
                     </div>
                     <div className="max-w-3xl">
                        <p className="text-gray-600 leading-relaxed text-lg">{author.bio}</p>
                     </div>
                  </div>
                  <div className="md:pt-8 flex flex-col gap-2 min-w-[140px]">
                     <div className="bg-blue-50 text-blue-900 rounded-xl p-4 text-center border border-blue-100">
                        <div className="text-3xl font-bold">{authorArticles.length}</div>
                        <div className="text-xs uppercase tracking-wider font-bold opacity-60 mt-1">已发布文章</div>
                     </div>
                  </div>
               </div>
            </div>
         </div>

         {/* Articles List */}
         <div className="mb-6 flex items-center gap-2">
            <BookOpen className="text-slate-400" size={20} />
            <h2 className="text-xl font-bold text-gray-900">全部作品</h2>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {authorArticles.length === 0 ? (
               <div className="col-span-full py-20 text-center text-gray-400 bg-white rounded-xl border border-gray-200 border-dashed">
                  该作者暂无发布内容
               </div>
             ) : (
               pagedAuthorArticles.map(article => (
                  <Link 
                    key={article.id} 
                    to={`/article/${article.id}`}
                    className="group relative bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col overflow-hidden"
                  >
                    <div className="h-56 w-full overflow-hidden bg-gray-100 relative">
                       {article.coverImage ? (
                          <img 
                            src={article.coverImage} 
                            alt={article.title} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                       ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-300 bg-slate-50">
                             <span className="text-4xl font-serif font-bold opacity-10">SL</span>
                          </div>
                       )}
                    </div>
                    
                    <div className="p-5 flex flex-col flex-1">
                      <h3 className="font-serif font-bold text-xl text-gray-900 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors leading-snug">
                        {article.title}
                      </h3>

                      {/* Domain Tags Below Title */}
                      <div className="flex flex-wrap gap-2 mb-3">
                          {article.domainIds.map(did => {
                             const d = domains.find(dom => dom.id === did);
                             return d ? (
                               <span key={d.id} className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded border border-black/5" style={{ backgroundColor: d.color, color: '#1e293b' }}>
                                 {d.name}
                               </span>
                             ) : null;
                          })}
                      </div>

                      <p className="text-gray-500 text-sm line-clamp-2 mb-4 flex-1 leading-relaxed">
                        {article.summary}
                      </p>
                      
                      <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-50">
                        <span className="text-xs text-gray-400 font-medium bg-gray-50 px-2 py-1 rounded">
                           {new Date(article.publishDate).toLocaleDateString('zh-CN')}
                        </span>
                      </div>
                    </div>
                  </Link>
               ))
            )}
         </div>
         <Pagination current={page} total={totalPages} onChange={setPage} />
      </div>
    </div>
  );
};

export default PublicAuthorProfile;
