/**
 * 编辑器属性面板组件
 */
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight } from 'lucide-react';

/** 属性面板属性 */
interface EditorPropertiesProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

export function EditorProperties({ isCollapsed, onToggle }: EditorPropertiesProps) {
  const { t } = useTranslation();

  if (isCollapsed) {
    return (
      <div className="flex w-10 flex-col items-center border-l border-editor-border bg-editor-sidebar py-2">
        <button onClick={onToggle} className="btn-icon text-slate-400 hover:text-white">
          <ChevronLeft className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex w-72 flex-col border-l border-editor-border bg-editor-sidebar">
      {/* 标题栏 */}
      <div className="flex items-center justify-between border-b border-editor-border px-4 py-2">
        <span className="text-sm font-medium text-slate-300">{t('editor.panels.properties')}</span>
        <button onClick={onToggle} className="btn-icon text-slate-400 hover:text-white">
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* 属性内容 */}
      <div className="flex-1 overflow-y-auto p-4">
        <p className="text-center text-sm text-slate-500">
          选择一个元素以查看属性
        </p>
      </div>
    </div>
  );
}

export default EditorProperties;
