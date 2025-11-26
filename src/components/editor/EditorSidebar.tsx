/**
 * 编辑器侧边栏组件
 * 包含图层管理和资源管理
 */
import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Layers,
  FolderOpen,
  Search,
  Plus,
  ChevronLeft,
  ChevronRight,
  Upload,
  Image,
  FileText,
  Music,
} from 'lucide-react';

import { LayerPanel, type LayerItem } from './LayerPanel';
import { AddLayerModal } from './AddLayerModal';
import { DataImportDialog } from './DataImportDialog';
import { useEditorStore } from '@/stores/editorStore';

/** 侧边栏属性 */
interface EditorSidebarProps {
  position: 'left' | 'right';
  isCollapsed: boolean;
  onToggle: () => void;
}

/** 标签页类型 */
type TabType = 'layers' | 'assets';

/** 模拟图层数据 */
const initialLayers: LayerItem[] = [
  { id: '1', name: '镜头动画', type: 'camera', visible: true, locked: false },
  { id: '2', name: '城市标记', type: 'marker', visible: true, locked: false },
  { id: '3', name: '路径轨迹', type: 'path', visible: true, locked: false },
];

export function EditorSidebar({ position, isCollapsed, onToggle }: EditorSidebarProps) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<TabType>('layers');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddLayerModal, setShowAddLayerModal] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  
  // 图层状态
  const [layers, setLayers] = useState<LayerItem[]>(initialLayers);
  const { selection, select, clearSelection } = useEditorStore();
  const selectedLayerId = selection.find(s => s.type === 'layer')?.id || null;

  // 选择图层
  const handleSelectLayer = useCallback((id: string) => {
    select({ type: 'layer', id });
  }, [select]);

  // 切换可见性
  const handleToggleVisibility = useCallback((id: string) => {
    setLayers((prev) =>
      prev.map((layer) =>
        layer.id === id ? { ...layer, visible: !layer.visible } : layer
      )
    );
  }, []);

  // 切换锁定
  const handleToggleLock = useCallback((id: string) => {
    setLayers((prev) =>
      prev.map((layer) =>
        layer.id === id ? { ...layer, locked: !layer.locked } : layer
      )
    );
  }, []);

  // 删除图层
  const handleDeleteLayer = useCallback((id: string) => {
    setLayers((prev) => prev.filter((layer) => layer.id !== id));
    if (selectedLayerId === id) {
      clearSelection();
    }
  }, [selectedLayerId, clearSelection]);

  // 复制图层
  const handleDuplicateLayer = useCallback((id: string) => {
    setLayers((prev) => {
      const layer = prev.find((l) => l.id === id);
      if (!layer) return prev;
      const newLayer: LayerItem = {
        ...layer,
        id: `${Date.now()}`,
        name: `${layer.name} 副本`,
      };
      const index = prev.findIndex((l) => l.id === id);
      const newLayers = [...prev];
      newLayers.splice(index + 1, 0, newLayer);
      return newLayers;
    });
  }, []);

  // 重命名图层
  const handleRenameLayer = useCallback((id: string, name: string) => {
    setLayers((prev) =>
      prev.map((layer) => (layer.id === id ? { ...layer, name } : layer))
    );
  }, []);

  // 重新排序图层
  const handleReorderLayers = useCallback((dragId: string, dropId: string) => {
    setLayers((prev) => {
      const dragIndex = prev.findIndex((l) => l.id === dragId);
      const dropIndex = prev.findIndex((l) => l.id === dropId);
      if (dragIndex === -1 || dropIndex === -1) return prev;
      
      const newLayers = [...prev];
      const [removed] = newLayers.splice(dragIndex, 1);
      if (removed) {
        newLayers.splice(dropIndex, 0, removed);
      }
      return newLayers;
    });
  }, []);

  // 添加图层
  const handleAddLayer = useCallback((type: string, name: string) => {
    const newLayer: LayerItem = {
      id: `${Date.now()}`,
      name,
      type: type as LayerItem['type'],
      visible: true,
      locked: false,
    };
    setLayers((prev) => [newLayer, ...prev]);
    select({ type: 'layer', id: newLayer.id });
  }, [select]);

  // 导入数据
  const handleImportData = useCallback((data: unknown[], _mapping: unknown) => {
    console.log('导入数据:', data.length, '条');
    // TODO: 实际创建标记图层
  }, []);

  // 过滤图层
  const filteredLayers = searchQuery
    ? layers.filter((l) => l.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : layers;

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
    <>
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
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('common.search')}
              className="w-full rounded bg-editor-panel py-1.5 pl-8 pr-3 text-sm text-slate-300 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>
        </div>

        {/* 内容区域 */}
        <div className="flex-1 overflow-y-auto p-2">
          {activeTab === 'layers' ? (
            <LayerPanel
              layers={filteredLayers}
              selectedLayerId={selectedLayerId}
              onSelect={handleSelectLayer}
              onToggleVisibility={handleToggleVisibility}
              onToggleLock={handleToggleLock}
              onDelete={handleDeleteLayer}
              onDuplicate={handleDuplicateLayer}
              onRename={handleRenameLayer}
              onReorder={handleReorderLayers}
            />
          ) : (
            <AssetsPanel onImport={() => setShowImportDialog(true)} />
          )}
        </div>

        {/* 底部工具栏 */}
        <div className="flex items-center justify-between border-t border-editor-border p-2">
          <button
            onClick={() => activeTab === 'layers' ? setShowAddLayerModal(true) : setShowImportDialog(true)}
            className="btn-icon text-slate-400 hover:text-white"
            title={activeTab === 'layers' ? t('editor.layers.addLayer') : t('editor.data.import')}
          >
            <Plus className="h-4 w-4" />
          </button>
          <button onClick={onToggle} className="btn-icon text-slate-400 hover:text-white">
            <ChevronLeft className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* 对话框 */}
      <AddLayerModal
        isOpen={showAddLayerModal}
        onClose={() => setShowAddLayerModal(false)}
        onAdd={handleAddLayer}
      />
      <DataImportDialog
        isOpen={showImportDialog}
        onClose={() => setShowImportDialog(false)}
        onImport={handleImportData}
      />
    </>
  );
}

/** 资源面板 */
interface AssetsPanelProps {
  onImport: () => void;
}

function AssetsPanel({ onImport }: AssetsPanelProps) {
  const { t } = useTranslation();
  const [assets] = useState<Array<{ id: string; name: string; type: string }>>([]);

  if (assets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <div className="mb-4 flex gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-editor-panel">
            <Image className="h-5 w-5 text-slate-500" />
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-editor-panel">
            <FileText className="h-5 w-5 text-slate-500" />
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-editor-panel">
            <Music className="h-5 w-5 text-slate-500" />
          </div>
        </div>
        <p className="mb-2 text-sm text-slate-400">{t('editor.data.import')}</p>
        <p className="mb-4 text-center text-xs text-slate-500">
          支持图片、GeoJSON、CSV、音频等
        </p>
        <button
          onClick={onImport}
          className="flex items-center gap-2 rounded bg-primary-600 px-3 py-1.5 text-xs text-white hover:bg-primary-700"
        >
          <Upload className="h-3 w-3" />
          导入资源
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-2">
      {assets.map((asset) => (
        <div
          key={asset.id}
          className="flex flex-col items-center rounded bg-editor-panel p-2 hover:bg-editor-hover cursor-pointer"
        >
          <div className="mb-1 h-12 w-12 rounded bg-slate-700" />
          <span className="text-xs text-slate-400 truncate w-full text-center">{asset.name}</span>
        </div>
      ))}
    </div>
  );
}

export default EditorSidebar;
