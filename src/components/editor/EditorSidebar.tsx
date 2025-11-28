/**
 * 编辑器侧边栏组件
 * 提供图层管理、资源库、搜索等功能面板
 * 
 * @description
 * 侧边栏采用简化设计，突出核心功能：
 * - 图层面板：管理地图图层和要素
 * - 搜索面板：地点检索和要素搜索
 * - 样式面板：底图样式和主题配置
 * 
 * 优化设计：
 * - 简化的导航图标
 * - 更紧凑的布局
 * - 快速操作整合到面板内
 */
import { useState, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { nanoid } from 'nanoid';
import {
  Layers,
  Search,
  Palette,
  ChevronLeft,
  ChevronRight,
  Plus,
  MapPin,
  Route,
  Type,
  Database,
} from 'lucide-react';

import { LayerPanel, type LayerItem } from './LayerPanel';
import { SearchPanel } from './SearchPanel';
import { StyleSelector } from './StyleSelector';
import { useToast } from '@/components/common/Toast';
import { useProjectStore } from '@/stores/projectStore';
import { useEditorStore } from '@/stores/editorStore';

/** 侧边栏面板类型 - 简化为3个核心面板 */
type SidebarPanel = 'layers' | 'search' | 'styles';

/** 侧边栏属性接口 */
interface EditorSidebarProps {
  /** 侧边栏位置：左侧或右侧 */
  position: 'left' | 'right';
  /** 是否折叠 */
  isCollapsed: boolean;
  /** 折叠状态切换回调 */
  onToggle: () => void;
}

/** 面板配置项接口 */
interface PanelConfig {
  /** 面板标识 */
  id: SidebarPanel;
  /** 面板图标组件 */
  icon: typeof Layers;
  /** 面板标题国际化键 */
  titleKey: string;
  /** 面板描述国际化键 */
  descKey: string;
}

/** 快捷操作项接口 */
interface QuickAction {
  /** 操作标识 */
  id: string;
  /** 操作图标 */
  icon: typeof MapPin;
  /** 操作标题国际化键 */
  titleKey: string;
  /** 操作颜色类名 */
  colorClass: string;
  /** 操作执行回调 */
  action: () => void;
}

/**
 * 侧边栏面板配置列表 - 简化为3个核心面板
 */
const PANEL_CONFIGS: PanelConfig[] = [
  {
    id: 'layers',
    icon: Layers,
    titleKey: 'sidebar.layers',
    descKey: 'sidebar.layersDesc',
  },
  {
    id: 'search',
    icon: Search,
    titleKey: 'sidebar.search',
    descKey: 'sidebar.searchDesc',
  },
  {
    id: 'styles',
    icon: Palette,
    titleKey: 'sidebar.styles',
    descKey: 'sidebar.stylesDesc',
  },
];

/**
 * EditorSidebar - 编辑器侧边栏组件
 */
export function EditorSidebar({ position, isCollapsed, onToggle }: EditorSidebarProps) {
  const { t } = useTranslation();
  const { success } = useToast();
  
  /** 项目状态 */
  const {
    currentProject,
    currentSceneIndex,
    addSceneItem,
    updateSceneItem,
    removeSceneItem,
    toggleItemVisibility,
    toggleItemLock,
    reorderSceneItems,
    duplicateSceneItem,
  } = useProjectStore();
  
  /** 编辑器状态 */
  const { setTool, mapStyleId, setMapStyle } = useEditorStore();
  
  /** 当前选中的图层 ID */
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);
  
  /** 当前激活的面板 */
  const [activePanel, setActivePanel] = useState<SidebarPanel>('layers');

  /**
   * 从场景元素转换为图层列表
   * 将 projectStore 中的 items 转换为 LayerPanel 需要的格式
   */
  const layers: LayerItem[] = useMemo(() => {
    const items = currentProject?.scenes?.[currentSceneIndex]?.items || [];
    return items.map((item: any) => ({
      id: item.id,
      name: item.name || 'Untitled',
      type: item.type || 'marker',
      visible: item.visible ?? true,
      locked: item.locked ?? false,
    }));
  }, [currentProject, currentSceneIndex]);

  /**
   * 添加标记点
   */
  const handleAddMarker = useCallback(() => {
    const newItem = {
      id: nanoid(),
      type: 'marker',
      name: `Marker ${(layers.length + 1)}`,
      visible: true,
      locked: false,
      properties: {
        coordinates: [116.4074, 39.9042],
        color: '#3B82F6',
        size: 24,
      },
    };
    addSceneItem(currentSceneIndex, newItem);
    setTool('draw-point');
    success(t('sidebar.addMarker'), t('quickActions.addMarkerDesc'));
  }, [addSceneItem, currentSceneIndex, layers.length, setTool, success, t]);

  /**
   * 添加路线
   */
  const handleAddRoute = useCallback(() => {
    const newItem = {
      id: nanoid(),
      type: 'path',
      name: `Route ${(layers.length + 1)}`,
      visible: true,
      locked: false,
      properties: {
        coordinates: [],
        color: '#10B981',
        width: 4,
      },
    };
    addSceneItem(currentSceneIndex, newItem);
    setTool('draw-line');
    success(t('sidebar.addRoute'), t('quickActions.addRouteDesc'));
  }, [addSceneItem, currentSceneIndex, layers.length, setTool, success, t]);

  /**
   * 添加标签
   */
  const handleAddLabel = useCallback(() => {
    const newItem = {
      id: nanoid(),
      type: 'label',
      name: `Label ${(layers.length + 1)}`,
      visible: true,
      locked: false,
      properties: {
        text: 'New Label',
        coordinates: [116.4074, 39.9042],
        fontSize: 14,
        color: '#F59E0B',
      },
    };
    addSceneItem(currentSceneIndex, newItem);
    setTool('label');
    success(t('sidebar.addLabel'), t('quickActions.addLabelDesc'));
  }, [addSceneItem, currentSceneIndex, layers.length, setTool, success, t]);

  /**
   * 导入数据（触发数据导入对话框）
   */
  const handleImportData = useCallback(() => {
    // 触发 EditorLayout 中的数据导入对话框
    // 通过自定义事件通知
    window.dispatchEvent(new CustomEvent('mapmotion:open-data-import'));
    success(t('sidebar.addData'), t('quickActions.importDataDesc'));
  }, [success, t]);

  /**
   * 快捷操作列表
   * 提供常用的添加图层操作入口
   */
  const quickActions: QuickAction[] = useMemo(() => [
    {
      id: 'add-marker',
      icon: MapPin,
      titleKey: 'sidebar.addMarker',
      colorClass: 'bg-blue-500 hover:bg-blue-600',
      action: handleAddMarker,
    },
    {
      id: 'add-route',
      icon: Route,
      titleKey: 'sidebar.addRoute',
      colorClass: 'bg-green-500 hover:bg-green-600',
      action: handleAddRoute,
    },
    {
      id: 'add-label',
      icon: Type,
      titleKey: 'sidebar.addLabel',
      colorClass: 'bg-amber-500 hover:bg-amber-600',
      action: handleAddLabel,
    },
    {
      id: 'add-data',
      icon: Database,
      titleKey: 'sidebar.addData',
      colorClass: 'bg-purple-500 hover:bg-purple-600',
      action: handleImportData,
    },
  ], [handleAddMarker, handleAddRoute, handleAddLabel, handleImportData]);

  /**
   * 处理面板切换
   * @param panelId - 目标面板标识
   */
  const handlePanelChange = useCallback((panelId: SidebarPanel) => {
    setActivePanel(panelId);
  }, []);

  /**
   * 渲染面板导航按钮
   * @param config - 面板配置
   */
  const renderPanelButton = useCallback((config: PanelConfig) => {
    const Icon = config.icon;
    const isActive = activePanel === config.id;
    
    return (
      <button
        key={config.id}
        onClick={() => handlePanelChange(config.id)}
        className={`
          flex h-10 w-10 items-center justify-center rounded-lg transition-all duration-200 relative group
          ${isActive 
            ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/25' 
            : 'text-slate-400 hover:bg-white/5 hover:text-white'
          }
        `}
        title={t(config.titleKey)}
        aria-label={t(config.titleKey)}
        aria-pressed={isActive}
      >
        <Icon className="h-5 w-5" />
        {isActive && (
          <motion.div 
            layoutId="activeIndicator"
            className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-0.5 bg-white rounded-r-full -ml-2"
          />
        )}
      </button>
    );
  }, [activePanel, handlePanelChange, t]);

  /**
   * 渲染快捷操作按钮
   * @param action - 操作配置
   */
  const renderQuickAction = useCallback((action: QuickAction) => {
    const Icon = action.icon;
    
    return (
      <button
        key={action.id}
        onClick={action.action}
        className={`
          flex h-9 w-9 items-center justify-center rounded-lg text-white transition-all duration-200 shadow-lg
          ${action.colorClass} hover:scale-105 hover:brightness-110
        `}
        title={t(action.titleKey)}
        aria-label={t(action.titleKey)}
      >
        <Icon className="h-4 w-4" />
      </button>
    );
  }, [t]);

  /**
   * 处理图层选择
   */
  const handleLayerSelect = useCallback((id: string) => {
    setSelectedLayerId(id);
  }, []);

  /**
   * 处理切换图层可见性
   */
  const handleToggleVisibility = useCallback((id: string) => {
    toggleItemVisibility(currentSceneIndex, id);
  }, [currentSceneIndex, toggleItemVisibility]);

  /**
   * 处理切换图层锁定
   */
  const handleToggleLock = useCallback((id: string) => {
    toggleItemLock(currentSceneIndex, id);
  }, [currentSceneIndex, toggleItemLock]);

  /**
   * 处理图层重命名
   */
  const handleLayerRename = useCallback((id: string, name: string) => {
    updateSceneItem(currentSceneIndex, id, { name });
  }, [currentSceneIndex, updateSceneItem]);

  /**
   * 处理图层删除
   */
  const handleLayerDelete = useCallback((id: string) => {
    removeSceneItem(currentSceneIndex, id);
    if (selectedLayerId === id) {
      setSelectedLayerId(null);
    }
  }, [currentSceneIndex, removeSceneItem, selectedLayerId]);

  /**
   * 处理图层复制
   */
  const handleLayerDuplicate = useCallback((id: string) => {
    duplicateSceneItem(currentSceneIndex, id);
  }, [currentSceneIndex, duplicateSceneItem]);

  /**
   * 处理图层重排序
   */
  const handleLayerReorder = useCallback((dragId: string, dropId: string) => {
    const fromIndex = layers.findIndex(l => l.id === dragId);
    const toIndex = layers.findIndex(l => l.id === dropId);
    if (fromIndex !== -1 && toIndex !== -1) {
      reorderSceneItems(currentSceneIndex, fromIndex, toIndex);
    }
  }, [currentSceneIndex, layers, reorderSceneItems]);

  /**
   * 渲染当前激活面板的内容
   * 连接到实际的图层和样式状态
   */
  const renderPanelContent = useCallback(() => {
    switch (activePanel) {
      case 'layers':
        return (
          <LayerPanel 
            layers={layers}
            selectedLayerId={selectedLayerId}
            onSelect={handleLayerSelect}
            onToggleVisibility={handleToggleVisibility}
            onToggleLock={handleToggleLock}
            onReorder={handleLayerReorder}
            onRename={handleLayerRename}
            onDelete={handleLayerDelete}
            onDuplicate={handleLayerDuplicate}
          />
        );
      case 'search':
        return (
          <SearchPanel 
            onSelect={() => {}}
            onClose={() => setActivePanel('layers')}
          />
        );
      case 'styles':
        return (
          <StyleSelector 
            currentStyleId={mapStyleId}
            onStyleChange={setMapStyle}
          />
        );
      default:
        return null;
    }
  }, [
    activePanel,
    layers,
    selectedLayerId,
    handleLayerSelect,
    handleToggleVisibility,
    handleToggleLock,
    handleLayerReorder,
    handleLayerRename,
    handleLayerDelete,
    handleLayerDuplicate,
    mapStyleId,
    setMapStyle,
  ]);

  return (
    <aside
      className={`
        flex h-full border-white/5 bg-[#18181b] z-10 w-full overflow-hidden
        ${position === 'left' ? 'border-r' : 'border-l'}
      `}
    >
      {/* 导航栏 - 始终显示 */}
      <div className="flex h-full w-16 flex-col items-center border-r border-white/5 bg-[#09090b] py-4 relative z-20 flex-shrink-0">
        {/* 面板导航按钮组 */}
        <div className="flex flex-col gap-2">
          {PANEL_CONFIGS.map(renderPanelButton)}
        </div>
        
        {/* 分隔线 */}
        <div className="my-4 h-px w-8 bg-white/10" />
        
        {/* 快捷操作按钮组 */}
        <div className="flex flex-col gap-2">
          {quickActions.map(renderQuickAction)}
        </div>
        
        {/* 底部填充区域 */}
        <div className="flex-1" />
        
        {/* 折叠/展开按钮 */}
        <button
          onClick={onToggle}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
          title={isCollapsed ? t('sidebar.expand') : t('sidebar.collapse')}
          aria-label={isCollapsed ? t('sidebar.expand') : t('sidebar.collapse')}
          aria-expanded={!isCollapsed}
        >
          {position === 'left' ? (
            isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />
          ) : (
            isCollapsed ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />
          )}
        </button>
      </div>
      
      {/* 面板内容区域 - 折叠时隐藏 */}
      <AnimatePresence>
        {!isCollapsed && (
          <motion.div
            className="flex h-full flex-1 flex-col overflow-hidden bg-[#18181b]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {/* 面板标题栏 */}
            <div className="flex h-14 items-center justify-between border-b border-white/5 px-4 bg-white/5 backdrop-blur-sm flex-shrink-0">
              <h2 className="text-sm font-semibold text-slate-100 tracking-wide">
                {t(PANEL_CONFIGS.find(p => p.id === activePanel)?.titleKey || '')}
              </h2>
              
              {/* 添加按钮 */}
              <button
                className="flex h-7 w-7 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
                title={t('common.add')}
                aria-label={t('common.add')}
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            
            {/* 面板内容 */}
            <div className="flex-1 overflow-y-auto scrollbar-thin custom-scrollbar">
              {renderPanelContent()}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </aside>
  );
}

export default EditorSidebar;
