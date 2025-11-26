/**
 * 编辑器顶部工具栏组件
 */
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Save,
  Download,
  Undo2,
  Redo2,
  Play,
  Pause,
  Square,
  Settings,
  HelpCircle,
  ChevronDown,
} from 'lucide-react';

import { ROUTES } from '@/routes';
import { useProjectStore } from '@/stores/projectStore';

/**
 * EditorHeader - 编辑器顶部工具栏
 */
export function EditorHeader() {
  const { t } = useTranslation();
  const { currentProject, saveProject, hasUnsavedChanges } = useProjectStore();

  return (
    <header className="flex h-12 items-center justify-between border-b border-editor-border bg-editor-sidebar px-4">
      {/* 左侧 - Logo 和项目名称 */}
      <div className="flex items-center gap-4">
        <Link to={ROUTES.HOME} className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded bg-primary-600">
            <span className="text-sm font-bold text-white">M</span>
          </div>
        </Link>

        {/* 项目名称 */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-slate-200">
            {currentProject?.meta.title || t('project.untitled')}
          </span>
          {hasUnsavedChanges && (
            <span className="text-xs text-warning-400">●</span>
          )}
          <ChevronDown className="h-4 w-4 text-slate-400" />
        </div>
      </div>

      {/* 中间 - 播放控制 */}
      <div className="flex items-center gap-1">
        <button className="btn-icon text-slate-300 hover:text-white" title={t('common.play')}>
          <Play className="h-4 w-4" />
        </button>
        <button className="btn-icon text-slate-300 hover:text-white" title={t('common.pause')}>
          <Pause className="h-4 w-4" />
        </button>
        <button className="btn-icon text-slate-300 hover:text-white" title={t('common.stop')}>
          <Square className="h-4 w-4" />
        </button>
      </div>

      {/* 右侧 - 工具按钮 */}
      <div className="flex items-center gap-1">
        <button className="btn-icon text-slate-300 hover:text-white" title={t('common.undo')}>
          <Undo2 className="h-4 w-4" />
        </button>
        <button className="btn-icon text-slate-300 hover:text-white" title={t('common.redo')}>
          <Redo2 className="h-4 w-4" />
        </button>

        <div className="mx-2 h-6 w-px bg-editor-border" />

        <button
          onClick={() => saveProject()}
          className="btn-icon text-slate-300 hover:text-white"
          title={t('common.save')}
        >
          <Save className="h-4 w-4" />
        </button>

        <button
          className="flex items-center gap-2 rounded-lg bg-primary-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-primary-700"
        >
          <Download className="h-4 w-4" />
          {t('common.export')}
        </button>

        <div className="mx-2 h-6 w-px bg-editor-border" />

        <button className="btn-icon text-slate-300 hover:text-white" title={t('common.settings')}>
          <Settings className="h-4 w-4" />
        </button>
        <button className="btn-icon text-slate-300 hover:text-white" title={t('common.help')}>
          <HelpCircle className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}

export default EditorHeader;
