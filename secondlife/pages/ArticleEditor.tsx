
import React, { useState, useRef, useEffect } from 'react';
import { useData } from '../contexts/DataContext';
import { useNavigate, useParams } from 'react-router-dom';
import { Check, ArrowLeft, Upload, Image as ImageIcon, X, Eye, PenTool, Search, ChevronDown } from 'lucide-react';
import { ArticleFormData } from '../types';
import ReactMarkdown from 'react-markdown';

// Fallback ID generator just in case context one fails or isn't available
const localGenerateId = () => Date.now().toString(36) + Math.random().toString(36).substring(2, 9);

const ArticleEditor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { authors, domains, articles, saveArticle, generateId } = useData();
  
  const contentFileRef = useRef<HTMLInputElement>(null);
  const coverImageRef = useRef<HTMLInputElement>(null);

  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  // Author Search State
  const [isAuthorDropdownOpen, setIsAuthorDropdownOpen] = useState(false);
  const [authorSearchQuery, setAuthorSearchQuery] = useState('');

  const [form, setForm] = useState<ArticleFormData>({
    title: '',
    content: '',
    authorId: '',
    domainIds: [],
    status: 'draft',
    keyPoints: ['', '', ''],
    summary: '',
    coverImage: ''
  });

  // Load existing article if editing
  useEffect(() => {
    if (id) {
      const existing = articles.find(a => a.id === id);
      if (existing) {
        setForm({ ...existing });
      }
    }
  }, [id, articles]);

  const handleContentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        setForm(prev => ({ ...prev, content: text }));
      };
      reader.readAsText(file);
    }
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
          setForm(prev => ({ ...prev, coverImage: result.url }));
          setIsUploading(false);
          return;
        } else {
           console.warn("Server upload failed, status:", res.status);
           // If 413, strict fail
           if (res.status === 413) {
             alert("服务器限制：图片太大 (413)。请修改 Nginx client_max_body_size。");
             setIsUploading(false);
             return;
           }
        }
      } catch (err) {
        console.warn("Server unreachable, falling back to local base64");
      }

      // 2. Fallback to Base64 (Local Storage)
      // Safety check: 500KB limit for local storage
      if (file.size > 500 * 1024) {
        alert("⚠️ 服务器未连接，且图片超过 500KB，无法保存到本地缓存。\n\n请联系管理员修复服务器，或使用小于 500KB 的图片。");
        setIsUploading(false);
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        setForm(prev => ({ ...prev, coverImage: base64 }));
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeCoverImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setForm(prev => ({ ...prev, coverImage: '' }));
  };

  const handleKeyPointChange = (index: 0 | 1 | 2, value: string) => {
    const newPoints = [...form.keyPoints] as [string, string, string];
    newPoints[index] = value;
    setForm(prev => ({ ...prev, keyPoints: newPoints }));
  };

  const toggleDomain = (domainId: string) => {
    setForm(prev => {
      const ids = prev.domainIds.includes(domainId)
        ? prev.domainIds.filter(d => d !== domainId)
        : [...prev.domainIds, domainId];
      return { ...prev, domainIds: ids };
    });
  };

  const handleSave = (status: 'draft' | 'published') => {
    // 1. Validation
    if (!form.title.trim()) {
      alert("请填写文章标题");
      return;
    }
    if (!form.authorId) {
      alert("请选择关联作者");
      return;
    }

    // 2. Save Logic
    try {
      const articleId = form.id || (generateId ? generateId() : localGenerateId());
      
      const articleToSave = {
        id: articleId,
        ...form,
        status,
        publishDate: form.publishDate || new Date().toISOString(),
      };

      saveArticle(articleToSave);
      navigate('/');
      
    } catch (error) {
      console.error("Save failed:", error);
      alert("❌ 保存失败！可能由于存储空间不足或网络错误。");
    }
  };

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/'); 
    }
  };

  // Helper for author search
  const filteredAuthors = authors.filter(a => 
    a.name.toLowerCase().includes(authorSearchQuery.toLowerCase())
  );

  const selectedAuthor = authors.find(a => a.id === form.authorId);

  return (
    <div className="bg-white min-h-screen pb-20" onClick={() => setIsAuthorDropdownOpen(false)}>
      {/* Top Bar */}
      <div className="sticky top-0 bg-white/95 backdrop-blur-md z-30 border-b border-gray-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 h-16 flex justify-between items-center">
          <button onClick={handleBack} className="flex items-center text-gray-500 hover:text-gray-900 transition-colors text-sm font-medium">
            <ArrowLeft size={18} className="mr-2" />
            返回
          </button>
          <div className="flex items-center gap-3">
             <div className="flex bg-gray-100 p-1 rounded-lg mr-4">
                <button 
                  onClick={() => setIsPreviewMode(false)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md flex items-center gap-1 transition-all ${!isPreviewMode ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                >
                  <PenTool size={12} /> 编辑
                </button>
                <button 
                  onClick={() => setIsPreviewMode(true)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md flex items-center gap-1 transition-all ${isPreviewMode ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                >
                  <Eye size={12} /> 预览
                </button>
             </div>

            <span className="text-xs text-gray-400 mr-2 border-r border-gray-200 pr-4">
              {form.content.length} 字
            </span>
            <button
              onClick={() => handleSave('draft')}
              disabled={isUploading}
              className="px-4 py-2 text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 font-medium transition-colors"
            >
              保存草稿
            </button>
            <button
              onClick={() => handleSave('published')}
              disabled={isUploading}
              className="px-4 py-2 text-sm bg-slate-900 text-white rounded-lg hover:bg-slate-800 font-medium flex items-center gap-2 shadow-lg transition-all"
            >
              <Check size={16} />
              发布文章
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 p-8 lg:p-12">
        {/* Left: Main Editor (Notion-like) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Cover Image Upload */}
          <input 
            type="file" 
            ref={coverImageRef}
            onChange={handleCoverUpload}
            accept="image/*"
            className="hidden"
          />
          <div 
            onClick={() => !isUploading && coverImageRef.current?.click()}
            className={`group relative w-full rounded-xl border-2 border-dashed transition-all cursor-pointer overflow-hidden ${
              form.coverImage ? 'h-64 border-transparent' : 'h-32 border-gray-200 bg-gray-50 hover:bg-gray-100'
            }`}
          >
             {isUploading ? (
                <div className="flex items-center justify-center h-full text-blue-500">
                   <div className="animate-spin mr-2">⟳</div> 上传中...
                </div>
             ) : form.coverImage ? (
               <>
                 <img src={form.coverImage} className="w-full h-full object-cover" alt="Cover" />
                 <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                    <button 
                      onClick={removeCoverImage}
                      className="opacity-0 group-hover:opacity-100 bg-white/90 text-red-500 p-2 rounded-full shadow-lg hover:bg-white transition-all transform scale-90 group-hover:scale-100"
                    >
                      <X size={20} />
                    </button>
                    <span className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 bg-black/50 text-white text-xs px-2 py-1 rounded">点击更换封面</span>
                 </div>
               </>
             ) : (
               <div className="flex flex-col items-center justify-center h-full text-gray-400">
                  <ImageIcon size={24} className="mb-2 opacity-50" />
                  <span className="text-sm">点击添加封面图片</span>
               </div>
             )}
          </div>

          {/* Title */}
          <textarea
            placeholder="无标题文章"
            value={form.title}
            onChange={e => setForm({ ...form, title: e.target.value })}
            rows={1}
            className="w-full text-4xl font-serif font-bold text-gray-900 placeholder-gray-300 border-none outline-none focus:ring-0 bg-transparent resize-none overflow-hidden leading-tight"
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement;
              target.style.height = 'auto';
              target.style.height = target.scrollHeight + 'px';
            }}
          />
          
          {/* Meta Bar */}
          <div className="flex items-center gap-4 border-b border-gray-100 pb-4 mb-4">
            <div className="flex items-center gap-2 text-sm text-gray-500">
               <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600">
                 {authors.find(a => a.id === form.authorId)?.name.charAt(0) || "?"}
               </div>
               <span>{authors.find(a => a.id === form.authorId)?.name || "未选择作者"}</span>
            </div>
            <div className="h-4 w-px bg-gray-200"></div>
            <input 
              type="file" 
              ref={contentFileRef} 
              onChange={handleContentUpload} 
              accept=".txt,.md" 
              className="hidden" 
            />
            <button 
              onClick={() => contentFileRef.current?.click()}
              className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              <Upload size={12} />
              导入 Markdown/文本
            </button>
          </div>

          {/* Content Area */}
          {isPreviewMode ? (
            <div className="prose prose-lg prose-slate max-w-none font-serif">
              {form.content ? (
                <ReactMarkdown>{form.content}</ReactMarkdown>
              ) : (
                <p className="text-gray-400 italic">暂无内容...</p>
              )}
            </div>
          ) : (
            <textarea
              placeholder="开始写作... (支持 Markdown 语法)"
              value={form.content}
              onChange={e => setForm({ ...form, content: e.target.value })}
              className="w-full min-h-[60vh] text-lg leading-loose text-gray-700 placeholder-gray-300 border-none outline-none focus:ring-0 bg-transparent resize-none font-serif font-normal"
            />
          )}
        </div>

        {/* Right: Metadata */}
        <div className="lg:col-span-4 space-y-8">
          
          {/* Association Card */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">元数据关联</h3>
            
            {/* Author Searchable Select */}
            <div className="mb-6 relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">关联作者 <span className="text-red-500">*</span></label>
              
              <div 
                onClick={(e) => {
                  e.stopPropagation();
                  setIsAuthorDropdownOpen(!isAuthorDropdownOpen);
                }}
                className={`w-full p-2 bg-gray-50 border rounded-lg flex items-center justify-between cursor-pointer hover:bg-white hover:border-blue-400 transition-all ${isAuthorDropdownOpen ? 'ring-2 ring-blue-100 border-blue-400 bg-white' : 'border-gray-200'}`}
              >
                {selectedAuthor ? (
                  <div className="flex items-center gap-2">
                    <img src={selectedAuthor.avatar} className="w-6 h-6 rounded-full object-cover" alt="" />
                    <span className="text-sm text-gray-900 font-medium">{selectedAuthor.name}</span>
                  </div>
                ) : (
                  <span className="text-sm text-gray-400 pl-1">点击选择作者 ({authors.length})</span>
                )}
                <ChevronDown size={16} className="text-gray-400" />
              </div>

              {isAuthorDropdownOpen && (
                <div 
                  onClick={(e) => e.stopPropagation()} 
                  className="absolute top-full left-0 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-2xl z-50 overflow-hidden flex flex-col max-h-[320px]"
                >
                   <div className="p-3 border-b border-gray-100 bg-gray-50/50 sticky top-0">
                      <div className="relative">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input 
                          autoFocus
                          type="text" 
                          placeholder="搜索作者姓名..." 
                          value={authorSearchQuery}
                          onChange={(e) => setAuthorSearchQuery(e.target.value)}
                          className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-blue-500 outline-none"
                        />
                      </div>
                   </div>
                   <div className="overflow-y-auto flex-1 p-1">
                      {filteredAuthors.length === 0 ? (
                        <div className="p-4 text-center text-gray-400 text-xs">未找到相关作者</div>
                      ) : (
                        filteredAuthors.map(author => (
                           <div 
                             key={author.id}
                             onClick={() => {
                               setForm({ ...form, authorId: author.id });
                               setIsAuthorDropdownOpen(false);
                               setAuthorSearchQuery('');
                             }}
                             className={`flex items-center gap-3 p-2.5 rounded-lg cursor-pointer transition-colors ${selectedAuthor?.id === author.id ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
                           >
                              <img src={author.avatar} className="w-8 h-8 rounded-full object-cover border border-gray-100 flex-shrink-0" alt="" />
                              <div className="min-w-0">
                                <div className="text-sm font-medium text-gray-900 flex items-center gap-2">
                                  {author.name}
                                  {selectedAuthor?.id === author.id && <Check size={14} className="text-blue-600" />}
                                </div>
                              </div>
                           </div>
                        ))
                      )}
                   </div>
                </div>
              )}
            </div>

            {/* Domain Select */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">所属领域</label>
              <div className="flex flex-wrap gap-2">
                {domains.map(d => {
                  const isSelected = form.domainIds.includes(d.id);
                  return (
                    <button
                      key={d.id}
                      onClick={() => toggleDomain(d.id)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-all ${
                        isSelected 
                          ? 'bg-slate-800 text-white border-slate-800 shadow-md' 
                          : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400'
                      }`}
                      style={!isSelected ? { backgroundColor: d.color, color: '#1e293b', opacity: 0.7 } : {}}
                    >
                      {d.name}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Enrichment Card */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">深度内容</h3>
            <div className="space-y-4 mb-6">
              <label className="block text-sm font-medium text-gray-700">三条核心论点</label>
              {[0, 1, 2].map((idx) => (
                <div key={idx} className="flex gap-3 group">
                  <span className="flex-shrink-0 w-6 h-6 rounded bg-slate-100 text-slate-500 flex items-center justify-center text-xs font-bold mt-1">
                    {idx + 1}
                  </span>
                  <textarea
                    rows={2}
                    value={form.keyPoints[idx as 0|1|2]}
                    onChange={(e) => handleKeyPointChange(idx as 0|1|2, e.target.value)}
                    placeholder={`输入第 ${idx + 1} 条论点...`}
                    className="flex-1 p-2 text-sm bg-gray-50 border border-transparent rounded-lg focus:bg-white focus:border-blue-500 outline-none resize-none transition-all"
                  />
                </div>
              ))}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">内容总结</label>
              <textarea
                rows={5}
                value={form.summary}
                onChange={e => setForm({ ...form, summary: e.target.value })}
                placeholder="输入一段话总结全文..."
                className="w-full p-3 text-sm bg-gray-50 border border-transparent rounded-lg focus:bg-white focus:border-blue-500 outline-none resize-none transition-all"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArticleEditor;
