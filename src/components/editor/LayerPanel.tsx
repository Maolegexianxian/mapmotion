/**
 * 图层面板组件
 * 提供图层管理功能
 */
import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Trash2,
  Copy,
  ChevronDown,
  ChevronRight,
  Video,
  MapPin,
  Type,
  Hexagon,
  Flame,
  Mountain,
  Building,
  GripVertical,
} from 'lucide-react';
import { useDrag, useDrop } from '@/hooks';

/** 图层类型 */
export type LayerType = 'camera' | 'marker' | 'label' | 'path' | 'polygon' | 'heatmap' | 'terrain' | 'building';

/** 图层数据 */
export interface LayerItem {
  id: string;
  name: string;
  type: LayerType;
  visible: boolean;
  locked: boolean;
  expanded?: boolean;
  children?: LayerItem[];
}

/** 图层图标映射 */
const LAYER_ICONS: Record<LayerType, typeof Video> = {
  camera: Video,
  marker: MapPin,
  label: Type,
  path: Hexagon,
  polygon: Hexagon,
  heatmap: Flame,
  terrain: Mountain,
  building: Building,
};

/** 图层颜色映射 */
const LAYER_COLORS: Record<LayerType, string> = {
  camera: 'bg-blue-500',
  marker: 'bg-red-500',
  label: 'bg-green-500',
  path: 'bg-purple-500',
  polygon: 'bg-yellow-500',
  heatmap: 'bg-orange-500',
  terrain: 'bg-emerald-500',
  building: 'bg-slate-500',
};

interface LayerPanelProps {
  layers: LayerItem[];
  selectedLayerId: string | null;
  onSelect: (id: string) => void;
  onToggleVisibility: (id: string) => void;
  onToggleLock: (id: string) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  onRename: (id: string, name: string) => void;
  onReorder: (dragId: string, dropId: string) => void;
}

/**
 * LayerPanel - 图层面板
 */
export function LayerPanel({
  layers,
  selectedLayerId,
  onSelect,
  onToggleVisibility,
  onToggleLock,
  onDelete,
  onDuplicate,
  onRename,
  onReorder,
}: LayerPanelProps) {
  const { t } = useTranslation();

  if (layers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <p className="text-sm text-slate-500">{t('editor.layers.addLayer')}</p>
        <p className="mt-1 text-xs text-slate-600">点击上方 + 按钮添加图层</p>
      </div>
    );
  }

  return (
    <div className="space-y-0.5">
      {layers.map((layer) => (
        <LayerRow
          key={layer.id}
          layer={layer}
          isSelected={selectedLayerId === layer.id}
          onSelect={onSelect}
          onToggleVisibility={onToggleVisibility}
          onToggleLock={onToggleLock}
          onDelete={onDelete}
          onDuplicate={onDuplicate}
          onRename={onRename}
          onReorder={onReorder}
        />
      ))}
    </div>
  );
}

/** 图层行组件属性 */
interface LayerRowProps {
  layer: LayerItem;
  isSelected: boolean;
  depth?: number;
  onSelect: (id: string) => void;
  onToggleVisibility: (id: string) => void;
  onToggleLock: (id: string) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  onRename: (id: string, name: string) => void;
  onReorder: (dragId: string, dropId: string) => void;
}

/**
 * LayerRow - 图层行
 */
function LayerRow({
  layer,
  isSelected,
  depth = 0,
  onSelect,
  onToggleVisibility,
  onToggleLock,
  onDelete,
  onDuplicate,
  onRename,
  onReorder,
}: LayerRowProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(layer.name);
  const [isExpanded, setIsExpanded] = useState(layer.expanded ?? true);
  const [showContextMenu, setShowContextMenu] = useState(false);

  const Icon = LAYER_ICONS[layer.type];
  const colorClass = LAYER_COLORS[layer.type];

  // 拖拽功能
  const { state: dragState, dragProps, setDragData } = useDrag(
    { threshold: 5 },
    {
      onDragStart: () => setDragData(layer.id),
    }
  );

  const { isOver, dropProps } = useDrop(
    {},
    {
      onDrop: (_, data) => {
        if (typeof data === 'string' && data !== layer.id) {
          onReorder(data, layer.id);
        }
      },
    }
  );

  // 双击编辑名称
  const handleDoubleClick = useCallback(() => {
    if (!layer.locked) {
      setIsEditing(true);
      setEditName(layer.name);
    }
  }, [layer.locked, layer.name]);

  // 保存名称
  const handleSaveName = useCallback(() => {
    if (editName.trim() && editName !== layer.name) {
      onRename(layer.id, editName.trim());
    }
    setIsEditing(false);
  }, [editName, layer.id, layer.name, onRename]);

  // 键盘事件
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        handleSaveName();
      } else if (e.key === 'Escape') {
        setIsEditing(false);
        setEditName(layer.name);
      }
    },
    [handleSaveName, layer.name]
  );

  // 右键菜单
  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setShowContextMenu(true);
  }, []);

  return (
    <>
      <div
        className={`
          group flex items-center gap-1 rounded px-1 py-1 cursor-pointer transition-colors
          ${isSelected ? 'bg-primary-600/30' : 'hover:bg-editor-hover'}
          ${isOver ? 'ring-2 ring-primary-500' : ''}
          ${dragState.isDragging ? 'opacity-50' : ''}
        `}
        style={{ paddingLeft: `${depth * 16 + 4}px` }}
        onClick={() => onSelect(layer.id)}
        onDoubleClick={handleDoubleClick}
        onContextMenu={handleContextMenu}
        {...dragProps}
        {...dropProps}
      >
        {/* 拖拽手柄 */}
        <div className="opacity-0 group-hover:opacity-100 cursor-grab">
          <GripVertical className="h-3 w-3 text-slate-500" />
        </div>

        {/* 展开/折叠按钮 */}
        {layer.children && layer.children.length > 0 ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
            className="p-0.5 text-slate-400 hover:text-white"
          >
            {isExpanded ? (
              <ChevronDown className="h-3 w-3" />
            ) : (
              <ChevronRight className="h-3 w-3" />
            )}
          </button>
        ) : (
          <div className="w-4" />
        )}

        {/* 图层类型图标 */}
        <div className={`flex h-5 w-5 items-center justify-center rounded ${colorClass}`}>
          <Icon className="h-3 w-3 text-white" />
        </div>

        {/* 图层名称 */}
        <div className="flex-1 min-w-0">
          {isEditing ? (
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onBlur={handleSaveName}
              onKeyDown={handleKeyDown}
              className="w-full bg-editor-panel px-1 py-0.5 text-xs text-white outline-none ring-1 ring-primary-500 rounded"
              autoFocus
            />
          ) : (
            <span
              className={`block truncate text-xs ${
                layer.visible ? 'text-slate-300' : 'text-slate-500'
              }`}
            >
              {layer.name}
            </span>
          )}
        </div>

        {/* 操作按钮 */}
        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleVisibility(layer.id);
            }}
            className="p-1 text-slate-400 hover:text-white"
            title={layer.visible ? '隐藏' : '显示'}
          >
            {layer.visible ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleLock(layer.id);
            }}
            className="p-1 text-slate-400 hover:text-white"
            title={layer.locked ? '解锁' : '锁定'}
          >
            {layer.locked ? <Lock className="h-3 w-3" /> : <Unlock className="h-3 w-3" />}
          </button>
        </div>
      </div>

      {/* 子图层 */}
      {layer.children && isExpanded && (
        <div>
          {layer.children.map((child) => (
            <LayerRow
              key={child.id}
              layer={child}
              isSelected={false}
              depth={depth + 1}
              onSelect={onSelect}
              onToggleVisibility={onToggleVisibility}
              onToggleLock={onToggleLock}
              onDelete={onDelete}
              onDuplicate={onDuplicate}
              onRename={onRename}
              onReorder={onReorder}
            />
          ))}
        </div>
      )}

      {/* 右键菜单 */}
      {showContextMenu && (
        <LayerContextMenu
          layer={layer}
          onClose={() => setShowContextMenu(false)}
          onDelete={() => {
            onDelete(layer.id);
            setShowContextMenu(false);
          }}
          onDuplicate={() => {
            onDuplicate(layer.id);
            setShowContextMenu(false);
          }}
          onRename={() => {
            setIsEditing(true);
            setShowContextMenu(false);
          }}
        />
      )}
    </>
  );
}

/** 右键菜单属性 */
interface LayerContextMenuProps {
  layer: LayerItem;
  onClose: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onRename: () => void;
}

/**
 * LayerContextMenu - 图层右键菜单
 */
function LayerContextMenu({ layer, onClose, onDelete, onDuplicate, onRename }: LayerContextMenuProps) {
  const { t } = useTranslation();

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div className="absolute right-0 z-50 mt-1 w-40 rounded-md bg-editor-panel shadow-lg ring-1 ring-black/20">
        <div className="py-1">
          <button
            onClick={onRename}
            disabled={layer.locked}
            className="flex w-full items-center gap-2 px-3 py-1.5 text-xs text-slate-300 hover:bg-editor-hover disabled:opacity-50"
          >
            <Type className="h-3 w-3" />
            {t('editor.layers.renameLayer')}
          </button>
          <button
            onClick={onDuplicate}
            className="flex w-full items-center gap-2 px-3 py-1.5 text-xs text-slate-300 hover:bg-editor-hover"
          >
            <Copy className="h-3 w-3" />
            {t('editor.layers.duplicateLayer')}
          </button>
          <hr className="my-1 border-editor-border" />
          <button
            onClick={onDelete}
            className="flex w-full items-center gap-2 px-3 py-1.5 text-xs text-red-400 hover:bg-editor-hover"
          >
            <Trash2 className="h-3 w-3" />
            {t('editor.layers.removeLayer')}
          </button>
        </div>
      </div>
    </>
  );
}

export default LayerPanel;
