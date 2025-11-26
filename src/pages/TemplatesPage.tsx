/**
 * 模板库页面
 */
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Search, Eye, Play } from 'lucide-react';

import { ROUTES } from '@/routes';

/** 模板分类 */
const TEMPLATE_CATEGORIES = ['all', 'route', 'city', 'event', 'data', 'brand'] as const;

/** 模板数据 */
const TEMPLATES = [
  { id: '1', name: '旅行路线', category: 'route', thumbnail: '' },
  { id: '2', name: '城市介绍', category: 'city', thumbnail: '' },
  { id: '3', name: '事件追踪', category: 'event', thumbnail: '' },
  { id: '4', name: '数据可视化', category: 'data', thumbnail: '' },
];

export default function TemplatesPage() {
  const { t } = useTranslation();
  const [category, setCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTemplates = TEMPLATES.filter((tmpl) => {
    const matchCategory = category === 'all' || tmpl.category === category;
    const matchSearch = tmpl.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-editor-bg">
      {/* 顶部导航 */}
      <header className="border-b border-slate-200 bg-white dark:border-editor-border dark:bg-editor-sidebar">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          <Link to={ROUTES.HOME} className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600">
              <span className="text-lg font-bold text-white">M</span>
            </div>
            <span className="text-lg font-semibold text-slate-900 dark:text-white">MapMotion</span>
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t('nav.templates')}</h1>

        {/* 筛选栏 */}
        <div className="mt-6 flex flex-wrap items-center gap-4">
          {/* 搜索框 */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder={t('common.search')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input pl-10"
            />
          </div>

          {/* 分类按钮 */}
          <div className="flex gap-2">
            {TEMPLATE_CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  category === cat
                    ? 'bg-primary-600 text-white'
                    : 'bg-white text-slate-600 hover:bg-slate-100 dark:bg-editor-surface dark:text-slate-300'
                }`}
              >
                {t(`template.categories.${cat}`)}
              </button>
            ))}
          </div>
        </div>

        {/* 模板列表 */}
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredTemplates.map((tmpl) => (
            <div
              key={tmpl.id}
              className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-editor-border dark:bg-editor-surface"
            >
              {/* 缩略图 */}
              <div className="aspect-video bg-gradient-to-br from-primary-500/20 to-accent-500/20">
                <div className="flex h-full items-center justify-center">
                  <Play className="h-12 w-12 text-primary-500 opacity-50" />
                </div>
              </div>

              {/* 悬停操作 */}
              <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                <button className="btn-primary">
                  <Play className="h-4 w-4" />
                  {t('template.useTemplate')}
                </button>
                <button className="btn-secondary">
                  <Eye className="h-4 w-4" />
                </button>
              </div>

              {/* 信息 */}
              <div className="p-4">
                <h3 className="font-medium text-slate-900 dark:text-white">{tmpl.name}</h3>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  {t(`template.categories.${tmpl.category}`)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
