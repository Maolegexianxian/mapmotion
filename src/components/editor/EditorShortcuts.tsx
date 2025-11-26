/**
 * 编辑器快捷键组件
 * 集成全局快捷键到编辑器
 */
import { useCallback } from 'react';
import { useKeyboardShortcuts, CommonShortcuts } from '@/hooks';
import { useEditorStore } from '@/stores/editorStore';
import { useProjectStore } from '@/stores/projectStore';

/**
 * EditorShortcuts - 编辑器快捷键组件
 * 
 * 这是一个无渲染组件，仅负责绑定快捷键
 */
export function EditorShortcuts() {
  const {
    undo,
    redo,
    copy,
    paste,
    cut,
    clearSelection,
    togglePlay,
    zoomIn,
    zoomOut,
    resetZoom,
    setTool,
    togglePanel,
  } = useEditorStore();

  const { saveProject } = useProjectStore();

  // 删除选中项
  const handleDelete = useCallback(() => {
    // 删除逻辑将在具体实现中处理
    clearSelection();
  }, [clearSelection]);

  // 导出
  const handleExport = useCallback(() => {
    console.log('[EditorShortcuts] 导出');
    // 导出逻辑将在具体实现中处理
  }, []);

  // 取消/退出
  const handleEscape = useCallback(() => {
    clearSelection();
    setTool('select');
  }, [clearSelection, setTool]);

  // 切换工具快捷键
  const handleToolV = useCallback(() => setTool('select'), [setTool]);
  const handleToolH = useCallback(() => setTool('pan'), [setTool]);
  const handleToolP = useCallback(() => setTool('draw-point'), [setTool]);
  const handleToolL = useCallback(() => setTool('draw-line'), [setTool]);
  const handleToolR = useCallback(() => setTool('draw-polygon'), [setTool]);
  const handleToolT = useCallback(() => setTool('label'), [setTool]);

  // 面板切换
  const handleToggleSidebar = useCallback(() => togglePanel('sidebar'), [togglePanel]);
  const handleToggleTimeline = useCallback(() => togglePanel('timeline'), [togglePanel]);
  const handleToggleProperties = useCallback(() => togglePanel('properties'), [togglePanel]);

  // 定义所有快捷键
  useKeyboardShortcuts([
    // 撤销/重做
    CommonShortcuts.undo(undo),
    CommonShortcuts.redo(redo),
    
    // 剪贴板
    CommonShortcuts.copy(copy),
    CommonShortcuts.paste(paste),
    CommonShortcuts.cut(cut),
    CommonShortcuts.delete(handleDelete),
    
    // 保存
    CommonShortcuts.save(saveProject),
    
    // 导出
    CommonShortcuts.export(handleExport),
    
    // 播放控制
    CommonShortcuts.playPause(togglePlay),
    
    // 缩放
    CommonShortcuts.zoomIn(zoomIn),
    CommonShortcuts.zoomOut(zoomOut),
    CommonShortcuts.fitView(resetZoom),
    
    // 取消
    CommonShortcuts.escape(handleEscape),
    
    // 工具快捷键
    { key: 'v', handler: handleToolV, description: '选择工具' },
    { key: 'h', handler: handleToolH, description: '平移工具' },
    { key: 'p', handler: handleToolP, description: '点工具' },
    { key: 'l', handler: handleToolL, description: '线工具' },
    { key: 'r', handler: handleToolR, description: '多边形工具' },
    { key: 't', handler: handleToolT, description: '标签工具' },
    
    // 面板快捷键
    { 
      key: '1', 
      modifiers: { ctrl: true }, 
      handler: handleToggleSidebar, 
      description: '切换侧边栏' 
    },
    { 
      key: '2', 
      modifiers: { ctrl: true }, 
      handler: handleToggleTimeline, 
      description: '切换时间线' 
    },
    { 
      key: '3', 
      modifiers: { ctrl: true }, 
      handler: handleToggleProperties, 
      description: '切换属性面板' 
    },
  ]);

  // 无渲染组件
  return null;
}

export default EditorShortcuts;
