import { Calendar, Clock, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Seo } from '@/components/common/Seo';
import { ROUTES, generatePath } from '@/routes';
import { BLOG_POSTS } from '@/constants/blog';

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-[#020204] relative overflow-hidden text-white">
      <Seo 
        title="MapMotion Blog - Tutorials, Tips & Map Animation Guides" 
        description="Learn how to create cinematic map animations, travel routes, and data visualizations. Expert tutorials for MapMotion and map storytelling."
        keywords={['map animation tutorial', 'travel vlog tips', 'geolayers tutorial', 'video editing guide']}
      />
      
      {/* Background */}
      <div className="absolute inset-0 bg-grid opacity-20 pointer-events-none" />
      <div className="absolute top-0 right-0 h-[500px] w-[500px] rounded-full bg-primary-600/10 blur-[128px] pointer-events-none" />

      <header className="relative z-10 border-b border-white/5 bg-[#020204]/80 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 py-6 flex items-center justify-between">
          <Link to={ROUTES.HOME} className="flex items-center gap-2 text-lg font-bold">
            <div className="h-8 w-8 rounded-lg bg-primary-600 flex items-center justify-center">M</div>
            MapMotion
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-400">
            <Link to={ROUTES.TEMPLATES} className="hover:text-white transition-colors">Templates</Link>
            <Link to={ROUTES.BLOG} className="text-white">Blog</Link>
            <Link to={ROUTES.EDITOR} className="btn-primary px-4 py-2 rounded-full text-xs">Start Creating</Link>
          </nav>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-7xl px-4 py-20">
        <div className="text-center mb-20">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">
            MapMotion <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-accent-400">Insider</span>
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Tutorials, updates, and inspiration for map creators.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {BLOG_POSTS.map((post) => (
            <Link 
              key={post.id} 
              to={generatePath(ROUTES.BLOG_POST, { slug: post.slug })}
              className="group relative flex flex-col rounded-2xl border border-white/10 bg-white/5 overflow-hidden hover:border-primary-500/50 transition-all duration-300 hover:-translate-y-1"
            >
              <div className="aspect-video bg-slate-800 relative overflow-hidden">
                <img 
                  src={post.coverImage} 
                  alt={post.title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#020204] to-transparent opacity-60" />
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-xs font-medium text-white">
                    {post.category}
                  </span>
                </div>
              </div>
              
              <div className="p-6 flex-1 flex flex-col">
                <div className="flex items-center gap-4 text-xs text-slate-500 mb-4 font-mono">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {post.date}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {post.readTime}
                  </span>
                </div>
                
                <h2 className="text-xl font-bold text-white mb-3 line-clamp-2 group-hover:text-primary-400 transition-colors">
                  {post.title}
                </h2>
                <p className="text-slate-400 text-sm line-clamp-3 mb-6 flex-1">
                  {post.excerpt}
                </p>
                
                <div className="flex items-center text-primary-400 text-sm font-medium mt-auto">
                  Read Article <ChevronRight className="h-4 w-4 ml-1 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
