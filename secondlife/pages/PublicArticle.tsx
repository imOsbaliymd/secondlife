
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { Lock, ArrowLeft, Calendar, Share2, LogIn, AlertCircle, X, ChevronRight } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const PublicArticle: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { articles, authors, domains } = useData();
  const { currentUser, login } = useAuth();
  
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [showAuthorModal, setShowAuthorModal] = useState(false);

  const article = articles.find(a => a.id === id);
  const author = authors.find(a => a.id === article?.authorId);
  const relatedDomains = domains.filter(d => article?.domainIds.includes(d.id));

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    if (login(loginUsername, loginPassword)) {
      // Login successful
    } else {
      setLoginError('账号或密码错误，请重试');
    }
  };

  const handleBack = () => {
    // Robust check using history length
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/', { replace: true });
    }
  };

  if (!article) return <div className="p-20 text-center">文章不存在</div>;

  const displayContent = currentUser 
    ? article.content 
    : article.content.slice(0, 500);

  return (
    <div className="min-h-screen bg-white">
      {/* Top Navigation Bar - Sticky */}
      <div className="sticky top-0 bg-white/80 backdrop-blur-md z-20 border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-6 h-14 flex items-center justify-between">
           <button 
             onClick={handleBack} 
             className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors font-medium text-sm group"
           >
             <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
             返回
           </button>
           <div className="text-sm font-serif font-bold text-gray-900 truncate max-w-[200px] opacity-0 md:opacity-100 transition-opacity">
             {article.title}
           </div>
           <div className="w-8"></div> {/* Spacer for balance */}
        </div>
      </div>

      <article className="max-w-4xl mx-auto px-6 py-8">
        {/* Cover Image */}
        {article.coverImage && (
          <div className="w-full h-64 md:h-[400px] rounded-2xl overflow-hidden mb-10 shadow-lg relative group">
            <img src={article.coverImage} alt={article.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
          </div>
        )}

        {/* Header Content */}
        <div className="mb-12 text-center max-w-2xl mx-auto">
          {/* 1. Title */}
          <h1 className="text-3xl md:text-5xl font-serif font-bold text-gray-900 mb-6 leading-tight">
            {article.title}
          </h1>

          {/* 2. Domain Tags (Moved below title) */}
          <div className="flex justify-center gap-2 mb-8">
              {relatedDomains.map(d => (
                <span key={d.id} className="px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase" style={{ backgroundColor: d.color, color: '#1e293b' }}>
                  {d.name}
                </span>
              ))}
          </div>
          
          <div className="flex items-center justify-center gap-6 border-y border-gray-100 py-6">
              {/* Clickable Author Section */}
              <div 
                onClick={() => setShowAuthorModal(true)}
                className="flex items-center gap-3 cursor-pointer group hover:bg-gray-50 px-3 py-2 rounded-lg transition-colors"
                title="点击查看作者详情"
              >
                <img src={author?.avatar} className="w-10 h-10 rounded-full border border-gray-200 object-cover group-hover:border-blue-300 transition-colors" alt={author?.name} />
                <div className="text-left">
                  <p className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors flex items-center gap-1">
                    {author?.name}
                    <ChevronRight size={12} className="text-gray-400 group-hover:text-blue-400" />
                  </p>
                  <p className="text-xs text-gray-500 line-clamp-1 max-w-[150px]">{author?.bio}</p>
                </div>
              </div>

              <div className="h-8 w-px bg-gray-200"></div>

              <div className="flex items-center gap-2 text-gray-500 text-sm">
                <Calendar size={16} />
                <span>{new Date(article.publishDate).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
          </div>
        </div>

        {/* Key Points Summary */}
        <div className="bg-slate-50 border border-slate-100 rounded-xl p-8 mb-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5">
             <div className="text-9xl font-serif font-bold">“</div>
          </div>
          <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2 uppercase tracking-widest text-xs">
            <span className="w-2 h-2 bg-slate-900 rounded-sm"></span>
            核心观点提取
          </h3>
          <ul className="space-y-4">
            {article.keyPoints.map((point, idx) => (
              <li key={idx} className="flex gap-4 text-slate-700 leading-relaxed group">
                <span className="flex-shrink-0 w-6 h-6 rounded bg-slate-200 text-slate-600 flex items-center justify-center text-xs font-bold mt-0.5 group-hover:bg-slate-900 group-hover:text-white transition-colors">
                  {idx+1}
                </span>
                <span className="font-serif italic">{point}</span>
              </li>
            ))}
          </ul>
          <div className="mt-8 pt-6 border-t border-slate-200/60">
            <p className="text-slate-600 text-sm leading-7">
               <span className="font-bold text-slate-900">摘要：</span>
               {article.summary}
            </p>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="relative font-serif">
          {currentUser ? (
            <div className="prose prose-lg prose-slate max-w-none animate-in fade-in duration-500">
              <ReactMarkdown>{displayContent}</ReactMarkdown>
            </div>
          ) : (
            <div>
              <div className="prose prose-lg prose-slate max-w-none blur-[2px] select-none opacity-50 max-h-[600px] overflow-hidden pointer-events-none">
                <ReactMarkdown>{displayContent}</ReactMarkdown>
                <p className="mt-4">...</p>
                <p className="mt-4">...</p>
                <p className="mt-4">...</p>
              </div>
              
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/80 to-white flex flex-col items-center justify-center z-10 pt-20">
                <div className="bg-white p-8 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-gray-100 max-w-sm w-full transform transition-all duration-300">
                    <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center mx-auto mb-6 text-white shadow-lg rotate-3">
                      <Lock size={24} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2 text-center">阅读全文</h3>
                    <p className="text-gray-500 mb-8 text-center text-sm">此内容仅限注册会员，请登录后继续。</p>
                    
                    <form onSubmit={handleLogin} className="space-y-4">
                      <div>
                        <input 
                          type="text" 
                          placeholder="账号" 
                          value={loginUsername}
                          onChange={e => setLoginUsername(e.target.value)}
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none transition-all text-sm"
                        />
                      </div>
                      <div>
                        <input 
                          type="password" 
                          placeholder="密码" 
                          value={loginPassword}
                          onChange={e => setLoginPassword(e.target.value)}
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
                        className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-slate-800 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center justify-center gap-2"
                      >
                        <LogIn size={16} />
                        立即登录
                      </button>
                    </form>
                    
                    <div className="text-xs text-gray-400 mt-6 text-center border-t border-gray-100 pt-4 space-y-1">
                      <p>没有账号？请联系管理员：</p>
                      <p className="font-bold text-slate-700">小红书：@第二人生计划</p>
                    </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Actions */}
        <div className="mt-20 pt-10 border-t border-gray-200 flex justify-between items-center">
          <button onClick={handleBack} className="flex items-center gap-2 text-gray-500 hover:text-gray-900 font-sans font-medium transition-colors">
            <ArrowLeft size={18} />
            返回上一页
          </button>
          <button className="flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-colors px-4 py-2 hover:bg-blue-50 rounded-lg">
            <Share2 size={18} />
            <span className="text-sm">分享文章</span>
          </button>
        </div>
      </article>

      {/* Author Modal */}
      {showAuthorModal && author && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl relative overflow-hidden animate-[scaleIn_0.2s_ease-out]">
             {/* Header Background */}
             <div className="h-32 bg-gradient-to-r from-slate-900 to-slate-800 relative">
               <button 
                 onClick={() => setShowAuthorModal(false)}
                 className="absolute top-6 right-6 text-white/70 hover:text-white transition-colors bg-white/10 p-1.5 rounded-full backdrop-blur-sm"
               >
                 <X size={20} />
               </button>
             </div>
             
             {/* Avatar & Content */}
             <div className="px-10 pb-10">
               <div className="relative -mt-16 mb-6">
                 <img 
                   src={author.avatar} 
                   alt={author.name} 
                   className="w-32 h-32 rounded-full border-4 border-white shadow-xl object-cover" 
                 />
               </div>
               
               <div className="flex justify-between items-end mb-6">
                 <div>
                   <h3 className="text-3xl font-bold text-gray-900 mb-2">{author.name}</h3>
                 </div>
                 <button 
                   onClick={() => navigate(`/author/${author.id}`)}
                   className="py-2.5 px-6 bg-slate-900 text-white rounded-xl text-sm font-medium hover:bg-slate-800 transition-colors shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                 >
                   查看更多作品
                 </button>
               </div>
               
               <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                 <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">关于作者</h4>
                 <p className="text-gray-700 text-base leading-relaxed">
                   {author.bio}
                 </p>
               </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PublicArticle;
