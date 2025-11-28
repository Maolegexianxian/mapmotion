/**
 * 编辑器属性面板组件
 * 显示和编辑选中元素的属性
 * 
 * @description
 * 属性面板采用简化设计，突出核心功能：
 * - 上下文感知：根据选中元素类型显示不同属性
 * - 分组展示：清晰的属性分类
 * - 快速操作：常用操作一键访问
 * - 流畅交互：滑块、拾色器等友好控件
 */
import { useState, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronRight,
  Move,
  RotateCw,
  Video,
  Sliders,
  ChevronDown,
  ChevronUp,
  Info,
  Copy,
  Trash2,
  Lock,
  type LucideIcon,
} from 'lucide-react';

import { useEditorStore } from '@/stores/editorStore';
import { useProjectStore } from '@/stores/projectStore';

/** 属性面板属性接口 */
interface EditorPropertiesProps {
  /** 是否折叠 */
  isCollapsed: boolean;
  /** 折叠状态切换回调 */
  onToggle: () => void;
}

/** 属性分组接口 */
interface PropertyGroup {
  /** 分组标识 */
  id: string;
  /** 分组标题国际化键 */
  titleKey: string;
  /** 分组图标 */
  icon: LucideIcon;
  /** 是否默认展开 */
  defaultExpanded: boolean;
  /** 属性列表 */
  properties: PropertyItem[];
}

/** 属性项接口 */
interface PropertyItem {
  /** 属性标识 */
  id: string;
  /** 属性标签国际化键 */
  labelKey: string;
  /** 属性类型 */
  type: 'text' | 'number' | 'slider' | 'color' | 'select' | 'toggle' | 'coordinate';
  /** 当前值 */
  value: unknown;
  /** 值变更回调 */
  onChange: (value: unknown) => void;
  /** 最小值（数字类型） */
  min?: number;
  /** 最大值（数字类型） */
  max?: number;
  /** 步长（数字类型） */
  step?: number;
  /** 单位 */
  unit?: string;
  /** 选项（选择类型） */
  options?: Array<{ value: string; labelKey: string }>;
  /** 是否禁用 */
  disabled?: boolean;
}

/**
 * EditorProperties - 编辑器属性面板组件
 * 
 * @param props - 组件属性
 * @returns 属性面板 React 组件
 */
export function EditorProperties({ isCollapsed, onToggle }: EditorPropertiesProps) {
  const { t } = useTranslation();
  
  /** 编辑器状态 */
  const { selection } = useEditorStore();
  
  /** 项目状态 */
  const { currentProject, updateScene, currentSceneIndex } = useProjectStore();
  
  /** 展开的分组列表 */
  const [expandedGroups, setExpandedGroups] = useState<string[]>(['transform', 'appearance']);

  /**
   * 获取当前场景
   */
  const currentScene = useMemo(() => {
    return currentProject?.scenes?.[currentSceneIndex];
  }, [currentProject, currentSceneIndex]);

  /**
   * 切换分组展开状态
   * @param groupId - 分组标识
   */
  const toggleGroup = useCallback((groupId: string) => {
    setExpandedGroups(prev => 
      prev.includes(groupId) 
        ? prev.filter(id => id !== groupId)
        : [...prev, groupId]
    );
  }, []);

  /**
   * 获取属性分组配置
   * 根据选中元素类型返回对应的属性配置
   */
  const propertyGroups: PropertyGroup[] = useMemo(() => {
    // 默认显示场景属性
    const sceneGroups: PropertyGroup[] = [
      {
        id: 'scene',
        titleKey: 'properties.scene',
        icon: Video,
        defaultExpanded: true,
        properties: [
          {
            id: 'sceneName',
            labelKey: 'properties.sceneName',
            type: 'text',
            value: currentScene?.name || '',
            onChange: (value) => {
              if (currentScene) {
                updateScene(currentSceneIndex, { name: value as string });
              }
            },
          },
          {
            id: 'duration',
            labelKey: 'properties.duration',
            type: 'number',
            value: (currentScene?.durationMs || 10000) / 1000,
            onChange: (value) => {
              if (currentScene) {
                updateScene(currentSceneIndex, { durationMs: (value as number) * 1000 });
              }
            },
            min: 1,
            max: 300,
            step: 0.5,
            unit: 's',
          },
        ],
      },
      {
        id: 'camera',
        titleKey: 'properties.camera',
        icon: Video,
        defaultExpanded: true,
        properties: [
          {
            id: 'cameraZoom',
            labelKey: 'properties.zoom',
            type: 'slider',
            value: currentScene?.cameraDefaults?.zoom || 10,
            onChange: (value) => {
              if (currentScene) {
                updateScene(currentSceneIndex, {
                  cameraDefaults: {
                    ...currentScene.cameraDefaults,
                    zoom: value as number,
                  },
                });
              }
            },
            min: 0,
            max: 22,
            step: 0.1,
          },
          {
            id: 'cameraPitch',
            labelKey: 'properties.pitch',
            type: 'slider',
            value: currentScene?.cameraDefaults?.pitch || 0,
            onChange: (value) => {
              if (currentScene) {
                updateScene(currentSceneIndex, {
                  cameraDefaults: {
                    ...currentScene.cameraDefaults,
                    pitch: value as number,
                  },
                });
              }
            },
            min: 0,
            max: 85,
            step: 1,
            unit: '°',
          },
          {
            id: 'cameraBearing',
            labelKey: 'properties.bearing',
            type: 'slider',
            value: currentScene?.cameraDefaults?.bearing || 0,
            onChange: (value) => {
              if (currentScene) {
                updateScene(currentSceneIndex, {
                  cameraDefaults: {
                    ...currentScene.cameraDefaults,
                    bearing: value as number,
                  },
                });
              }
            },
            min: -180,
            max: 180,
            step: 1,
            unit: '°',
          },
        ],
      },
      {
        id: 'transform',
        titleKey: 'properties.transform',
        icon: Move,
        defaultExpanded: false,
        properties: [
          {
            id: 'longitude',
            labelKey: 'properties.longitude',
            type: 'number',
            value: currentScene?.cameraDefaults?.center?.longitude || 0,
            onChange: (value) => {
              if (currentScene) {
                updateScene(currentSceneIndex, {
                  cameraDefaults: {
                    ...currentScene.cameraDefaults,
                    center: {
                      ...currentScene.cameraDefaults.center,
                      longitude: value as number,
                    },
                  },
                });
              }
            },
            min: -180,
            max: 180,
            step: 0.0001,
          },
          {
            id: 'latitude',
            labelKey: 'properties.latitude',
            type: 'number',
            value: currentScene?.cameraDefaults?.center?.latitude || 0,
            onChange: (value) => {
              if (currentScene) {
                updateScene(currentSceneIndex, {
                  cameraDefaults: {
                    ...currentScene.cameraDefaults,
                    center: {
                      ...currentScene.cameraDefaults.center,
                      latitude: value as number,
                    },
                  },
                });
              }
            },
            min: -90,
            max: 90,
            step: 0.0001,
          },
        ],
      },
    ];

    return sceneGroups;
  }, [currentScene, currentSceneIndex, updateScene]);

  /**
   * 渲染属性输入控件
   * @param property - 属性配置
   */
  const renderPropertyInput = useCallback((property: PropertyItem) => {
    const baseInputClass = `
      w-full rounded-md border border-white/10 bg-white/5 px-2.5 py-1.5
      text-sm text-slate-200 placeholder-slate-500
      transition-all focus:border-primary-500/50 focus:bg-white/10 focus:outline-none focus:ring-1 focus:ring-primary-500/20
      disabled:opacity-50 disabled:cursor-not-allowed
    `;

    switch (property.type) {
      case 'text':
        return (
          <input
            type="text"
            value={property.value as string}
            onChange={(e) => property.onChange(e.target.value)}
            className={baseInputClass}
            disabled={property.disabled}
          />
        );

      case 'number':
        return (
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={property.value as number}
              onChange={(e) => property.onChange(parseFloat(e.target.value) || 0)}
              min={property.min}
              max={property.max}
              step={property.step}
              className={`${baseInputClass} flex-1`}
              disabled={property.disabled}
            />
            {property.unit && (
              <span className="text-xs text-slate-500">{property.unit}</span>
            )}
          </div>
        );

      case 'slider':
        return (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <input
                type="range"
                value={property.value as number}
                onChange={(e) => property.onChange(parseFloat(e.target.value))}
                min={property.min}
                max={property.max}
                step={property.step}
                className="flex-1 h-1.5 rounded-full appearance-none bg-slate-700 cursor-pointer
                  [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-3.5 
                  [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:rounded-full 
                  [&::-webkit-slider-thumb]:bg-primary-500 [&::-webkit-slider-thumb]:cursor-pointer
                  [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:transition-all
                  [&::-webkit-slider-thumb]:hover:bg-primary-400"
                disabled={property.disabled}
              />
              <span className="ml-3 min-w-[4rem] text-right text-sm text-slate-300">
                {(property.value as number).toFixed(property.step && property.step < 1 ? 1 : 0)}
                {property.unit || ''}
              </span>
            </div>
          </div>
        );

      case 'color':
        return (
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={property.value as string}
              onChange={(e) => property.onChange(e.target.value)}
              className="h-7 w-7 cursor-pointer rounded border border-white/10 bg-transparent"
              disabled={property.disabled}
            />
            <input
              type="text"
              value={property.value as string}
              onChange={(e) => property.onChange(e.target.value)}
              className={`${baseInputClass} flex-1 font-mono text-xs`}
              disabled={property.disabled}
            />
          </div>
        );

      case 'select':
        return (
          <select
            value={property.value as string}
            onChange={(e) => property.onChange(e.target.value)}
            className={`${baseInputClass} cursor-pointer`}
            disabled={property.disabled}
          >
            {property.options?.map(option => (
              <option key={option.value} value={option.value}>
                {t(option.labelKey)}
              </option>
            ))}
          </select>
        );

      case 'toggle':
        return (
          <button
            onClick={() => property.onChange(!(property.value as boolean))}
            className={`
              relative h-6 w-11 rounded-full transition-colors duration-200
              ${(property.value as boolean) ? 'bg-primary-600' : 'bg-slate-600'}
              ${property.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
            disabled={property.disabled}
          >
            <span
              className={`
                absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow-sm
                transition-transform duration-200
                ${(property.value as boolean) ? 'translate-x-5' : 'translate-x-0'}
              `}
            />
          </button>
        );

      default:
        return null;
    }
  }, [t]);

  /**
   * 渲染属性分组
   * @param group - 分组配置
   */
  const renderPropertyGroup = useCallback((group: PropertyGroup) => {
    const Icon = group.icon;
    const isExpanded = expandedGroups.includes(group.id);

    return (
      <div key={group.id} className="border-b border-white/5">
        {/* 分组标题 */}
        <button
          onClick={() => toggleGroup(group.id)}
          className="flex w-full items-center justify-between px-3 py-2.5 text-left transition-colors hover:bg-white/5"
        >
          <div className="flex items-center gap-2">
            <Icon className="h-4 w-4 text-slate-400" />
            <span className="text-sm font-medium text-slate-200">
              {t(group.titleKey)}
            </span>
          </div>
          {isExpanded ? (
            <ChevronUp className="h-4 w-4 text-slate-400" />
          ) : (
            <ChevronDown className="h-4 w-4 text-slate-400" />
          )}
        </button>

        {/* 分组内容 */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="overflow-hidden"
            >
              <div className="space-y-3 px-3 pb-3">
                {group.properties.map(property => (
                  <div key={property.id}>
                    <label className="mb-1 block text-[11px] font-medium text-slate-500 uppercase tracking-wide">
                      {t(property.labelKey)}
                    </label>
                    {renderPropertyInput(property)}
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }, [expandedGroups, toggleGroup, t, renderPropertyInput]);

  return (
    <aside
      className="flex h-full flex-col border-l border-white/5 bg-[#0a0a0b] overflow-hidden w-full"
    >

      <AnimatePresence>
        {!isCollapsed && (
          <motion.div
            className="flex h-full flex-col w-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {/* 面板标题栏 - 简化设计 */}
            <div className="flex h-10 items-center justify-between border-b border-white/5 px-3 bg-white/5 shrink-0">
              <div className="flex items-center gap-2">
                <Sliders className="h-3.5 w-3.5 text-primary-400" />
                <h2 className="text-xs font-semibold text-slate-200 uppercase tracking-wide">
                  {t('properties.title')}
                </h2>
              </div>
              
              {/* 折叠按钮 */}
              <button
                onClick={onToggle}
                className="flex h-6 w-6 items-center justify-center rounded text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
                title={t('properties.collapse')}
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* 选中信息 - 更简洁 */}
            <div className="flex items-center gap-2 border-b border-white/5 px-3 py-2 bg-slate-900/50">
              <Info className="h-3.5 w-3.5 text-slate-500" />
              <span className="text-xs text-slate-400">
                {selection.length > 0 
                  ? `${selection.length} ${t('properties.itemsSelected')}`
                  : t('properties.sceneProperties')
                }
              </span>
            </div>

            {/* 属性列表 */}
            <div className="flex-1 overflow-y-auto scrollbar-thin">
              {propertyGroups.map(renderPropertyGroup)}
            </div>

            {/* 底部快捷操作 - 更紧凑 */}
            <div className="border-t border-white/5 p-2 shrink-0 flex items-center justify-between">
              <span className="text-[10px] text-slate-600 uppercase tracking-wider">
                {t('properties.quickActions')}
              </span>
              <div className="flex items-center gap-0.5">
                <button
                  className="flex h-6 w-6 items-center justify-center rounded text-slate-500 transition-colors hover:bg-white/10 hover:text-slate-300"
                  title={t('common.copy')}
                >
                  <Copy className="h-3 w-3" />
                </button>
                <button
                  className="flex h-6 w-6 items-center justify-center rounded text-slate-500 transition-colors hover:bg-white/10 hover:text-slate-300"
                  title={t('properties.lock')}
                >
                  <Lock className="h-3 w-3" />
                </button>
                <button
                  className="flex h-6 w-6 items-center justify-center rounded text-slate-500 transition-colors hover:bg-white/10 hover:text-slate-300"
                  title={t('properties.resetToDefault')}
                >
                  <RotateCw className="h-3 w-3" />
                </button>
                <button
                  className="flex h-6 w-6 items-center justify-center rounded text-slate-500 transition-colors hover:bg-error-500/20 hover:text-error-400"
                  title={t('common.delete')}
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </aside>
  );
}
