/**
 * 编辑器顶部工具栏组件
 * 提供项目管理、播放控制和导出功能
 * 
 * @description
 * 编辑器头部采用简洁设计：
 * - 左侧：Logo和项目信息
 * - 中间：播放控制（核心交互）
 * - 右侧：保存、导出和设置
 */
import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Save,
  Download,
  Undo2,
  Redo2,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Settings,
  HelpCircle,
  ChevronDown,
  Check,
  Clock,
  Share2,
  Keyboard,
  Repeat,
  Home,
} from 'lucide-react';

import { ROUTES } from '@/routes';
import { useProjectStore } from '@/stores/projectStore';
import { useTimelineStore } from '@/stores/timelineStore';
import { useEditorStore } from '@/stores/editorStore';

/**
 * EditorHeader - 编辑器顶部工具栏
 * 
 * @description
 * 简化的顶部工具栏，突出核心功能：
 * - 项目保存状态指示
 * - 居中的播放控制
 * - 一键导出入口
 */
export function EditorHeader() {
  const { t } = useTranslation();
  
  /** 项目状态 */
  const { currentProject, saveProject, hasUnsavedChanges } = useProjectStore();
  
  /** 时间线状态 */
  const { 
    isPlaying, 
    play, 
    pause, 
    goToStart,
    goToEnd,
    loopMode,
    setLoopMode,
    currentTime,
    duration,
  } = useTimelineStore();
  
  /** 编辑器状态 */
  const { undo, redo } = useEditorStore();
  
  /** 保存状态 */
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  /**
   * 处理保存操作
   */
  const handleSave = useCallback(async () => {
    setSaveStatus('saving');
    await saveProject();
    setSaveStatus('saved');
    // 2秒后重置状态
    setTimeout(() => setSaveStatus('idle'), 2000);
  }, [saveProject]);

  /**
   * 处理播放/暂停切换
   */
  const handlePlayPause = useCallback(() => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  }, [isPlaying, play, pause]);

  /**
   * 格式化时间显示
   */
  const formatTime = useCallback((ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }, []);

  return (
    <header className="flex h-12 items-center justify-between border-b border-white/5 bg-[#0a0a0b] px-3 z-20 relative">
      {/* 左侧 - Logo 和项目信息 */}
      <div className="flex items-center gap-3">
        {/* 返回首页 */}
        <Link 
          to={ROUTES.HOME} 
          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-white/5 hover:text-white transition-colors"
          title={t('nav.home')}
        >
          <Home className="h-4 w-4" />
        </Link>
        
        {/* 分隔线 */}
        <div className="h-5 w-px bg-white/10" />

        {/* 项目名称和状态 */}
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 rounded-md px-2 py-1 hover:bg-white/5 transition-colors group">
            <span className="text-sm font-medium text-slate-200 group-hover:text-white max-w-[200px] truncate">
              {currentProject?.meta.title || t('project.untitled')}
            </span>
            <ChevronDown className="h-3 w-3 text-slate-500" />
          </button>
          
          {/* 保存状态指示器 */}
          <AnimatePresence mode="wait">
            {saveStatus === 'saving' && (
              <motion.div
                key="saving"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex items-center gap-1 text-slate-400"
              >
                <Clock className="h-3 w-3 animate-pulse" />
                <span className="text-xs">{t('common.saving')}</span>
              </motion.div>
            )}
            {saveStatus === 'saved' && (
              <motion.div
                key="saved"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex items-center gap-1 text-emerald-400"
              >
                <Check className="h-3 w-3" />
                <span className="text-xs">{t('common.saved')}</span>
              </motion.div>
            )}
            {saveStatus === 'idle' && hasUnsavedChanges && (
              <motion.div
                key="unsaved"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex h-2 w-2 rounded-full bg-amber-500 shadow-[0_0_6px_rgba(245,158,11,0.5)]"
                title={t('header.unsavedChanges')}
              />
            )}
          </AnimatePresence>
        </div>
        
        {/* 撤销/重做 */}
        <div className="flex items-center gap-0.5 ml-2">
          <button
            onClick={undo}
            className="flex h-7 w-7 items-center justify-center rounded-md text-slate-400 hover:bg-white/5 hover:text-white transition-colors"
            title={`${t('common.undo')} (Ctrl+Z)`}
          >
            <Undo2 className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={redo}
            className="flex h-7 w-7 items-center justify-center rounded-md text-slate-400 hover:bg-white/5 hover:text-white transition-colors"
            title={`${t('common.redo')} (Ctrl+Shift+Z)`}
          >
            <Redo2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* 中间 - 播放控制（核心交互区） */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2 py-1 backdrop-blur-sm">
          {/* 跳到开头 */}
          <button
            onClick={goToStart}
            className="flex h-7 w-7 items-center justify-center rounded-full text-slate-400 hover:bg-white/10 hover:text-white transition-colors"
            title={t('timeline.skipBack')}
          >
            <SkipBack className="h-3.5 w-3.5" />
          </button>
          
          {/* 播放/暂停按钮 - 突出显示 */}
          <button
            onClick={handlePlayPause}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-600 text-white shadow-lg shadow-primary-600/30 hover:bg-primary-500 hover:shadow-primary-600/40 transition-all hover:scale-105 active:scale-95"
            title={isPlaying ? t('common.pause') : t('common.play')}
          >
            {isPlaying ? (
              <Pause className="h-4 w-4 fill-current" />
            ) : (
              <Play className="h-4 w-4 fill-current ml-0.5" />
            )}
          </button>
          
          {/* 跳到结尾 */}
          <button
            onClick={goToEnd}
            className="flex h-7 w-7 items-center justify-center rounded-full text-slate-400 hover:bg-white/10 hover:text-white transition-colors"
            title={t('timeline.skipForward')}
          >
            <SkipForward className="h-3.5 w-3.5" />
          </button>
          
          {/* 分隔线 */}
          <div className="h-4 w-px bg-white/10 mx-1" />
          
          {/* 时间显示 */}
          <div className="flex items-center gap-1 px-2 font-mono text-xs">
            <span className="text-primary-400 font-medium">{formatTime(currentTime)}</span>
            <span className="text-slate-600">/</span>
            <span className="text-slate-500">{formatTime(duration)}</span>
          </div>
          
          {/* 循环按钮 */}
          <button
            onClick={() => setLoopMode(loopMode === 'loop' ? 'none' : 'loop')}
            className={`flex h-7 w-7 items-center justify-center rounded-full transition-colors ${
              loopMode === 'loop' 
                ? 'text-primary-400 bg-primary-400/10' 
                : 'text-slate-400 hover:bg-white/10 hover:text-white'
            }`}
            title={t('timeline.loop')}
          >
            <Repeat className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* 右侧 - 保存、导出和设置 */}
      <div className="flex items-center gap-2">
        {/* 保存按钮 */}
        <button
          onClick={handleSave}
          disabled={saveStatus === 'saving'}
          className="flex h-8 items-center gap-1.5 px-3 rounded-lg text-slate-300 hover:bg-white/5 hover:text-white transition-colors disabled:opacity-50"
          title={`${t('common.save')} (Ctrl+S)`}
        >
          <Save className="h-3.5 w-3.5" />
          <span className="text-sm">{t('common.save')}</span>
        </button>
        
        {/* 分享按钮 */}
        <button
          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-white/5 hover:text-white transition-colors"
          title={t('project.shareProject')}
        >
          <Share2 className="h-4 w-4" />
        </button>

        {/* 导出按钮 - 主要CTA */}
        <button
          className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-primary-600 to-primary-500 px-4 py-1.5 text-sm font-medium text-white shadow-lg shadow-primary-600/25 hover:shadow-primary-600/35 transition-all hover:-translate-y-0.5 active:translate-y-0"
        >
          <Download className="h-4 w-4" />
          <span>{t('common.export')}</span>
        </button>

        {/* 分隔线 */}
        <div className="h-5 w-px bg-white/10 mx-1" />

        {/* 快捷键提示 */}
        <button
          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-white/5 hover:text-white transition-colors"
          title={t('settings.shortcuts.title')}
        >
          <Keyboard className="h-4 w-4" />
        </button>
        
        {/* 设置 */}
        <button
          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-white/5 hover:text-white transition-colors"
          title={t('common.settings')}
        >
          <Settings className="h-4 w-4" />
        </button>
        
        {/* 帮助 */}
        <button
          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-white/5 hover:text-white transition-colors"
          title={t('common.help')}
        >
          <HelpCircle className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}

export default EditorHeader;
