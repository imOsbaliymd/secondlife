
import React, { useMemo, useState } from 'react';
import { useData } from '../contexts/DataContext';
import { Link, useNavigate } from 'react-router-dom';
import { Users, ArrowLeft, ArrowRight } from 'lucide-react';
import Pagination from '../components/Pagination';

const PublicAuthorColumn: React.FC = () => {
  const { authors, articles } = useData();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const pageSize = 21;
  const sortedAuthors = useMemo(() => {
    const counts = new Map<string, number>();
    articles.forEach(a => {
      if (a.status === 'published') {
        counts.set(a.authorId, (counts.get(a.authorId) || 0) + 1);
      }
    });
    return [...authors].sort((a, b) => (counts.get(b.id) || 0) - (counts.get(a.id) || 0));
  }, [authors, articles]);
  const totalPages = Math.max(1, Math.ceil(sortedAuthors.length / pageSize));
  const start = (page - 1) * pageSize;
  const pagedAuthors = sortedAuthors.slice(start, start + pageSize);

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
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
               <button onClick={handleBack} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                 <ArrowLeft size={20} className="text-gray-600" />
               </button>
               <div className="flex items-center gap-2">
                 <Users className="text-slate-900" size={24} />
                 <h1 className="text-2xl font-bold text-gray-900">人物专栏</h1>
               </div>
            </div>
            <div className="text-sm text-gray-500">
               共 {authors.length} 位创作者
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pagedAuthors.map(author => {
            const articleCount = articles.filter(a => a.authorId === author.id && a.status === 'published').length;
            
            return (
              <Link 
                key={author.id}
                to={`/author/${author.id}`}
                className="flex items-start gap-4 p-6 bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg transition-all hover:-translate-y-1 group"
              >
                 <img 
                   src={author.avatar} 
                   alt={author.name} 
                   className="w-20 h-20 rounded-full object-cover border-2 border-gray-100 group-hover:border-blue-200 transition-colors flex-shrink-0" 
                 />
                 <div className="min-w-0 flex-1 flex flex-col h-full">
                    <div className="flex justify-between items-start">
                       <h3 className="font-bold text-xl text-gray-900 group-hover:text-blue-600 transition-colors truncate mb-1">
                         {author.name}
                       </h3>
                    </div>
                    
                    <p className="text-sm text-gray-500 line-clamp-2 mb-4 flex-1">
                      {author.bio || '暂无介绍'}
                    </p>

                    <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-800">
                          {articleCount} 篇作品
                        </span>
                        <ArrowRight size={16} className="text-gray-300 group-hover:text-blue-500 transition-colors" />
                    </div>
                 </div>
              </Link>
            );
          })}
        </div>
        <Pagination current={page} total={totalPages} onChange={setPage} />
      </div>
    </div>
  );
};

export default PublicAuthorColumn;
