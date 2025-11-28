import { useParams, Link, Navigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, Share2, Tag } from 'lucide-react';
import { Seo } from '@/components/common/Seo';
import { BLOG_POSTS } from '@/constants/blog';
import { ROUTES } from '@/routes';

export default function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const post = BLOG_POSTS.find(p => p.slug === slug);

  if (!post) {
    return <Navigate to={ROUTES.BLOG} replace />;
  }

  return (
    <div className="min-h-screen bg-[#020204] text-slate-300 selection:bg-primary-500/30">
      <Seo 
        title={post.title} 
        description={post.excerpt}
        keywords={post.tags}
        type="article"
        image={post.coverImage}
      />

      <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#020204]/80 backdrop-blur-xl">
        <div className="mx-auto max-w-4xl px-4 h-16 flex items-center">
          <Link to={ROUTES.BLOG} className="flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-white transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Back to Blog
          </Link>
        </div>
      </header>

      <article className="pt-32 pb-20">
        <div className="mx-auto max-w-4xl px-4">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-2 mb-6">
              <span className="px-3 py-1 rounded-full bg-primary-500/10 border border-primary-500/20 text-primary-400 text-xs font-bold uppercase tracking-wider">
                {post.category}
              </span>
            </div>
            
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-6 leading-tight">
              {post.title}
            </h1>
            
            <div className="flex items-center justify-center gap-6 text-sm text-slate-500 font-mono">
              <span className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {post.date}
              </span>
              <span className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                {post.readTime}
              </span>
            </div>
          </div>

          {/* Cover Image */}
          <div className="aspect-video w-full rounded-2xl overflow-hidden mb-16 border border-white/10 shadow-2xl">
            <img 
              src={post.coverImage} 
              alt={post.title}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Content */}
          <div className="prose prose-invert prose-lg mx-auto max-w-none">
            <p className="lead text-xl text-slate-300 mb-8 font-medium border-l-4 border-primary-500 pl-6 italic">
              {post.excerpt}
            </p>
            
            {/* Render HTML safely - In a real app, use a library like dompurify */}
            <div dangerouslySetInnerHTML={{ __html: post.content }} />
          </div>

          {/* Tags & Share */}
          <div className="mt-16 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex flex-wrap gap-2">
              {post.tags.map(tag => (
                <span key={tag} className="flex items-center gap-1 px-3 py-1 rounded-md bg-white/5 text-sm text-slate-400">
                  <Tag className="h-3 w-3" />
                  {tag}
                </span>
              ))}
            </div>
            
            <button className="flex items-center gap-2 text-sm font-bold text-primary-400 hover:text-primary-300 transition-colors">
              <Share2 className="h-4 w-4" />
              Share Article
            </button>
          </div>
        </div>
      </article>
    </div>
  );
}
