/**
 * 编辑器布局组件
 * 定义编辑器的整体布局结构
 * 
 * @description
 * 编辑器采用三栏布局：
 * - 左侧：图层/资源/搜索/样式面板
 * - 中间：地图画布 + 时间线
 * - 右侧：属性面板
 * 
 * 优化设计：
 * - 简化的面板切换
 * - 浮动快捷操作栏
 * - 新手欢迎引导
 */
import { useState, useCallback, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

import { EditorHeader } from './EditorHeader';
import { EditorSidebar } from './EditorSidebar';
import { EditorCanvas } from './EditorCanvas';
import { EditorTimeline } from './EditorTimeline';
import { EditorProperties } from './EditorProperties';
import { QuickActionsBar } from './QuickActionsBar';
import { WelcomeOverlay } from './WelcomeOverlay';
import { DataImportDialog } from './DataImportDialog';
import { useToast } from '@/components/common/Toast';
import { useProjectStore } from '@/stores/projectStore';
import { useEditorStore } from '@/stores/editorStore';

/** 布局配置常量 */
const LAYOUT_CONFIG = {
  sidebar: { min: 240, max: 480, collapsed: 64, default: 320 },
  timeline: { min: 200, max: 600, collapsed: 40, default: 320 },
};

/**
 * EditorLayout - 编辑器主布局组件
 * 支持拖拽调整面板大小
 */
export function EditorLayout() {
  const { t } = useTranslation();
  const { success } = useToast();
  
  /** 项目状态 */
  const { currentProject, addSceneItem } = useProjectStore();
  
  /** 编辑器状态 */
  const { setTool } = useEditorStore();
  
  /** 左侧边栏状态 */
  const [isLeftCollapsed, setIsLeftCollapsed] = useState(false);
  const [leftWidth, setLeftWidth] = useState(LAYOUT_CONFIG.sidebar.default);
  
  /** 欢迎引导显示状态 */
  const [showWelcome, setShowWelcome] = useState(() => {
    // 检查是否是新项目或用户未选择不再显示
    const hideWelcome = localStorage.getItem('mapmotion-hide-welcome');
    return !hideWelcome;
  });
  
  /** 数据导入对话框状态 */
  const [showDataImport, setShowDataImport] = useState(false);

  /**
   * 快捷操作处理函数 - 添加路线
   * 切换到路线绘制工具
   */
  const handleAddRoute = useCallback(() => {
    setTool('draw-line');
    setShowWelcome(false);
    success(t('quickActions.addRoute'), t('quickActions.addRouteDesc'));
  }, [setTool, t, success]);

  /**
   * 快捷操作处理函数 - 添加标记点
   * 切换到标记绘制工具
   */
  const handleAddMarker = useCallback(() => {
    setTool('draw-point');
    setShowWelcome(false);
    success(t('quickActions.addMarker'), t('quickActions.addMarkerDesc'));
  }, [setTool, t, success]);

  /**
   * 快捷操作处理函数 - 添加标签
   * 切换到文字标签工具
   */
  const handleAddLabel = useCallback(() => {
    setTool('label');
    setShowWelcome(false);
    success(t('quickActions.addLabel'), t('quickActions.addLabelDesc'));
  }, [setTool, t, success]);

  /**
   * 快捷操作处理函数 - 添加镜头动画
   * 添加一个新的镜头动画轨道
   */
  const handleAddCamera = useCallback(() => {
    // 添加镜头动画元素到当前场景
    const cameraItem = {
      id: `camera-${Date.now()}`,
      type: 'camera' as const,
      name: t('timeline.camera'),
      properties: {
        keyframes: [
          { time: 0, center: [116.4, 39.9], zoom: 10, pitch: 0, bearing: 0 },
          { time: 5000, center: [116.5, 40.0], zoom: 12, pitch: 45, bearing: 30 },
        ],
      },
    };
    
    addSceneItem?.(0, cameraItem);
    setShowWelcome(false);
    success(t('quickActions.addCamera'), t('quickActions.addCameraDesc'));
  }, [addSceneItem, t, success]);

  /**
   * 快捷操作处理函数 - 导入数据
   * 打开数据导入对话框
   */
  const handleImportData = useCallback(() => {
    setShowDataImport(true);
    setShowWelcome(false);
  }, []);

  /**
   * 快捷操作处理函数 - 使用模板
   * 跳转到模板页面
   */
  const handleUseTemplate = useCallback(() => {
    // 导航到模板页面
    window.location.href = '/templates';
  }, []);

  /**
   * 快捷操作处理函数 - 观看教程
   * 打开教程页面
   */
  const handleWatchTutorial = useCallback(() => {
    window.open('/blog', '_blank');
  }, []);
  
  /** 右侧边栏状态 */
  const [isRightCollapsed, setIsRightCollapsed] = useState(false);
  const [rightWidth, setRightWidth] = useState(LAYOUT_CONFIG.sidebar.default);
  
  /** 时间线状态 */
  const [isTimelineCollapsed, setIsTimelineCollapsed] = useState(false);
  const [timelineHeight, setTimelineHeight] = useState(LAYOUT_CONFIG.timeline.default);

  /** 拖拽状态引用 */
  const isDragging = useRef<{ type: 'left' | 'right' | 'timeline'; startX?: number; startY?: number; startSize?: number } | null>(null);

  /**
   * 处理鼠标移动 - 调整面板大小
   */
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging.current) return;

    const { type, startX = 0, startY = 0, startSize = 0 } = isDragging.current;

    if (type === 'left') {
      const delta = e.clientX - startX;
      const newWidth = Math.min(Math.max(startSize + delta, LAYOUT_CONFIG.sidebar.min), LAYOUT_CONFIG.sidebar.max);
      if (!isLeftCollapsed) setLeftWidth(newWidth);
    } else if (type === 'right') {
      const delta = startX - e.clientX; // 右侧反向
      const newWidth = Math.min(Math.max(startSize + delta, LAYOUT_CONFIG.sidebar.min), LAYOUT_CONFIG.sidebar.max);
      if (!isRightCollapsed) setRightWidth(newWidth);
    } else if (type === 'timeline') {
      const delta = startY - e.clientY; // 底部反向
      const newHeight = Math.min(Math.max(startSize + delta, LAYOUT_CONFIG.timeline.min), LAYOUT_CONFIG.timeline.max);
      if (!isTimelineCollapsed) setTimelineHeight(newHeight);
    }
  }, [isLeftCollapsed, isRightCollapsed, isTimelineCollapsed]);

  /**
   * 处理鼠标释放 - 结束拖拽
   */
  const handleMouseUp = useCallback(() => {
    isDragging.current = null;
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  }, []);

  /**
   * 监听侧边栏的数据导入事件
   */
  useEffect(() => {
    const handleOpenDataImport = () => {
      setShowDataImport(true);
    };
    window.addEventListener('mapmotion:open-data-import', handleOpenDataImport);
    return () => {
      window.removeEventListener('mapmotion:open-data-import', handleOpenDataImport);
    };
  }, []);

  /**
   * 初始化拖拽监听
   */
  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  /**
   * 开始拖拽处理
   */
  const startResize = (type: 'left' | 'right' | 'timeline', e: React.MouseEvent) => {
    e.preventDefault();
    const startSize = type === 'timeline' ? timelineHeight : (type === 'left' ? leftWidth : rightWidth);
    isDragging.current = {
      type,
      startX: e.clientX,
      startY: e.clientY,
      startSize,
    };
    document.body.style.cursor = type === 'timeline' ? 'row-resize' : 'col-resize';
    document.body.style.userSelect = 'none';
  };

  return (
    <div className="flex h-screen flex-col bg-[#09090b] text-slate-200 overflow-hidden font-sans selection:bg-primary-500/30">
      {/* 顶部工具栏 */}
      <EditorHeader />

      {/* 主内容区域 */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* 左侧边栏 */}
        <div 
          className="relative flex-shrink-0 transition-[width] duration-300 ease-in-out will-change-[width]"
          style={{ width: isLeftCollapsed ? LAYOUT_CONFIG.sidebar.collapsed : leftWidth }}
        >
          <EditorSidebar
            position="left"
            isCollapsed={isLeftCollapsed}
            onToggle={() => setIsLeftCollapsed(!isLeftCollapsed)}
          />
          {/* 拖拽手柄 */}
          {!isLeftCollapsed && (
            <div
              className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-primary-500/50 z-50 transition-colors group"
              onMouseDown={(e) => startResize('left', e)}
            >
              <div className="absolute inset-y-0 right-0 w-[1px] bg-white/5 group-hover:bg-primary-500/50" />
            </div>
          )}
        </div>

        {/* 中央区域 */}
        <div className="flex flex-1 flex-col overflow-hidden relative z-0 bg-[#18181b]">
          {/* 地图画布 */}
          <div className="flex-1 relative overflow-hidden">
            <EditorCanvas />
          </div>

          {/* 时间线面板 */}
          <div 
            className="relative flex-shrink-0 border-t border-white/5 z-10"
            style={{ height: isTimelineCollapsed ? LAYOUT_CONFIG.timeline.collapsed : timelineHeight }}
          >
            {/* 顶部拖拽手柄 */}
            {!isTimelineCollapsed && (
              <div
                className="absolute top-0 left-0 right-0 h-1 cursor-row-resize hover:bg-primary-500/50 z-50 transition-colors group -translate-y-0.5"
                onMouseDown={(e) => startResize('timeline', e)}
              >
                 <div className="absolute inset-x-0 top-0 h-[1px] bg-white/5 group-hover:bg-primary-500/50" />
              </div>
            )}
            <EditorTimeline
              isCollapsed={isTimelineCollapsed}
              onToggle={() => setIsTimelineCollapsed(!isTimelineCollapsed)}
              height={isTimelineCollapsed ? LAYOUT_CONFIG.timeline.collapsed : timelineHeight}
            />
          </div>
        </div>

        {/* 右侧边栏 */}
        <div 
          className="relative flex-shrink-0 transition-[width] duration-300 ease-in-out will-change-[width]"
          style={{ width: isRightCollapsed ? LAYOUT_CONFIG.sidebar.collapsed : rightWidth }}
        >
          {/* 左侧拖拽手柄 (放在左边框) */}
          {!isRightCollapsed && (
            <div
              className="absolute left-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-primary-500/50 z-50 transition-colors group -translate-x-0.5"
              onMouseDown={(e) => startResize('right', e)}
            >
              <div className="absolute inset-y-0 left-0 w-[1px] bg-white/5 group-hover:bg-primary-500/50" />
            </div>
          )}
          <EditorProperties
            isCollapsed={isRightCollapsed}
            onToggle={() => setIsRightCollapsed(!isRightCollapsed)}
          />
        </div>
      </div>
      
      {/* 浮动快捷操作栏 */}
      <QuickActionsBar
        onAddMarker={handleAddMarker}
        onAddRoute={handleAddRoute}
        onAddLabel={handleAddLabel}
        onAddCamera={handleAddCamera}
        onImportData={handleImportData}
        onUseTemplate={handleUseTemplate}
      />
      
      {/* 欢迎引导覆盖层 - 新用户或空项目时显示 */}
      <WelcomeOverlay
        isVisible={showWelcome && !currentProject?.scenes?.[0]?.items?.length}
        onClose={() => setShowWelcome(false)}
        onCreateRoute={handleAddRoute}
        onAddMarker={handleAddMarker}
        onCreateCamera={handleAddCamera}
        onImportData={handleImportData}
        onUseTemplate={handleUseTemplate}
        onWatchTutorial={handleWatchTutorial}
      />
      
      {/* 数据导入对话框 */}
      <DataImportDialog
        isOpen={showDataImport}
        onClose={() => setShowDataImport(false)}
        onImport={(data) => {
          console.log('Imported data:', data);
          setShowDataImport(false);
          success(t('quickActions.importData'), t('success.dataImported'));
        }}
      />
    </div>
  );
}

export default EditorLayout;
