/**
 * 模板库页面
 * 展示预设模板供用户选择使用
 */
import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  ArrowLeft,
  Map,
  Play,
  Star
} from 'lucide-react';

import { ROUTES } from '@/routes';
import { Seo } from '@/components/common/Seo';
import { TEMPLATES, TEMPLATE_CATEGORIES } from '@/constants/templates';
import { TemplateCard } from '@/components/common/TemplateCard';

export default function TemplatesPage() {
  useTranslation(); // 预留国际化钩子
  const navigate = useNavigate();
  const [category, setCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  /** 筛选后的模板列表 */
  const filteredTemplates = useMemo(() => {
    return TEMPLATES.filter((tmpl) => {
      const matchCategory = category === 'all' || tmpl.category === category;
      const matchSearch = tmpl.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tmpl.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCategory && matchSearch;
    });
  }, [category, searchQuery]);

  /** 精选模板 */
  const featuredTemplates = useMemo(() => {
    return TEMPLATES.filter(t => t.featured);
  }, []);

  /** 生成模板列表的结构化数据 (JSON-LD) */
  const templatesStructuredData = useMemo(() => {
    return {
      "@context": "https://schema.org",
      "@type": "ItemList",
      "itemListElement": TEMPLATES.map((template, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "item": {
          "@type": "CreativeWork",
          "name": template.name,
          "description": template.description,
          "image": template.thumbnail || "https://mapmotion.app/default-template.jpg",
          "url": `https://mapmotion.app/templates/${template.id}`
        }
      }))
    };
  }, []);

  /** 使用模板 */
  const handleUseTemplate = (templateId: string) => {
    navigate(`${ROUTES.EDITOR}?template=${templateId}`);
  };

  return (
    <div className="min-h-screen bg-[#020204] relative overflow-hidden">
      <Seo 
        title="Map Animation Templates Library - Travel, City & Data Visualization" 
        description="Browse our collection of professional 3D map animation templates. Create cinematic routes, city guides, and news map graphics instantly. No design skills needed."
        keywords={['map templates', 'video templates', 'travel intro', 'route animation', 'news map graphics', '3d terrain maps']}
        structuredData={templatesStructuredData}
      />
      {/* 背景装饰 */}
      <div className="absolute inset-0 bg-grid opacity-20 pointer-events-none" />
      <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-primary-600/20 blur-[128px] pointer-events-none" />
      <div className="absolute top-40 -left-20 h-72 w-72 rounded-full bg-accent-600/10 blur-[96px] pointer-events-none" />

      {/* 顶部导航 */}
      <header className="sticky top-0 z-50 border-b border-white/5 bg-[#020204]/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          <div className="flex items-center gap-6">
            <Link to={ROUTES.HOME} className="flex items-center gap-2 group">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary-600 to-accent-600 shadow-glow transition-transform group-hover:scale-105">
                <span className="text-lg font-bold text-white">M</span>
              </div>
              <span className="text-lg font-semibold text-white tracking-tight">MapMotion</span>
            </Link>
            
            <div className="h-6 w-px bg-white/10" />
            
            <Link 
              to={ROUTES.HOME} 
              className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-medium"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>返回首页</span>
            </Link>
          </div>
          
          <Link to={ROUTES.EDITOR} className="btn-primary group">
            <Play className="h-4 w-4 fill-current group-hover:scale-110 transition-transform" />
            <span className="ml-1">New Project</span>
          </Link>
        </div>
      </header>

      <main className="relative mx-auto max-w-7xl px-4 py-12">
        {/* 页面标题 */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-white mb-4 tracking-tight text-glow">
            Templates Library
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Choose a professionally designed template to jumpstart your creation, or start from a blank canvas.
          </p>
        </div>

        {/* 精选模板 */}
        <section className="mb-16">
          <div className="flex items-center gap-2 mb-8">
            <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
            <h2 className="text-xl font-semibold text-white">Featured</h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featuredTemplates.map((tmpl) => (
              <TemplateCard 
                key={tmpl.id} 
                template={tmpl} 
                onUse={() => handleUseTemplate(tmpl.id)}
              />
            ))}
          </div>
        </section>

        {/* 筛选栏 */}
        <div className="sticky top-20 z-40 mb-8 rounded-2xl border border-white/10 bg-[#0A0A0A]/80 p-2 backdrop-blur-xl shadow-2xl flex flex-col md:flex-row items-center gap-4">
          {/* 搜索框 */}
          <div className="relative w-full md:w-64 group">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500 group-focus-within:text-primary-500 transition-colors" />
            <input
              type="text"
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-transparent bg-white/5 py-2 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:border-primary-500/50 focus:bg-white/10 focus:outline-none focus:ring-1 focus:ring-primary-500/20 transition-all"
            />
          </div>

          {/* 分类按钮 */}
          <div className="flex flex-1 overflow-x-auto pb-2 md:pb-0 gap-1 md:gap-2 w-full custom-scrollbar">
            {TEMPLATE_CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const isActive = category === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setCategory(cat.id)}
                  className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/20'
                      : 'text-slate-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <Icon className={`h-4 w-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* 全部模板 */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              {category === 'all' ? 'All Templates' : TEMPLATE_CATEGORIES.find(c => c.id === category)?.label}
            </h2>
            <span className="text-sm text-slate-500 border border-white/5 px-2 py-0.5 rounded bg-white/5">
              {filteredTemplates.length}
            </span>
          </div>
          
          <AnimatePresence mode="popLayout">
            <motion.div 
              className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
              layout
            >
              {filteredTemplates.map((tmpl) => (
                <TemplateCard 
                  key={tmpl.id} 
                  template={tmpl} 
                  onUse={() => handleUseTemplate(tmpl.id)}
                />
              ))}
            </motion.div>
          </AnimatePresence>

          {filteredTemplates.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 rounded-2xl border border-dashed border-white/10 bg-white/5">
              <div className="h-16 w-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                <Map className="h-8 w-8 text-slate-600" />
              </div>
              <h3 className="text-lg font-medium text-slate-300">No templates found</h3>
              <p className="mt-2 text-slate-500">
                Try adjusting your search or category filter.
              </p>
              <button 
                onClick={() => { setCategory('all'); setSearchQuery(''); }}
                className="mt-6 text-sm font-medium text-primary-400 hover:text-primary-300 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

// Removed local TemplateCard
// ...

