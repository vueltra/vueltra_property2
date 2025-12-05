import React, { useEffect, useState } from 'react';
import { BlogPost } from '../types';
import { StoreService } from '../services/store';

interface BlogDetailProps {
  postId: string;
  onBack: () => void;
  onCategoryClick?: (category: string) => void;
}

const BlogDetail: React.FC<BlogDetailProps> = ({ postId, onBack, onCategoryClick }) => {
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPost = async () => {
      setLoading(true);
      const data = await StoreService.getBlogPostById(postId);
      if (data) setPost(data);
      setLoading(false);
    };
    loadPost();
    window.scrollTo(0, 0);
  }, [postId]);

  if (loading) return <div className="p-20 text-center text-slate-500">Memuat artikel...</div>;
  if (!post) return <div className="p-20 text-center text-slate-500">Artikel tidak ditemukan.</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <button onClick={onBack} className="text-slate-500 hover:text-slate-900 font-medium flex items-center gap-2 mb-8">
        &larr; Kembali ke Daftar Artikel
      </button>

      <article className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="aspect-[21/9] w-full bg-slate-100">
           <img 
            src={post.imageUrl} 
            alt={post.title} 
            className="w-full h-full object-cover"
            onError={(e) => { (e.target as HTMLImageElement).src = 'https://picsum.photos/1200/600?blur=2'; }}
           />
        </div>
        
        <div className="p-8 md:p-12">
          <div className="flex items-center gap-4 mb-6">
             <button 
               onClick={() => onCategoryClick && onCategoryClick(post.category)}
               className="bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full hover:bg-blue-200 transition-colors cursor-pointer"
               title={`Lihat artikel lainnya di kategori ${post.category}`}
             >
               {post.category}
             </button>
             <span className="text-slate-400 text-sm font-medium">
               {new Date(post.createdAt).toLocaleDateString('id-ID', {day: 'numeric', month: 'long', year: 'numeric'})}
             </span>
             <span className="text-slate-400 text-sm font-medium">
               Penulis: {post.author}
             </span>
          </div>

          <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 mb-8 leading-tight">
            {post.title}
          </h1>

          <div className="prose prose-lg prose-blue max-w-none text-slate-700 whitespace-pre-wrap">
            {post.content}
          </div>
        </div>
      </article>

      {/* Share Section (Static) */}
      <div className="mt-8 border-t border-slate-200 pt-8 flex justify-between items-center">
         <div className="font-bold text-slate-900">Bagikan artikel ini:</div>
         <div className="flex gap-2">
            <button className="bg-slate-100 hover:bg-slate-200 p-2 rounded-full text-slate-600 transition-colors">Copy Link</button>
            <button className="bg-green-100 hover:bg-green-200 p-2 rounded-full text-green-700 transition-colors">WhatsApp</button>
         </div>
      </div>
    </div>
  );
};

export default BlogDetail;