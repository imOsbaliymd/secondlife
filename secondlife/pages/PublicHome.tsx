
import React, { useMemo, useState } from 'react';
import { useData } from '../contexts/DataContext';
import { Link, useNavigate } from 'react-router-dom';
import { Layers, Users, ArrowRight, Zap } from 'lucide-react';

const PublicHome: React.FC = () => {
  const { articles, authors, domains } = useData();
  const navigate = useNavigate();
  
  // State for Domain Column Filter on Home Page
  const [selectedDomainId, setSelectedDomainId] = useState<string>('all');

  // 1. Get Published Articles Sorted by Date (Newest First)
  const publishedArticles = useMemo(() => {
    return articles
      .filter(a => a.status === 'published')
      .sort((a, b) => new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime());
  }, [articles]);

  // 2. Domain Column Preview: 
  // Filter by selected domain, then take top 8 (2 rows * 4 cols)
  const filteredByDomain = useMemo(() => {
    let filtered = publishedArticles;
    if (selectedDomainId !== 'all') {
      filtered = filtered.filter(a => a.domainIds.includes(selectedDomainId));
    }
    return filtered;
  }, [publishedArticles, selectedDomainId]);
  const domainColumnPreview = filteredByDomain.slice(0, 8);

  // 3. Character Column Preview: Top 6 Authors sorted by their latest article date
  const activeAuthors = useMemo(() => {
    const authorLastPostMap = new Map<string, number>();
    
    // Find latest post date for each author
    publishedArticles.forEach(article => {
      const currentLast = authorLastPostMap.get(article.authorId) || 0;
      const articleTime = new Date(article.publishDate).getTime();
      if (articleTime > currentLast) {
        authorLastPostMap.set(article.authorId, articleTime);
      }
    });

    return [...authors]
      .filter(a => authorLastPostMap.has(a.id)) // Only show authors who have posted
      .sort((a, b) => {
        const dateA = authorLastPostMap.get(a.id) || 0;
        const dateB = authorLastPostMap.get(b.id) || 0;
        return dateB - dateA; // Descending by latest post
      })
      .slice(0, 6);
  }, [authors, publishedArticles]);


  return (
    <div>
      {/* Brand Title (No Hero Image) */}
      <div className="max-w-7xl mx-auto px-6 pt-12 pb-4 text-center">
         <h1 className="text-3xl md:text-4xl font-serif font-bold text-slate-900 leading-tight">
            用知识开启你的<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-emerald-600">第二人生</span>
          </h1>
          <p className="text-gray-500 mt-2 text-sm">深度阅读 · 认知升级 · 终身学习</p>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-16">
        
        {/* Section 1: Domain Column (Now includes Latest Updates) */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
               <Layers className="text-blue-600" size={24} />
               <h2 className="text-2xl font-bold text-gray-900">领域专栏</h2>
            </div>
            <Link 
              to="/domains"
              className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-all shadow-md"
            >
              进入领域专栏
              <ArrowRight size={14} />
            </Link>
          </div>

          {/* Horizontal Domain Filter Bar */}
          <div className="flex items-center gap-3 overflow-x-auto py-4 -mx-6 px-6 scrollbar-hide select-none">
            <button
              onClick={() => setSelectedDomainId('all')}
              className={`flex-shrink-0 px-5 py-2 rounded-full text-sm font-bold transition-all ${
                selectedDomainId === 'all' 
                  ? 'bg-slate-900 text-white shadow-md scale-105' 
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300'
              }`}
            >
              全部
            </button>
            {domains.map(domain => (
              <button
                key={domain.id}
                onClick={() => setSelectedDomainId(domain.id)}
                className={`flex-shrink-0 px-5 py-2 rounded-full text-sm font-bold transition-all border ${
                  selectedDomainId === domain.id 
                    ? 'ring-2 ring-slate-900 ring-offset-2 shadow-md border-transparent scale-105' 
                    : 'border-transparent hover:brightness-95'
                }`}
                style={{ 
                  backgroundColor: selectedDomainId === domain.id ? domain.color : `${domain.color}40`, 
                  color: '#1e293b',
                  borderColor: selectedDomainId === domain.id ? 'transparent' : `${domain.color}`
                }}
              >
                {domain.name}
              </button>
            ))}
          </div>
          
          {/* Main Article Grid - 2 Rows of 4 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 min-h-[400px]">
            {domainColumnPreview.length === 0 ? (
               <div className="col-span-full flex flex-col items-center justify-center text-center text-gray-400 bg-gray-50 rounded-xl border-dashed border-2 border-gray-200 h-64">
                 <Layers className="mb-2 opacity-20" size={32} />
                 <span>该分类下暂无文章</span>
               </div>
            ) : (
              domainColumnPreview.map((article, index) => {
                const author = authors.find(a => a.id === article.authorId);
                // Mark as "New" if we are in "All" mode and it's one of the top 3
                const isLatest = selectedDomainId === 'all' && index < 3;

                return (
                  <Link 
                    key={article.id} 
                    to={`/article/${article.id}`}
                    className="group relative bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col overflow-hidden"
                  >
                    <div className="h-40 w-full overflow-hidden bg-gray-100 relative">
                       {/* Latest Badge */}
                       {isLatest && (
                         <div className="absolute top-2 left-2 z-10 bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded shadow-md flex items-center gap-1 animate-pulse">
                           <Zap size={10} fill="currentColor" />
                           最新更新
                         </div>
                       )}

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
                    
                    <div className="p-4 flex flex-col flex-1">
                      {/* Title */}
                      <h3 className="font-serif font-bold text-base text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors leading-snug">
                        {article.title}
                      </h3>

                      {/* Tags Below Title */}
                      <div className="flex flex-wrap gap-1 mb-2">
                          {article.domainIds.map(did => {
                             const d = domains.find(dom => dom.id === did);
                             return d ? (
                               <span key={d.id} className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded border border-black/5" style={{ backgroundColor: d.color, color: '#1e293b' }}>
                                 {d.name}
                               </span>
                             ) : null;
                          })}
                      </div>

                      {/* Summary */}
                      <p className="text-gray-500 text-xs line-clamp-2 mb-3 flex-1 leading-relaxed">
                        {article.summary}
                      </p>
                      
                      <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-50">
                        {/* Author */}
                        <div className="flex items-center gap-2">
                          <img src={author?.avatar} className="w-5 h-5 rounded-full object-cover border border-gray-100" alt="" />
                          <span className="text-[10px] text-gray-700 font-bold truncate max-w-[80px]">{author?.name}</span>
                        </div>
                        {/* Publish Date */}
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
        </section>

        {/* Section 2: Character Column (6 Authors) */}
        <section>
          <div className="flex items-center justify-between mb-8">
             <div className="flex items-center gap-2">
                <Users className="text-slate-900" size={24} />
                <h2 className="text-2xl font-bold text-gray-900">人物专栏</h2>
             </div>
             <Link 
              to="/authors"
              className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-all shadow-md"
            >
              进入人物专栏
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
             {activeAuthors.length === 0 ? (
                <div className="col-span-full py-12 text-center text-gray-400 bg-gray-50 rounded-xl border-dashed border-2 border-gray-200">
                  暂无活跃作者
                </div>
             ) : (
                activeAuthors.map(author => {
                   const count = publishedArticles.filter(art => art.authorId === author.id).length;
                   return (
                      <Link 
                        key={author.id}
                        to={`/author/${author.id}`}
                        className="flex items-start gap-4 p-4 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all group"
                      >
                         <img src={author.avatar} alt={author.name} className="w-16 h-16 rounded-full object-cover border-2 border-gray-100 group-hover:border-blue-200 transition-colors" />
                         <div className="min-w-0 flex-1">
                            <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors text-lg truncate">{author.name}</h3>
                            <p className="text-xs text-gray-500 line-clamp-1 mb-2">{author.bio}</p>
                            <span className="inline-block px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-md">
                               {count} 篇作品
                            </span>
                         </div>
                         <ArrowRight size={16} className="text-gray-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                      </Link>
                   )
                })
             )}
          </div>
        </section>

      </div>
    </div>
  );
};

export default PublicHome;
