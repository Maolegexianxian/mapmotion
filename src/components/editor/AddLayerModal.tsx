/**
 * 添加图层对话框组件
 */
import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  X,
  Video,
  MapPin,
  Type,
  Hexagon,
  Flame,
  Mountain,
  Building,
  Route,
} from 'lucide-react';

/** 图层类型选项 */
const LAYER_TYPES = [
  { id: 'camera', icon: Video, labelKey: 'editor.layers.layerTypes.camera', description: '添加镜头动画' },
  { id: 'marker', icon: MapPin, labelKey: 'editor.layers.layerTypes.marker', description: '添加标记点' },
  { id: 'label', icon: Type, labelKey: 'editor.layers.layerTypes.label', description: '添加文字标签' },
  { id: 'path', icon: Route, labelKey: 'editor.layers.layerTypes.path', description: '添加路径/路线' },
  { id: 'polygon', icon: Hexagon, labelKey: 'editor.layers.layerTypes.polygon', description: '添加多边形区域' },
  { id: 'heatmap', icon: Flame, labelKey: 'editor.layers.layerTypes.heatmap', description: '添加热力图' },
  { id: 'terrain', icon: Mountain, labelKey: 'editor.layers.layerTypes.terrain', description: '添加3D地形' },
  { id: 'building', icon: Building, labelKey: 'editor.layers.layerTypes.building', description: '添加3D建筑' },
] as const;

type LayerTypeId = typeof LAYER_TYPES[number]['id'];

interface AddLayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (type: LayerTypeId, name: string) => void;
}

/**
 * AddLayerModal - 添加图层对话框
 */
export function AddLayerModal({ isOpen, onClose, onAdd }: AddLayerModalProps) {
  const { t } = useTranslation();
  const [selectedType, setSelectedType] = useState<LayerTypeId>('marker');
  const [layerName, setLayerName] = useState('');

  const handleAdd = useCallback(() => {
    const name = layerName.trim() || t(`editor.layers.layerTypes.${selectedType}`);
    onAdd(selectedType, name);
    setLayerName('');
    onClose();
  }, [layerName, selectedType, onAdd, onClose, t]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 背景遮罩 */}
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      
      {/* 对话框 */}
      <div className="relative z-10 w-full max-w-md rounded-lg bg-editor-panel shadow-xl">
        {/* 标题栏 */}
        <div className="flex items-center justify-between border-b border-editor-border px-4 py-3">
          <h3 className="text-sm font-medium text-white">{t('editor.layers.addLayer')}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* 内容 */}
        <div className="p-4">
          {/* 图层类型选择 */}
          <div className="mb-4">
            <label className="mb-2 block text-xs font-medium text-slate-400">
              选择图层类型
            </label>
            <div className="grid grid-cols-4 gap-2">
              {LAYER_TYPES.map((type) => {
                const Icon = type.icon;
                const isSelected = selectedType === type.id;
                return (
                  <button
                    key={type.id}
                    onClick={() => setSelectedType(type.id)}
                    className={`
                      flex flex-col items-center gap-1 rounded-lg p-3 transition-colors
                      ${isSelected 
                        ? 'bg-primary-600 text-white' 
                        : 'bg-editor-hover text-slate-400 hover:bg-editor-hover/80 hover:text-white'
                      }
                    `}
                    title={type.description}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="text-[10px]">{t(type.labelKey)}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 图层名称 */}
          <div className="mb-4">
            <label className="mb-2 block text-xs font-medium text-slate-400">
              图层名称
            </label>
            <input
              type="text"
              value={layerName}
              onChange={(e) => setLayerName(e.target.value)}
              placeholder={t(`editor.layers.layerTypes.${selectedType}`)}
              className="w-full rounded bg-editor-hover px-3 py-2 text-sm text-white placeholder-slate-500 outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>
        </div>

        {/* 底部按钮 */}
        <div className="flex justify-end gap-2 border-t border-editor-border px-4 py-3">
          <button
            onClick={onClose}
            className="rounded px-4 py-1.5 text-sm text-slate-400 hover:bg-editor-hover hover:text-white"
          >
            {t('common.cancel')}
          </button>
          <button
            onClick={handleAdd}
            className="rounded bg-primary-600 px-4 py-1.5 text-sm text-white hover:bg-primary-700"
          >
            {t('editor.layers.addLayer')}
          </button>
        </div>
      </div>
    </div>
  );
}

export default AddLayerModal;
