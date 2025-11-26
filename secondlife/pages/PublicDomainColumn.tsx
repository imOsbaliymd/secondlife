
import React, { useMemo, useState } from 'react';
import { useData } from '../contexts/DataContext';
import { Link, useNavigate } from 'react-router-dom';
import { Layers, ArrowLeft } from 'lucide-react';
import Pagination from '../components/Pagination';

const PublicDomainColumn: React.FC = () => {
  const { articles, authors, domains } = useData();
  const navigate = useNavigate();
  const [selectedDomainId, setSelectedDomainId] = useState<string | 'all'>('all');

  // Filter and sort articles
  const displayedArticles = useMemo(() => {
    let filtered = articles.filter(a => a.status === 'published');
    
    if (selectedDomainId !== 'all') {
      filtered = filtered.filter(a => a.domainIds.includes(selectedDomainId));
    }

    return filtered.sort((a, b) => new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime());
  }, [articles, selectedDomainId]);

  const [page, setPage] = useState(1);
  const pageSize = 32;
  const totalPages = Math.max(1, Math.ceil(displayedArticles.length / pageSize));
  const start = (page - 1) * pageSize;
  const pagedDisplayed = displayedArticles.slice(start, start + pageSize);

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/', { replace: true });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-4">
               <button onClick={handleBack} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                 <ArrowLeft size={20} className="text-gray-600" />
               </button>
               <div className="flex items-center gap-2">
                 <Layers className="text-blue-600" size={24} />
                 <h1 className="text-2xl font-bold text-gray-900">领域专栏</h1>
               </div>
            </div>
            <div className="text-sm text-gray-500">
               收录 {displayedArticles.length} 篇文章
            </div>
          </div>

          {/* Domain Filters - Horizontal Scroll */}
          {/* Adjusted padding and margins to prevent UI clipping */}
          <div className="flex items-center gap-3 overflow-x-auto py-4 -mx-6 px-6 scrollbar-hide select-none">
            <button
              onClick={() => setSelectedDomainId('all')}
              className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                selectedDomainId === 'all' 
                  ? 'bg-slate-900 text-white shadow-md scale-105' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              全部
            </button>
            {domains.map(domain => (
              <button
                key={domain.id}
                onClick={() => setSelectedDomainId(domain.id)}
                className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all border ${
                  selectedDomainId === domain.id 
                    ? 'ring-2 ring-slate-900 ring-offset-1 shadow-md border-transparent scale-105' 
                    : 'border-transparent hover:brightness-95'
                }`}
                style={{ 
                  backgroundColor: selectedDomainId === domain.id ? domain.color : domain.color, 
                  color: '#1e293b',
                  opacity: selectedDomainId === domain.id ? 1 : 0.8
                }}
              >
                {domain.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {displayedArticles.length === 0 ? (
            <div className="col-span-full py-20 text-center text-gray-400">
              暂无该领域的内容
            </div>
          ) : (
            pagedDisplayed.map(article => {
              const author = authors.find(a => a.id === article.authorId);
              return (
                <Link 
                  key={article.id} 
                  to={`/article/${article.id}`}
                  className="group relative bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col overflow-hidden"
                >
                  <div className="h-40 w-full overflow-hidden bg-gray-100 relative">
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
                    <h3 className="font-serif font-bold text-base text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors leading-snug">
                      {article.title}
                    </h3>

                    {/* Domain Tags - Below Title */}
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

                    <p className="text-gray-500 text-xs line-clamp-2 mb-3 flex-1 leading-relaxed">
                      {article.summary}
                    </p>
                    
                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-50">
                      <div className="flex items-center gap-2">
                        <img src={author?.avatar} className="w-5 h-5 rounded-full object-cover border border-gray-100" alt="" />
                        <span className="text-[10px] text-gray-700 font-bold truncate max-w-[80px]">{author?.name}</span>
                      </div>
                      <span className="text-[10px] text-gray-400 font-medium">
                          {new Date(article.publishDate).toLocaleDateString('zh-CN')}
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })
          )}
        </div>
        <Pagination current={page} total={totalPages} onChange={setPage} />
      </div>
    </div>
  );
};

export default PublicDomainColumn;
