/**
 * 编辑器侧边栏组件
 */
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Layers, FolderOpen, Search, Plus, ChevronLeft, ChevronRight } from 'lucide-react';

/** 侧边栏属性 */
interface EditorSidebarProps {
  position: 'left' | 'right';
  isCollapsed: boolean;
  onToggle: () => void;
}

/** 标签页类型 */
type TabType = 'layers' | 'assets';

export function EditorSidebar({ position, isCollapsed, onToggle }: EditorSidebarProps) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<TabType>('layers');

  if (isCollapsed) {
    return (
      <div className="flex w-10 flex-col items-center border-r border-editor-border bg-editor-sidebar py-2">
        <button onClick={onToggle} className="btn-icon text-slate-400 hover:text-white">
          {position === 'left' ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>
    );
  }

  return (
    <div className="flex w-64 flex-col border-r border-editor-border bg-editor-sidebar">
      {/* 标签栏 */}
      <div className="flex border-b border-editor-border">
        <button
          onClick={() => setActiveTab('layers')}
          className={`flex flex-1 items-center justify-center gap-2 py-2 text-sm font-medium transition-colors ${
            activeTab === 'layers'
              ? 'border-b-2 border-primary-500 text-primary-400'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Layers className="h-4 w-4" />
          {t('editor.panels.layers')}
        </button>
        <button
          onClick={() => setActiveTab('assets')}
          className={`flex flex-1 items-center justify-center gap-2 py-2 text-sm font-medium transition-colors ${
            activeTab === 'assets'
              ? 'border-b-2 border-primary-500 text-primary-400'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <FolderOpen className="h-4 w-4" />
          {t('editor.panels.assets')}
        </button>
      </div>

      {/* 搜索栏 */}
      <div className="p-2">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder={t('common.search')}
            className="w-full rounded bg-editor-panel py-1.5 pl-8 pr-3 text-sm text-slate-300 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
          />
        </div>
      </div>

      {/* 内容区域 */}
      <div className="flex-1 overflow-y-auto p-2">
        {activeTab === 'layers' ? <LayersPanel /> : <AssetsPanel />}
      </div>

      {/* 底部工具栏 */}
      <div className="flex items-center justify-between border-t border-editor-border p-2">
        <button className="btn-icon text-slate-400 hover:text-white">
          <Plus className="h-4 w-4" />
        </button>
        <button onClick={onToggle} className="btn-icon text-slate-400 hover:text-white">
          <ChevronLeft className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

/** 图层面板 */
function LayersPanel() {
  const { t } = useTranslation();

  return (
    <div className="space-y-1">
      <p className="px-2 py-4 text-center text-sm text-slate-500">
        {t('editor.layers.addLayer')}
      </p>
    </div>
  );
}

/** 资源面板 */
function AssetsPanel() {
  const { t } = useTranslation();

  return (
    <div className="space-y-1">
      <p className="px-2 py-4 text-center text-sm text-slate-500">
        {t('editor.data.import')}
      </p>
    </div>
  );
}

export default EditorSidebar;
