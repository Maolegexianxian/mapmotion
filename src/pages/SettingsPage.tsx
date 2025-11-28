/**
 * 设置页面
 * 应用全局设置和偏好配置
 * 
 * @description
 * 设置页面提供：
 * - 语言和主题设置
 * - 编辑器默认配置
 * - 导出和快捷键设置
 */
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Moon, 
  Sun, 
  Monitor, 
  Globe, 
  ArrowLeft,
  Save,
  Keyboard,
  Download,
  Sliders,
  CheckCircle,
} from 'lucide-react';

import { ROUTES } from '@/routes';
import { useTheme } from '@/contexts/ThemeContext';
import { changeLanguage, getCurrentLanguage, SUPPORTED_LANGUAGES } from '@/locales/i18n';

import type { LanguageCode } from '@/locales/i18n';
import type { Theme } from '@/contexts/ThemeContext';

/** 设置分类 */
const SETTINGS_SECTIONS = [
  { id: 'general', icon: Sliders, label: '通用设置' },
  { id: 'editor', icon: Monitor, label: '编辑器设置' },
  { id: 'export', icon: Download, label: '导出设置' },
  { id: 'shortcuts', icon: Keyboard, label: '快捷键' },
] as const;

export default function SettingsPage() {
  const { t } = useTranslation();
  const { theme, setTheme } = useTheme();
  const currentLang = getCurrentLanguage();
  
  /** 当前选中的设置分类 */
  const [activeSection, setActiveSection] = useState<string>('general');
  
  /** 保存状态提示 */
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  
  /** 编辑器设置 */
  const [editorSettings, setEditorSettings] = useState({
    autoSave: true,
    autoSaveInterval: 30,
    snapToGrid: true,
    showRulers: true,
    defaultDuration: 10,
  });
  
  /** 导出设置 */
  const [exportSettings, setExportSettings] = useState({
    defaultFormat: 'mp4',
    defaultResolution: '1080p',
    includeWatermark: false,
  });

  const handleLanguageChange = (lang: LanguageCode) => {
    changeLanguage(lang);
    showSaveStatus();
  };

  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme);
    showSaveStatus();
  };
  
  const showSaveStatus = () => {
    setSaveStatus('saving');
    setTimeout(() => {
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-[#020204] relative overflow-hidden">
      {/* 背景装饰 */}
      <div className="absolute inset-0 bg-grid opacity-20 pointer-events-none" />
      <div className="absolute top-40 right-0 h-96 w-96 rounded-full bg-primary-600/10 blur-[128px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 h-72 w-72 rounded-full bg-accent-600/10 blur-[96px] pointer-events-none" />

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
              <span>返回</span>
            </Link>
          </div>
          
          {/* 保存状态 */}
          <AnimatePresence>
            {saveStatus !== 'idle' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2 text-sm bg-white/5 px-3 py-1.5 rounded-full border border-white/10 backdrop-blur-sm"
              >
                {saveStatus === 'saving' ? (
                  <>
                    <Save className="h-4 w-4 text-primary-400 animate-pulse" />
                    <span className="text-slate-300">保存中...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 text-success-500" />
                    <span className="text-success-400">已保存</span>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>

      <div className="relative mx-auto max-w-5xl px-4 py-12">
        <div className="mb-12">
          <h1 className="text-3xl font-bold text-white mb-2 tracking-tight text-glow">
            {t('settings.title')}
          </h1>
          <p className="text-slate-400 text-lg">
            自定义您的应用偏好和编辑器行为
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* 侧边导航 */}
          <nav className="lg:w-64 shrink-0">
            <ul className="space-y-1 lg:sticky lg:top-24">
              {SETTINGS_SECTIONS.map((section) => {
                const Icon = section.icon;
                const isActive = activeSection === section.id;
                return (
                  <li key={section.id}>
                    <button
                      onClick={() => setActiveSection(section.id)}
                      className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
                        isActive
                          ? 'bg-primary-600 text-white shadow-glow'
                          : 'text-slate-400 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      <Icon className={`h-5 w-5 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                      {section.label}
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* 设置内容 */}
          <div className="flex-1 space-y-6 min-w-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSection}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                {activeSection === 'general' && (
                  <>
                    {/* 语言设置 */}
                    <SettingsCard
                      icon={Globe}
                      title={t('settings.general.language')}
                      description="选择界面显示语言"
                    >
                      <div className="relative">
                        <select
                          value={currentLang}
                          onChange={(e) => handleLanguageChange(e.target.value as LanguageCode)}
                          className="appearance-none rounded-lg border border-white/10 bg-black/40 px-4 py-2 pr-10 text-sm text-slate-200 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 cursor-pointer hover:bg-white/5 transition-colors min-w-[160px]"
                        >
                          {Object.entries(SUPPORTED_LANGUAGES).map(([code, name]) => (
                            <option key={code} value={code} className="bg-[#18181b]">
                              {name}
                            </option>
                          ))}
                        </select>
                        <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500">
                          <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20">
                            <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                          </svg>
                        </div>
                      </div>
                    </SettingsCard>

                    {/* 主题设置 */}
                    <SettingsCard
                      icon={Monitor}
                      title={t('settings.general.theme')}
                      description="选择应用的外观主题"
                    >
                      <div className="flex gap-2 bg-black/40 p-1 rounded-lg border border-white/10">
                        {(['light', 'dark', 'system'] as const).map((themeOption) => (
                          <button
                            key={themeOption}
                            onClick={() => handleThemeChange(themeOption)}
                            className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-all ${
                              theme === themeOption
                                ? 'bg-primary-600 text-white shadow-sm'
                                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                            }`}
                          >
                            {themeOption === 'light' && <Sun className="h-4 w-4" />}
                            {themeOption === 'dark' && <Moon className="h-4 w-4" />}
                            {themeOption === 'system' && <Monitor className="h-4 w-4" />}
                            {t(`settings.general.themes.${themeOption}`)}
                          </button>
                        ))}
                      </div>
                    </SettingsCard>
                  </>
                )}

                {activeSection === 'editor' && (
                  <>
                    <SettingsCard
                      icon={Save}
                      title="自动保存"
                      description="自动保存您的项目更改"
                    >
                      <div className="flex items-center gap-4">
                        <ToggleSwitch
                          checked={editorSettings.autoSave}
                          onChange={(checked) => {
                            setEditorSettings(s => ({ ...s, autoSave: checked }));
                            showSaveStatus();
                          }}
                        />
                        {editorSettings.autoSave && (
                          <div className="flex items-center gap-2 text-slate-400 bg-black/40 px-3 py-1.5 rounded-lg border border-white/10">
                            <span className="text-sm">每</span>
                            <select
                              value={editorSettings.autoSaveInterval}
                              onChange={(e) => {
                                setEditorSettings(s => ({ ...s, autoSaveInterval: Number(e.target.value) }));
                                showSaveStatus();
                              }}
                              className="bg-transparent text-primary-400 font-medium text-sm focus:outline-none cursor-pointer hover:text-primary-300"
                            >
                              <option value={15} className="bg-[#18181b]">15秒</option>
                              <option value={30} className="bg-[#18181b]">30秒</option>
                              <option value={60} className="bg-[#18181b]">1分钟</option>
                              <option value={300} className="bg-[#18181b]">5分钟</option>
                            </select>
                            <span className="text-sm">保存一次</span>
                          </div>
                        )}
                      </div>
                    </SettingsCard>

                    <SettingsCard
                      icon={Sliders}
                      title="默认项目时长"
                      description="新建项目的默认动画时长"
                    >
                      <div className="flex items-center gap-3 bg-black/40 px-3 py-1.5 rounded-lg border border-white/10">
                        <input
                          type="number"
                          value={editorSettings.defaultDuration}
                          onChange={(e) => {
                            setEditorSettings(s => ({ ...s, defaultDuration: Number(e.target.value) }));
                            showSaveStatus();
                          }}
                          min={5}
                          max={300}
                          className="w-16 bg-transparent text-primary-400 font-medium text-center focus:outline-none"
                        />
                        <span className="text-sm text-slate-400 border-l border-white/10 pl-3">秒</span>
                      </div>
                    </SettingsCard>
                  </>
                )}

                {activeSection === 'export' && (
                  <>
                    <SettingsCard
                      icon={Download}
                      title="默认导出格式"
                      description="导出视频时的默认格式"
                    >
                      <div className="relative">
                        <select
                          value={exportSettings.defaultFormat}
                          onChange={(e) => {
                            setExportSettings(s => ({ ...s, defaultFormat: e.target.value }));
                            showSaveStatus();
                          }}
                          className="appearance-none rounded-lg border border-white/10 bg-black/40 px-4 py-2 pr-10 text-sm text-slate-200 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 cursor-pointer hover:bg-white/5 transition-colors min-w-[160px]"
                        >
                          <option value="mp4" className="bg-[#18181b]">MP4 视频</option>
                          <option value="webm" className="bg-[#18181b]">WebM 视频</option>
                          <option value="gif" className="bg-[#18181b]">GIF 动图</option>
                          <option value="png" className="bg-[#18181b]">PNG 序列</option>
                        </select>
                        <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500">
                          <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20">
                            <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                          </svg>
                        </div>
                      </div>
                    </SettingsCard>

                    <SettingsCard
                      icon={Monitor}
                      title="默认分辨率"
                      description="导出视频的默认分辨率"
                    >
                      <div className="relative">
                        <select
                          value={exportSettings.defaultResolution}
                          onChange={(e) => {
                            setExportSettings(s => ({ ...s, defaultResolution: e.target.value }));
                            showSaveStatus();
                          }}
                          className="appearance-none rounded-lg border border-white/10 bg-black/40 px-4 py-2 pr-10 text-sm text-slate-200 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 cursor-pointer hover:bg-white/5 transition-colors min-w-[160px]"
                        >
                          <option value="720p" className="bg-[#18181b]">720p (1280×720)</option>
                          <option value="1080p" className="bg-[#18181b]">1080p (1920×1080)</option>
                          <option value="2k" className="bg-[#18181b]">2K (2560×1440)</option>
                          <option value="4k" className="bg-[#18181b]">4K (3840×2160)</option>
                        </select>
                        <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500">
                          <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20">
                            <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                          </svg>
                        </div>
                      </div>
                    </SettingsCard>
                  </>
                )}

                {activeSection === 'shortcuts' && (
                  <div className="rounded-2xl border border-white/10 bg-[#0A0A0A] p-6">
                    <div className="flex items-center gap-3 mb-6">
                      <Keyboard className="h-5 w-5 text-primary-500" />
                      <h3 className="font-semibold text-white">常用快捷键</h3>
                    </div>
                    
                    <div className="space-y-1">
                      {[
                        { keys: ['Ctrl', 'S'], action: '保存项目' },
                        { keys: ['Ctrl', 'Z'], action: '撤销' },
                        { keys: ['Ctrl', 'Shift', 'Z'], action: '重做' },
                        { keys: ['Space'], action: '播放/暂停' },
                        { keys: ['Delete'], action: '删除选中' },
                        { keys: ['Ctrl', 'C'], action: '复制' },
                        { keys: ['Ctrl', 'V'], action: '粘贴' },
                        { keys: ['Ctrl', 'A'], action: '全选' },
                      ].map((shortcut, index) => (
                        <div key={index} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0 hover:bg-white/5 px-3 rounded-lg transition-colors">
                          <span className="text-sm text-slate-400">{shortcut.action}</span>
                          <div className="flex items-center gap-1">
                            {shortcut.keys.map((key, i) => (
                              <span key={i}>
                                <kbd className="px-2.5 py-1.5 text-xs font-bold bg-black/40 text-slate-300 rounded-md border border-white/10 shadow-sm min-w-[24px] text-center">
                                  {key}
                                </kbd>
                                {i < shortcut.keys.length - 1 && <span className="mx-1 text-slate-600">+</span>}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

/** 设置卡片组件属性 */
interface SettingsCardProps {
  /** 图标组件 */
  icon: React.ElementType;
  /** 标题 */
  title: string;
  /** 描述 */
  description: string;
  /** 子元素 */
  children: React.ReactNode;
}

/** 设置卡片组件 */
function SettingsCard({ icon: Icon, title, description, children }: SettingsCardProps) {
  return (
    <motion.div 
      className="rounded-2xl border border-white/10 bg-[#0A0A0A] p-6 transition-all hover:border-white/20"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-500/10 border border-primary-500/20">
            <Icon className="h-5 w-5 text-primary-400" />
          </div>
          <div>
            <h3 className="font-medium text-white text-lg">{title}</h3>
            <p className="mt-1 text-sm text-slate-400">{description}</p>
          </div>
        </div>
        <div className="shrink-0 pl-14 sm:pl-0">
          {children}
        </div>
      </div>
    </motion.div>
  );
}

/** 开关组件属性 */
interface ToggleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
}

/** 开关组件 */
function ToggleSwitch({ checked, onChange }: ToggleSwitchProps) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`relative h-7 w-12 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500/50 ${
        checked ? 'bg-primary-600' : 'bg-slate-700'
      }`}
    >
      <span
        className={`absolute top-1 left-1 h-5 w-5 rounded-full bg-white shadow-md transition-transform ${
          checked ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  );
}
