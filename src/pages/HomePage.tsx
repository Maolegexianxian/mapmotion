/**
 * 首页组件
 * 展示产品介绍和快速开始入口
 */
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowRight, Map, Route, Tag, Download, Play } from 'lucide-react';

import { ROUTES } from '@/routes';

/**
 * HomePage - 首页组件
 */
export default function HomePage() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-white dark:bg-editor-bg">
      {/* 导航栏 */}
      <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-slate-200 dark:border-editor-border">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link to={ROUTES.HOME} className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600">
              <span className="text-lg font-bold text-white">M</span>
            </div>
            <span className="text-lg font-semibold text-slate-900 dark:text-white">
              MapMotion
            </span>
          </Link>

          {/* 导航链接 */}
          <nav className="hidden items-center gap-6 md:flex">
            <Link
              to={ROUTES.TEMPLATES}
              className="text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            >
              {t('nav.templates')}
            </Link>
            <Link
              to={ROUTES.PROJECTS}
              className="text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            >
              {t('nav.projects')}
            </Link>
          </nav>

          {/* 操作按钮 */}
          <div className="flex items-center gap-3">
            <Link to={ROUTES.EDITOR} className="btn-primary">
              {t('home.hero.cta')}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero 区域 */}
      <section className="relative overflow-hidden pt-32 pb-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            {/* 标题 */}
            <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl md:text-6xl dark:text-white">
              <span className="block">{t('home.hero.title')}</span>
            </h1>

            {/* 副标题 */}
            <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-600 dark:text-slate-400">
              {t('home.hero.subtitle')}
            </p>

            {/* CTA 按钮 */}
            <div className="mt-10 flex items-center justify-center gap-4">
              <Link to={ROUTES.EDITOR} className="btn-primary text-base px-8 py-3">
                <Play className="h-5 w-5" />
                {t('home.hero.cta')}
              </Link>
              <Link to={ROUTES.TEMPLATES} className="btn-outline text-base px-8 py-3">
                {t('home.hero.secondary')}
              </Link>
            </div>
          </div>

          {/* 预览图 */}
          <div className="mt-16 rounded-xl border border-slate-200 bg-slate-100 shadow-2xl dark:border-editor-border dark:bg-editor-surface">
            <div className="aspect-video w-full rounded-xl bg-gradient-to-br from-primary-500/20 to-accent-500/20 flex items-center justify-center">
              <div className="text-center">
                <Map className="mx-auto h-16 w-16 text-primary-500 opacity-50" />
                <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
                  编辑器预览
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 功能特性 */}
      <section className="py-20 bg-slate-50 dark:bg-editor-sidebar">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
              {t('home.features.title')}
            </h2>
          </div>

          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {/* 底图样式 */}
            <FeatureCard
              icon={Map}
              title={t('home.features.mapStyles.title')}
              description={t('home.features.mapStyles.description')}
            />
            {/* 路线动画 */}
            <FeatureCard
              icon={Route}
              title={t('home.features.routeAnimation.title')}
              description={t('home.features.routeAnimation.description')}
            />
            {/* 智能标签 */}
            <FeatureCard
              icon={Tag}
              title={t('home.features.labels.title')}
              description={t('home.features.labels.description')}
            />
            {/* 高质量导出 */}
            <FeatureCard
              icon={Download}
              title={t('home.features.export.title')}
              description={t('home.features.export.description')}
            />
          </div>
        </div>
      </section>

      {/* 页脚 */}
      <footer className="border-t border-slate-200 py-12 dark:border-editor-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded bg-primary-600">
                <span className="text-xs font-bold text-white">M</span>
              </div>
              <span className="text-sm text-slate-500 dark:text-slate-400">
                © 2024 MapMotion. All rights reserved.
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

/** 功能卡片属性 */
interface FeatureCardProps {
  icon: typeof Map;
  title: string;
  description: string;
}

/**
 * FeatureCard - 功能特性卡片
 */
function FeatureCard({ icon: Icon, title, description }: FeatureCardProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-editor-border dark:bg-editor-surface">
      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary-100 dark:bg-primary-900/30">
        <Icon className="h-6 w-6 text-primary-600 dark:text-primary-400" />
      </div>
      <h3 className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">
        {title}
      </h3>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
        {description}
      </p>
    </div>
  );
}
