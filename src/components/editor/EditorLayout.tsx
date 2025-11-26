/**
 * 编辑器布局组件
 * 定义编辑器的整体布局结构
 */
import { useState } from 'react';

import { EditorHeader } from './EditorHeader';
import { EditorSidebar } from './EditorSidebar';
import { EditorCanvas } from './EditorCanvas';
import { EditorTimeline } from './EditorTimeline';
import { EditorProperties } from './EditorProperties';

/**
 * EditorLayout - 编辑器主布局组件
 * 
 * @description
 * 编辑器采用经典的三栏布局：
 * - 左侧：图层面板和资源面板
 * - 中间：地图画布和时间线
 * - 右侧：属性面板
 */
export function EditorLayout() {
  /** 左侧边栏是否折叠 */
  const [isLeftSidebarCollapsed, setIsLeftSidebarCollapsed] = useState(false);
  /** 右侧边栏是否折叠 */
  const [isRightSidebarCollapsed, setIsRightSidebarCollapsed] = useState(false);
  /** 时间线是否折叠 */
  const [isTimelineCollapsed, setIsTimelineCollapsed] = useState(false);

  return (
    <div className="flex h-screen flex-col bg-editor-bg overflow-hidden">
      {/* 顶部工具栏 */}
      <EditorHeader />

      {/* 主内容区域 */}
      <div className="flex flex-1 overflow-hidden">
        {/* 左侧边栏 - 图层和资源 */}
        <EditorSidebar
          position="left"
          isCollapsed={isLeftSidebarCollapsed}
          onToggle={() => setIsLeftSidebarCollapsed(!isLeftSidebarCollapsed)}
        />

        {/* 中央区域 - 画布和时间线 */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* 地图画布 */}
          <EditorCanvas />

          {/* 时间线面板 */}
          <EditorTimeline
            isCollapsed={isTimelineCollapsed}
            onToggle={() => setIsTimelineCollapsed(!isTimelineCollapsed)}
          />
        </div>

        {/* 右侧边栏 - 属性面板 */}
        <EditorProperties
          isCollapsed={isRightSidebarCollapsed}
          onToggle={() => setIsRightSidebarCollapsed(!isRightSidebarCollapsed)}
        />
      </div>
    </div>
  );
}

export default EditorLayout;
