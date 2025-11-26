/**
 * 编辑器属性面板组件
 * 显示选中元素的属性编辑器
 */
import { useState, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight, MapPin, Video, Type, Hexagon } from 'lucide-react';

import { PropertyEditor, type PropertyGroup } from './PropertyEditor';
import { useEditorStore } from '@/stores/editorStore';

/** 属性面板属性 */
interface EditorPropertiesProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

/** 模拟选中元素数据 */
interface SelectedElement {
  id: string;
  type: 'marker' | 'camera' | 'label' | 'path';
  name: string;
  properties: Record<string, unknown>;
}

export function EditorProperties({ isCollapsed, onToggle }: EditorPropertiesProps) {
  const { t } = useTranslation();
  const { selection } = useEditorStore();
  const selectedId = selection.length > 0 ? selection[0]?.id : null;

  // 模拟选中元素（实际应从 store 获取）
  const [selectedElement, setSelectedElement] = useState<SelectedElement | null>(
    selectedId
      ? {
          id: selectedId,
          type: 'marker',
          name: '城市标记',
          properties: {
            x: 116.4074,
            y: 39.9042,
            scale: 1,
            rotation: 0,
            opacity: 100,
            color: '#3b82f6',
            label: '北京',
            showLabel: true,
          },
        }
      : null
  );

  // 根据元素类型生成属性组
  const propertyGroups = useMemo<PropertyGroup[]>(() => {
    if (!selectedElement) return [];

    const groups: PropertyGroup[] = [];

    // 基础变换属性
    groups.push({
      id: 'transform',
      title: '变换',
      expanded: true,
      properties: [
        {
          id: 'position',
          label: '位置',
          type: 'position',
          value: { x: selectedElement.properties.x as number, y: selectedElement.properties.y as number },
        },
        {
          id: 'scale',
          label: '缩放',
          type: 'slider',
          value: selectedElement.properties.scale as number,
          min: 0.1,
          max: 5,
          step: 0.1,
        },
        {
          id: 'rotation',
          label: '旋转',
          type: 'number',
          value: selectedElement.properties.rotation as number,
          min: -360,
          max: 360,
          unit: '°',
        },
        {
          id: 'opacity',
          label: '透明度',
          type: 'slider',
          value: selectedElement.properties.opacity as number,
          min: 0,
          max: 100,
          unit: '%',
        },
      ],
    });

    // 样式属性
    groups.push({
      id: 'style',
      title: '样式',
      expanded: true,
      properties: [
        {
          id: 'color',
          label: '颜色',
          type: 'color',
          value: selectedElement.properties.color as string,
        },
      ],
    });

    // 标记特有属性
    if (selectedElement.type === 'marker') {
      groups.push({
        id: 'marker',
        title: '标记设置',
        expanded: true,
        properties: [
          {
            id: 'label',
            label: '标签文本',
            type: 'text',
            value: selectedElement.properties.label as string,
          },
          {
            id: 'showLabel',
            label: '显示标签',
            type: 'toggle',
            value: selectedElement.properties.showLabel as boolean,
          },
          {
            id: 'icon',
            label: '图标',
            type: 'select',
            value: 'pin',
            options: [
              { label: '图钉', value: 'pin' },
              { label: '圆点', value: 'dot' },
              { label: '星星', value: 'star' },
              { label: '方块', value: 'square' },
            ],
          },
        ],
      });
    }

    // 镜头特有属性
    if (selectedElement.type === 'camera') {
      groups.push({
        id: 'camera',
        title: '镜头设置',
        expanded: true,
        properties: [
          {
            id: 'zoom',
            label: '缩放级别',
            type: 'slider',
            value: 12,
            min: 1,
            max: 20,
            step: 0.5,
          },
          {
            id: 'bearing',
            label: '方位角',
            type: 'number',
            value: 0,
            min: -180,
            max: 180,
            unit: '°',
          },
          {
            id: 'pitch',
            label: '俯仰角',
            type: 'slider',
            value: 0,
            min: 0,
            max: 85,
            unit: '°',
          },
        ],
      });
    }

    // 动画属性
    groups.push({
      id: 'animation',
      title: '动画',
      expanded: false,
      properties: [
        {
          id: 'duration',
          label: '持续时间',
          type: 'number',
          value: 1000,
          min: 0,
          step: 100,
          unit: 'ms',
        },
        {
          id: 'delay',
          label: '延迟',
          type: 'number',
          value: 0,
          min: 0,
          step: 100,
          unit: 'ms',
        },
        {
          id: 'easing',
          label: '缓动函数',
          type: 'select',
          value: 'easeInOut',
          options: [
            { label: '线性', value: 'linear' },
            { label: '缓入', value: 'easeIn' },
            { label: '缓出', value: 'easeOut' },
            { label: '缓入缓出', value: 'easeInOut' },
            { label: '弹性', value: 'elastic' },
            { label: '弹跳', value: 'bounce' },
          ],
        },
      ],
    });

    return groups;
  }, [selectedElement]);

  // 属性变更处理
  const handlePropertyChange = useCallback((propertyId: string, value: unknown) => {
    setSelectedElement((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        properties: {
          ...prev.properties,
          [propertyId]: value,
        },
      };
    });
    console.log('属性变更:', propertyId, value);
  }, []);

  // 获取元素类型图标
  const getTypeIcon = (type: SelectedElement['type']) => {
    switch (type) {
      case 'marker':
        return <MapPin className="h-4 w-4" />;
      case 'camera':
        return <Video className="h-4 w-4" />;
      case 'label':
        return <Type className="h-4 w-4" />;
      case 'path':
        return <Hexagon className="h-4 w-4" />;
      default:
        return <MapPin className="h-4 w-4" />;
    }
  };

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
      <div className="flex-1 overflow-y-auto">
        {selectedElement ? (
          <>
            {/* 选中元素信息 */}
            <div className="flex items-center gap-2 border-b border-editor-border px-4 py-3">
              <div className="flex h-8 w-8 items-center justify-center rounded bg-primary-600 text-white">
                {getTypeIcon(selectedElement.type)}
              </div>
              <div>
                <div className="text-sm font-medium text-white">{selectedElement.name}</div>
                <div className="text-xs text-slate-500">ID: {selectedElement.id}</div>
              </div>
            </div>

            {/* 属性编辑器 */}
            <div className="p-2">
              <PropertyEditor
                groups={propertyGroups}
                onChange={handlePropertyChange}
              />
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-editor-panel">
              <MapPin className="h-6 w-6 text-slate-500" />
            </div>
            <p className="text-sm text-slate-400">选择一个元素</p>
            <p className="text-xs text-slate-500">以查看和编辑属性</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default EditorProperties;
