import React, { useEffect, useState } from 'react';
import { BlogPost } from '../types';
import { StoreService } from '../services/store';

interface BlogProps {
  onNavigate: (page: string, id?: string) => void;
  onBack: () => void;
  initialCategory?: string;
}

const Blog: React.FC<BlogProps> = ({ onNavigate, onBack, initialCategory = 'Semua' }) => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);

  useEffect(() => {
    // Update local state if prop changes (e.g. navigation from detail page)
    setSelectedCategory(initialCategory);
  }, [initialCategory]);

  useEffect(() => {
    const loadPosts = async () => {
      setLoading(true);
      const data = await StoreService.getBlogPosts();
      setPosts(data);
      setLoading(false);
    };
    loadPosts();
    window.scrollTo(0, 0);
  }, []);

  // Extract unique categories from posts
  const categories = ['Semua', ...Array.from(new Set(posts.map(p => p.category)))];

  // Filter posts
  const filteredPosts = selectedCategory === 'Semua' 
    ? posts 
    : posts.filter(p => p.category === selectedCategory);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <button onClick={onBack} className="text-slate-500 hover:text-slate-900 font-medium flex items-center gap-2 mb-4">
          &larr; Kembali
        </button>
        <h1 className="text-4xl font-extrabold text-slate-900 mb-4">Blog & Edukasi Properti</h1>
        <p className="text-slate-500 max-w-2xl">
          Temukan tips, panduan, dan informasi terbaru seputar investasi properti, legalitas, dan gaya hidup hunian.
        </p>
      </div>

      {/* Category Filter */}
      {!loading && (
        <div className="mb-10 overflow-x-auto pb-2 hide-scrollbar">
          <div className="flex gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all border ${
                  selectedCategory === cat
                    ? 'bg-blue-800 text-white border-blue-800 shadow-md transform scale-105'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-blue-50 hover:border-blue-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-20 text-slate-400">Memuat artikel...</div>
      ) : (
        <>
          {filteredPosts.length === 0 ? (
             <div className="text-center py-16 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
                <p className="text-slate-500 font-medium">Belum ada artikel di kategori ini.</p>
             </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredPosts.map(post => (
                <div 
                  key={post.id} 
                  className="bg-white rounded-xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-lg transition-all cursor-pointer group flex flex-col h-full"
                  onClick={() => onNavigate('blog-detail', post.id)}
                >
                  <div className="aspect-[16/9] w-full overflow-hidden bg-slate-100 relative">
                    <img 
                      src={post.imageUrl} 
                      alt={post.title} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      onError={(e) => { (e.target as HTMLImageElement).src = 'https://picsum.photos/400/300?blur=2'; }}
                    />
                    <div className="absolute top-4 left-4">
                      <span className="bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
                        {post.category}
                      </span>
                    </div>
                  </div>
                  <div className="p-6 flex flex-col flex-grow">
                    <div className="text-xs text-slate-400 font-bold mb-2 uppercase tracking-wide">
                      {new Date(post.createdAt).toLocaleDateString('id-ID', {day: 'numeric', month: 'long', year: 'numeric'})} • {post.author}
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-3 line-clamp-2 group-hover:text-blue-700 transition-colors">
                      {post.title}
                    </h3>
                    <p className="text-slate-500 text-sm line-clamp-3 mb-4 flex-grow">
                      {post.excerpt}
                    </p>
                    <div className="text-blue-600 font-bold text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
                      Baca Selengkapnya &rarr;
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Blog;