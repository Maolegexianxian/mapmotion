/**
 * 404 页面
 */
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Home, ArrowLeft } from 'lucide-react';

import { ROUTES } from '@/routes';

export default function NotFoundPage() {
  const { t } = useTranslation();

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-editor-bg">
      <div className="text-center">
        {/* 404 数字 */}
        <h1 className="text-9xl font-bold text-slate-200 dark:text-slate-700">404</h1>

        {/* 标题 */}
        <h2 className="mt-4 text-2xl font-semibold text-slate-900 dark:text-white">
          页面未找到
        </h2>

        {/* 描述 */}
        <p className="mt-2 text-slate-600 dark:text-slate-400">
          抱歉，您访问的页面不存在或已被移除
        </p>

        {/* 操作按钮 */}
        <div className="mt-8 flex items-center justify-center gap-4">
          <button
            onClick={() => window.history.back()}
            className="btn-secondary"
          >
            <ArrowLeft className="h-4 w-4" />
            {t('common.back')}
          </button>
          <Link to={ROUTES.HOME} className="btn-primary">
            <Home className="h-4 w-4" />
            {t('nav.home')}
          </Link>
        </div>
      </div>
    </div>
  );
}
