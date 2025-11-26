/**
 * 设置页面
 */
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Moon, Sun, Monitor, Globe } from 'lucide-react';

import { ROUTES } from '@/routes';
import { useTheme } from '@/contexts/ThemeContext';
import { changeLanguage, getCurrentLanguage, SUPPORTED_LANGUAGES } from '@/locales/i18n';

import type { LanguageCode } from '@/locales/i18n';
import type { Theme } from '@/contexts/ThemeContext';

export default function SettingsPage() {
  const { t } = useTranslation();
  const { theme, setTheme } = useTheme();
  const currentLang = getCurrentLanguage();

  const handleLanguageChange = (lang: LanguageCode) => {
    changeLanguage(lang);
  };

  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-editor-bg">
      {/* 顶部导航 */}
      <header className="border-b border-slate-200 bg-white dark:border-editor-border dark:bg-editor-sidebar">
        <div className="mx-auto flex h-16 max-w-7xl items-center px-4">
          <Link to={ROUTES.HOME} className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600">
              <span className="text-lg font-bold text-white">M</span>
            </div>
            <span className="text-lg font-semibold text-slate-900 dark:text-white">MapMotion</span>
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t('settings.title')}</h1>

        {/* 通用设置 */}
        <section className="mt-8">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            {t('settings.general.title')}
          </h2>

          <div className="mt-4 space-y-6">
            {/* 语言设置 */}
            <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-editor-border dark:bg-editor-surface">
              <div className="flex items-center gap-3">
                <Globe className="h-5 w-5 text-slate-500" />
                <div className="flex-1">
                  <p className="font-medium text-slate-900 dark:text-white">
                    {t('settings.general.language')}
                  </p>
                </div>
                <select
                  value={currentLang}
                  onChange={(e) => handleLanguageChange(e.target.value as LanguageCode)}
                  className="select w-40"
                >
                  {Object.entries(SUPPORTED_LANGUAGES).map(([code, name]) => (
                    <option key={code} value={code}>
                      {name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* 主题设置 */}
            <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-editor-border dark:bg-editor-surface">
              <div className="flex items-center gap-3 mb-4">
                <Monitor className="h-5 w-5 text-slate-500" />
                <p className="font-medium text-slate-900 dark:text-white">
                  {t('settings.general.theme')}
                </p>
              </div>
              <div className="flex gap-2">
                {(['light', 'dark', 'system'] as const).map((themeOption) => (
                  <button
                    key={themeOption}
                    onClick={() => handleThemeChange(themeOption)}
                    className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                      theme === themeOption
                        ? 'bg-primary-600 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {themeOption === 'light' && <Sun className="h-4 w-4" />}
                    {themeOption === 'dark' && <Moon className="h-4 w-4" />}
                    {themeOption === 'system' && <Monitor className="h-4 w-4" />}
                    {t(`settings.general.themes.${themeOption}`)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
