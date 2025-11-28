/**
 * 标签模板服务
 * 
 * @description
 * 提供标签模板管理功能，包括：
 * - 预设模板库
 * - 自定义模板创建
 * - 模板样式应用
 * - 模板导入导出
 * 
 * @module services/LabelTemplateService
 */

import type { LabelStyle } from '@/types/map';
import type { UniqueId } from '@/types/common';

/**
 * 扩展的标签样式（用于模板，支持更多 CSS 属性）
 */
export interface ExtendedLabelStyle extends Partial<LabelStyle> {
  /** 字体大小 */
  fontSize: number;
  /** 字体家族 */
  fontFamily?: string;
  /** 字体粗细 */
  fontWeight: string | number;
  /** 字体样式 */
  fontStyle?: string;
  /** 文字颜色 */
  color?: string;
  /** 文字颜色(别名) */
  textColor?: string;
  /** 背景颜色（支持渐变） */
  backgroundColor?: string;
  /** 边框半径 */
  borderRadius?: number;
  /** 内边距（CSS 格式） */
  padding?: number | [number, number] | [number, number, number, number];
  /** 边框配置 */
  border?: {
    width: number;
    color: string;
    style: 'solid' | 'dashed' | 'dotted';
  };
  /** 阴影 */
  boxShadow?: string;
  /** 文字转换 */
  textTransform?: string;
  /** 字母间距 */
  letterSpacing?: number;
}

/**
 * 标签动画配置
 */
export interface LabelAnimationConfig {
  /** 动画类型 */
  type: 'fadeIn' | 'slideIn' | 'scaleIn' | 'pulse' | 'glow';
  /** 动画时长 */
  duration: number;
  /** 缓动函数 */
  easing: string;
}

/**
 * 标签模板接口
 */
export interface LabelTemplate {
  /** 模板唯一标识 */
  id: UniqueId;
  /** 模板名称 */
  name: string;
  /** 模板描述 */
  description: string;
  /** 模板分类 */
  category: LabelTemplateCategory;
  /** 缩略图 URL */
  thumbnailUrl?: string;
  /** 标签样式配置 */
  style: ExtendedLabelStyle;
  /** 动画配置 */
  animation?: LabelAnimationConfig;
  /** 是否为预设模板 */
  isPreset: boolean;
  /** 是否收藏 */
  isFavorite?: boolean;
  /** 创建时间 */
  createdAt?: number;
  /** 更新时间 */
  updatedAt?: number;
}

/**
 * 模板分类枚举
 */
export type LabelTemplateCategory =
  | 'basic'      // 基础样式
  | 'modern'     // 现代风格
  | 'classic'    // 经典风格
  | 'minimal'    // 极简风格
  | 'bold'       // 醒目风格
  | 'elegant'    // 优雅风格
  | 'tech'       // 科技风格
  | 'custom';    // 自定义

/**
 * 预设标签模板列表
 */
const PRESET_TEMPLATES: LabelTemplate[] = [
  {
    id: 'preset-basic-white',
    name: '基础白底',
    description: '简洁的白色背景标签，适合大多数场景',
    category: 'basic',
    style: {
      fontSize: 14,
      fontFamily: 'Inter, sans-serif',
      fontWeight: 500,
      color: '#1F2937',
      backgroundColor: '#FFFFFF',
      borderRadius: 4,
      padding: [6, 12, 6, 12],
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    },
    isPreset: true,
  },
  {
    id: 'preset-basic-dark',
    name: '基础深色',
    description: '深色背景标签，适合浅色地图',
    category: 'basic',
    style: {
      fontSize: 14,
      fontFamily: 'Inter, sans-serif',
      fontWeight: 500,
      color: '#FFFFFF',
      backgroundColor: '#1F2937',
      borderRadius: 4,
      padding: [6, 12, 6, 12],
      boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
    },
    isPreset: true,
  },
  {
    id: 'preset-modern-blue',
    name: '现代蓝',
    description: '现代风格的蓝色渐变标签',
    category: 'modern',
    style: {
      fontSize: 14,
      fontFamily: 'Inter, sans-serif',
      fontWeight: 600,
      color: '#FFFFFF',
      backgroundColor: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
      borderRadius: 8,
      padding: [8, 16, 8, 16],
      boxShadow: '0 4px 12px rgba(59,130,246,0.4)',
    },
    animation: {
      type: 'fadeIn',
      duration: 300,
      easing: 'easeOut',
    },
    isPreset: true,
  },
  {
    id: 'preset-modern-green',
    name: '现代绿',
    description: '现代风格的绿色渐变标签',
    category: 'modern',
    style: {
      fontSize: 14,
      fontFamily: 'Inter, sans-serif',
      fontWeight: 600,
      color: '#FFFFFF',
      backgroundColor: 'linear-gradient(135deg, #22C55E 0%, #16A34A 100%)',
      borderRadius: 8,
      padding: [8, 16, 8, 16],
      boxShadow: '0 4px 12px rgba(34,197,94,0.4)',
    },
    animation: {
      type: 'fadeIn',
      duration: 300,
      easing: 'easeOut',
    },
    isPreset: true,
  },
  {
    id: 'preset-minimal-line',
    name: '极简线条',
    description: '极简风格，仅有底部边框',
    category: 'minimal',
    style: {
      fontSize: 13,
      fontFamily: 'Inter, sans-serif',
      fontWeight: 400,
      color: '#374151',
      backgroundColor: 'transparent',
      borderRadius: 0,
      padding: [4, 8, 4, 8],
      border: {
        width: 0,
        color: 'transparent',
        style: 'solid',
      },
    },
    isPreset: true,
  },
  {
    id: 'preset-minimal-pill',
    name: '极简胶囊',
    description: '胶囊形状的极简标签',
    category: 'minimal',
    style: {
      fontSize: 12,
      fontFamily: 'Inter, sans-serif',
      fontWeight: 500,
      color: '#6B7280',
      backgroundColor: '#F3F4F6',
      borderRadius: 100,
      padding: [4, 12, 4, 12],
    },
    isPreset: true,
  },
  {
    id: 'preset-bold-red',
    name: '醒目红',
    description: '醒目的红色标签，用于重要标注',
    category: 'bold',
    style: {
      fontSize: 16,
      fontFamily: 'Inter, sans-serif',
      fontWeight: 700,
      color: '#FFFFFF',
      backgroundColor: '#EF4444',
      borderRadius: 6,
      padding: [10, 20, 10, 20],
      boxShadow: '0 4px 12px rgba(239,68,68,0.5)',
    },
    animation: {
      type: 'pulse',
      duration: 1500,
      easing: 'easeInOut',
    },
    isPreset: true,
  },
  {
    id: 'preset-bold-orange',
    name: '醒目橙',
    description: '醒目的橙色标签',
    category: 'bold',
    style: {
      fontSize: 16,
      fontFamily: 'Inter, sans-serif',
      fontWeight: 700,
      color: '#FFFFFF',
      backgroundColor: '#F97316',
      borderRadius: 6,
      padding: [10, 20, 10, 20],
      boxShadow: '0 4px 12px rgba(249,115,22,0.5)',
    },
    isPreset: true,
  },
  {
    id: 'preset-elegant-serif',
    name: '优雅衬线',
    description: '优雅的衬线字体标签',
    category: 'elegant',
    style: {
      fontSize: 15,
      fontFamily: '"Playfair Display", Georgia, serif',
      fontWeight: 400,
      fontStyle: 'italic',
      color: '#1F2937',
      backgroundColor: '#FFFBEB',
      borderRadius: 2,
      padding: [8, 16, 8, 16],
      border: {
        width: 1,
        color: '#D4AF37',
        style: 'solid',
      },
    },
    isPreset: true,
  },
  {
    id: 'preset-elegant-gold',
    name: '优雅金',
    description: '金色边框的优雅标签',
    category: 'elegant',
    style: {
      fontSize: 14,
      fontFamily: 'Inter, sans-serif',
      fontWeight: 500,
      color: '#92400E',
      backgroundColor: 'linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)',
      borderRadius: 4,
      padding: [8, 16, 8, 16],
      border: {
        width: 2,
        color: '#D4AF37',
        style: 'solid',
      },
      boxShadow: '0 2px 8px rgba(212,175,55,0.3)',
    },
    isPreset: true,
  },
  {
    id: 'preset-tech-neon',
    name: '科技霓虹',
    description: '霓虹风格的科技感标签',
    category: 'tech',
    style: {
      fontSize: 14,
      fontFamily: '"JetBrains Mono", monospace',
      fontWeight: 500,
      color: '#22D3EE',
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      borderRadius: 4,
      padding: [8, 16, 8, 16],
      border: {
        width: 1,
        color: '#22D3EE',
        style: 'solid',
      },
      boxShadow: '0 0 20px rgba(34,211,238,0.5), inset 0 0 20px rgba(34,211,238,0.1)',
    },
    animation: {
      type: 'glow',
      duration: 2000,
      easing: 'linear',
    },
    isPreset: true,
  },
  {
    id: 'preset-tech-matrix',
    name: '科技矩阵',
    description: '矩阵风格的科技感标签',
    category: 'tech',
    style: {
      fontSize: 14,
      fontFamily: '"JetBrains Mono", monospace',
      fontWeight: 600,
      color: '#22C55E',
      backgroundColor: 'rgba(0, 0, 0, 0.9)',
      borderRadius: 0,
      padding: [8, 16, 8, 16],
      border: {
        width: 1,
        color: '#22C55E',
        style: 'solid',
      },
    },
    isPreset: true,
  },
  {
    id: 'preset-classic-badge',
    name: '经典徽章',
    description: '经典的徽章样式标签',
    category: 'classic',
    style: {
      fontSize: 12,
      fontFamily: 'Inter, sans-serif',
      fontWeight: 600,
      textTransform: 'uppercase',
      letterSpacing: 1,
      color: '#FFFFFF',
      backgroundColor: '#4B5563',
      borderRadius: 100,
      padding: [4, 10, 4, 10],
    },
    isPreset: true,
  },
  {
    id: 'preset-classic-outline',
    name: '经典描边',
    description: '经典的描边样式标签',
    category: 'classic',
    style: {
      fontSize: 14,
      fontFamily: 'Inter, sans-serif',
      fontWeight: 500,
      color: '#374151',
      backgroundColor: 'transparent',
      borderRadius: 4,
      padding: [6, 12, 6, 12],
      border: {
        width: 2,
        color: '#374151',
        style: 'solid',
      },
    },
    isPreset: true,
  },
];

/**
 * 标签模板服务类
 */
export class LabelTemplateService {
  /** 单例实例 */
  private static instance: LabelTemplateService | null = null;
  
  /** 自定义模板存储 */
  private customTemplates: Map<string, LabelTemplate> = new Map();
  
  /** 收藏模板 ID 列表 */
  private favoriteIds: Set<string> = new Set();

  /**
   * 私有构造函数
   */
  private constructor() {
    this.loadFromStorage();
  }

  /**
   * 获取服务单例
   */
  public static getInstance(): LabelTemplateService {
    if (!LabelTemplateService.instance) {
      LabelTemplateService.instance = new LabelTemplateService();
    }
    return LabelTemplateService.instance;
  }

  /**
   * 获取所有预设模板
   */
  public getPresetTemplates(): LabelTemplate[] {
    return PRESET_TEMPLATES.map(t => ({
      ...t,
      isFavorite: this.favoriteIds.has(t.id),
    }));
  }

  /**
   * 获取所有自定义模板
   */
  public getCustomTemplates(): LabelTemplate[] {
    return Array.from(this.customTemplates.values());
  }

  /**
   * 获取所有模板
   */
  public getAllTemplates(): LabelTemplate[] {
    return [...this.getPresetTemplates(), ...this.getCustomTemplates()];
  }

  /**
   * 按分类获取模板
   */
  public getTemplatesByCategory(category: LabelTemplateCategory): LabelTemplate[] {
    return this.getAllTemplates().filter(t => t.category === category);
  }

  /**
   * 获取收藏的模板
   */
  public getFavoriteTemplates(): LabelTemplate[] {
    return this.getAllTemplates().filter(t => this.favoriteIds.has(t.id));
  }

  /**
   * 根据 ID 获取模板
   */
  public getTemplate(id: string): LabelTemplate | null {
    const preset = PRESET_TEMPLATES.find(t => t.id === id);
    if (preset) {
      return { ...preset, isFavorite: this.favoriteIds.has(id) };
    }
    return this.customTemplates.get(id) ?? null;
  }

  /**
   * 创建自定义模板
   */
  public createTemplate(
    name: string,
    style: ExtendedLabelStyle,
    options: {
      description?: string;
      category?: LabelTemplateCategory;
      animation?: LabelAnimationConfig;
    } = {}
  ): LabelTemplate {
    const template: LabelTemplate = {
      id: `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name,
      description: options.description ?? '',
      category: options.category ?? 'custom',
      style,
      isPreset: false,
      isFavorite: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    // 条件添加可选属性
    if (options.animation) {
      template.animation = options.animation;
    }

    this.customTemplates.set(template.id, template);
    this.saveToStorage();

    return template;
  }

  /**
   * 更新自定义模板
   */
  public updateTemplate(id: string, updates: Partial<LabelTemplate>): boolean {
    const template = this.customTemplates.get(id);
    if (!template) {
      return false;
    }

    const updated = {
      ...template,
      ...updates,
      id: template.id, // 防止修改 ID
      isPreset: false, // 自定义模板不能变为预设
      updatedAt: Date.now(),
    };

    this.customTemplates.set(id, updated);
    this.saveToStorage();

    return true;
  }

  /**
   * 删除自定义模板
   */
  public deleteTemplate(id: string): boolean {
    if (!this.customTemplates.has(id)) {
      return false;
    }

    this.customTemplates.delete(id);
    this.favoriteIds.delete(id);
    this.saveToStorage();

    return true;
  }

  /**
   * 切换收藏状态
   */
  public toggleFavorite(id: string): boolean {
    if (this.favoriteIds.has(id)) {
      this.favoriteIds.delete(id);
    } else {
      this.favoriteIds.add(id);
    }

    // 更新自定义模板的收藏状态
    const customTemplate = this.customTemplates.get(id);
    if (customTemplate) {
      customTemplate.isFavorite = this.favoriteIds.has(id);
    }

    this.saveToStorage();
    return this.favoriteIds.has(id);
  }

  /**
   * 从模板创建标签配置
   */
  public createLabelConfig(
    templateId: string,
    text: string,
    overrides?: Partial<ExtendedLabelStyle>
  ): { id: string; text: string; style: ExtendedLabelStyle; animation?: LabelAnimationConfig; visible: boolean; priority: number } | null {
    const template = this.getTemplate(templateId);
    if (!template) {
      return null;
    }

    const result: { id: string; text: string; style: ExtendedLabelStyle; animation?: LabelAnimationConfig; visible: boolean; priority: number } = {
      id: `label-${Date.now()}`,
      text,
      style: {
        ...template.style,
        ...overrides,
      },
      visible: true,
      priority: 0,
    };

    if (template.animation) {
      result.animation = template.animation;
    }

    return result;
  }

  /**
   * 复制模板
   */
  public duplicateTemplate(id: string, newName?: string): LabelTemplate | null {
    const source = this.getTemplate(id);
    if (!source) {
      return null;
    }

    const options: { description?: string; category?: LabelTemplateCategory; animation?: LabelAnimationConfig } = {
      description: source.description,
      category: source.isPreset ? 'custom' : source.category,
    };
    
    if (source.animation) {
      options.animation = { ...source.animation };
    }

    return this.createTemplate(
      newName ?? `${source.name} (副本)`,
      { ...source.style },
      options
    );
  }

  /**
   * 导出模板为 JSON
   */
  public exportTemplates(ids?: string[]): string {
    const templates = ids
      ? ids.map(id => this.getTemplate(id)).filter((t): t is LabelTemplate => t !== null)
      : this.getCustomTemplates();

    return JSON.stringify(templates, null, 2);
  }

  /**
   * 从 JSON 导入模板
   */
  public importTemplates(json: string): LabelTemplate[] {
    try {
      const templates = JSON.parse(json) as LabelTemplate[];
      const imported: LabelTemplate[] = [];

      for (const template of templates) {
        if (template.style) {
          const opts: { description?: string; category?: LabelTemplateCategory; animation?: LabelAnimationConfig } = {
            description: template.description,
            category: template.category ?? 'custom',
          };
          if (template.animation) {
            opts.animation = template.animation;
          }
          const newTemplate = this.createTemplate(
            template.name,
            template.style,
            opts
          );
          imported.push(newTemplate);
        }
      }

      return imported;
    } catch (error) {
      console.error('[LabelTemplateService] 导入模板失败:', error);
      return [];
    }
  }

  /**
   * 从本地存储加载
   */
  private loadFromStorage(): void {
    try {
      const data = localStorage.getItem('mapmotion:label-templates');
      if (data) {
        const parsed = JSON.parse(data);
        if (parsed.customTemplates) {
          for (const template of parsed.customTemplates) {
            this.customTemplates.set(template.id, template);
          }
        }
        if (parsed.favoriteIds) {
          this.favoriteIds = new Set(parsed.favoriteIds);
        }
      }
    } catch (error) {
      console.error('[LabelTemplateService] 加载存储失败:', error);
    }
  }

  /**
   * 保存到本地存储
   */
  private saveToStorage(): void {
    try {
      const data = {
        customTemplates: Array.from(this.customTemplates.values()),
        favoriteIds: Array.from(this.favoriteIds),
      };
      localStorage.setItem('mapmotion:label-templates', JSON.stringify(data));
    } catch (error) {
      console.error('[LabelTemplateService] 保存存储失败:', error);
    }
  }

  /**
   * 清除所有自定义模板
   */
  public clearCustomTemplates(): void {
    this.customTemplates.clear();
    this.saveToStorage();
  }

  /**
   * 销毁服务
   */
  public destroy(): void {
    this.customTemplates.clear();
    this.favoriteIds.clear();
    LabelTemplateService.instance = null;
  }
}

/**
 * 导出服务单例
 */
export const labelTemplateService = LabelTemplateService.getInstance();

export default LabelTemplateService;
