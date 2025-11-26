/**
 * 标签渲染器
 * 负责将标签数据渲染为 DOM 元素或 Canvas
 */
import type { LabelConfig, LabelStyle, LabelTemplate, LabelAnchor } from '@/types';

/** 标签渲染选项 */
export interface LabelRenderOptions {
  /** 缩放比例 */
  scale?: number;
  /** 是否显示动画 */
  animated?: boolean;
  /** 动画持续时间 */
  animationDuration?: number;
}

/** 渲染后的标签信息 */
export interface RenderedLabel {
  /** 标签 ID */
  id: string;
  /** DOM 元素 */
  element: HTMLElement;
  /** 包围盒 */
  bounds: DOMRect;
  /** 原始配置 */
  config: LabelConfig;
  /** 屏幕位置 */
  screenPosition: { x: number; y: number };
}

/** 标签模板样式预设 */
const TEMPLATE_STYLES: Record<LabelTemplate, Partial<LabelStyle>> = {
  city: {
    fontSize: 14,
    fontWeight: 600,
    textColor: '#1a1a1a',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 4,
    padding: [6, 12],
    shadow: true,
  },
  poi: {
    fontSize: 12,
    fontWeight: 500,
    textColor: '#333333',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 6,
    padding: [4, 8],
    shadow: true,
  },
  annotation: {
    fontSize: 11,
    fontWeight: 400,
    textColor: '#666666',
    backgroundColor: 'transparent',
    padding: [2, 4],
    shadow: false,
  },
  callout: {
    fontSize: 13,
    fontWeight: 500,
    textColor: '#ffffff',
    backgroundColor: '#2563eb',
    borderRadius: 8,
    padding: [8, 14],
    shadow: true,
  },
  badge: {
    fontSize: 10,
    fontWeight: 700,
    textColor: '#ffffff',
    backgroundColor: '#ef4444',
    borderRadius: 12,
    padding: [4, 8],
    shadow: false,
  },
  custom: {
    fontSize: 12,
    fontWeight: 400,
    textColor: '#333333',
    backgroundColor: '#ffffff',
    borderRadius: 4,
    padding: [4, 8],
    shadow: false,
  },
};

/** 锚点偏移映射 */
const ANCHOR_OFFSETS: Record<LabelAnchor, { x: string; y: string }> = {
  center: { x: '-50%', y: '-50%' },
  top: { x: '-50%', y: '0%' },
  bottom: { x: '-50%', y: '-100%' },
  left: { x: '0%', y: '-50%' },
  right: { x: '-100%', y: '-50%' },
  'top-left': { x: '0%', y: '0%' },
  'top-right': { x: '-100%', y: '0%' },
  'bottom-left': { x: '0%', y: '-100%' },
  'bottom-right': { x: '-100%', y: '-100%' },
};

/**
 * LabelRenderer - 标签渲染器
 */
export class LabelRenderer {
  /** 容器元素 */
  private container: HTMLElement;
  
  /** 已渲染的标签映射 */
  private renderedLabels: Map<string, RenderedLabel> = new Map();
  
  /** 标签容器 */
  private labelContainer: HTMLElement;

  /**
   * 构造函数
   * @param container - 父容器元素
   */
  constructor(container: HTMLElement) {
    this.container = container;
    this.labelContainer = this.createLabelContainer();
    this.container.appendChild(this.labelContainer);
  }

  /**
   * 创建标签容器
   */
  private createLabelContainer(): HTMLElement {
    const div = document.createElement('div');
    div.className = 'label-container';
    div.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      overflow: hidden;
      z-index: 10;
    `;
    return div;
  }

  /**
   * 渲染标签
   * @param config - 标签配置
   * @param screenX - 屏幕 X 坐标
   * @param screenY - 屏幕 Y 坐标
   * @param options - 渲染选项
   */
  renderLabel(
    config: LabelConfig,
    screenX: number,
    screenY: number,
    options?: LabelRenderOptions
  ): RenderedLabel {
    const { scale = 1, animated = true, animationDuration = 200 } = options || {};
    
    // 获取或创建标签元素
    let label = this.renderedLabels.get(config.text);
    
    if (!label) {
      const element = this.createLabelElement(config, scale);
      this.labelContainer.appendChild(element);
      
      label = {
        id: config.text,
        element,
        bounds: element.getBoundingClientRect(),
        config,
        screenPosition: { x: screenX, y: screenY },
      };
      
      this.renderedLabels.set(config.text, label);
    }

    // 更新位置
    this.updateLabelPosition(label, screenX, screenY, animated, animationDuration);
    
    // 更新包围盒
    label.bounds = label.element.getBoundingClientRect();
    label.screenPosition = { x: screenX, y: screenY };

    return label;
  }

  /**
   * 创建标签 DOM 元素
   * @param config - 标签配置
   * @param scale - 缩放比例
   */
  private createLabelElement(config: LabelConfig, scale: number): HTMLElement {
    const { text, subtitle, template, style, anchor = 'bottom' } = config;
    
    // 合并模板样式和自定义样式
    const templateStyle = TEMPLATE_STYLES[template] || TEMPLATE_STYLES.custom;
    const mergedStyle: LabelStyle = {
      fontSize: 12,
      fontWeight: 400,
      textColor: '#333333',
      ...templateStyle,
      ...style,
    };

    const element = document.createElement('div');
    element.className = `map-label map-label-${template}`;
    element.setAttribute('data-label-id', text);
    
    // 基础样式
    element.style.cssText = `
      position: absolute;
      pointer-events: auto;
      cursor: pointer;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      white-space: nowrap;
      user-select: none;
      transition: transform 0.2s ease-out, opacity 0.2s ease-out;
      will-change: transform;
    `;

    // 应用样式
    this.applyLabelStyle(element, mergedStyle, scale);
    
    // 应用锚点偏移
    const anchorOffset = ANCHOR_OFFSETS[anchor] || ANCHOR_OFFSETS.bottom;
    element.style.transform = `translate(${anchorOffset.x}, ${anchorOffset.y}) scale(${scale})`;

    // 创建内容
    const content = this.createLabelContent(text, subtitle, mergedStyle);
    element.appendChild(content);

    return element;
  }

  /**
   * 应用标签样式
   * @param element - 标签元素
   * @param style - 样式配置
   * @param scale - 缩放比例
   */
  private applyLabelStyle(element: HTMLElement, style: LabelStyle, scale: number): void {
    element.style.fontSize = `${style.fontSize * scale}px`;
    element.style.fontWeight = String(style.fontWeight);
    element.style.color = typeof style.textColor === 'string' ? style.textColor : '#333333';
    
    if (style.backgroundColor) {
      element.style.backgroundColor = typeof style.backgroundColor === 'string' 
        ? style.backgroundColor 
        : '#ffffff';
    }
    
    if (style.borderColor) {
      element.style.borderColor = typeof style.borderColor === 'string' 
        ? style.borderColor 
        : 'transparent';
      element.style.borderWidth = `${style.borderWidth || 1}px`;
      element.style.borderStyle = 'solid';
    }
    
    if (style.borderRadius !== undefined) {
      element.style.borderRadius = `${style.borderRadius}px`;
    }
    
    // 处理 padding
    if (style.padding !== undefined) {
      if (typeof style.padding === 'number') {
        element.style.padding = `${style.padding}px`;
      } else if (Array.isArray(style.padding)) {
        const paddings = style.padding.map((p: number) => `${p}px`).join(' ');
        element.style.padding = paddings;
      }
    }
    
    if (style.shadow) {
      element.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.15)';
    }
  }

  /**
   * 创建标签内容
   * @param text - 主文本
   * @param subtitle - 副标题
   * @param style - 样式
   */
  private createLabelContent(text: string, subtitle?: string, style?: LabelStyle): HTMLElement {
    const wrapper = document.createElement('div');
    wrapper.style.cssText = 'display: flex; flex-direction: column; align-items: center;';

    // 图标（如果有）
    if (style?.iconUrl) {
      const icon = document.createElement('img');
      icon.src = style.iconUrl;
      icon.style.cssText = `
        width: 16px;
        height: 16px;
        margin-${style.iconPosition === 'right' ? 'left' : 'right'}: 4px;
      `;
      if (style.iconPosition === 'top') {
        icon.style.marginBottom = '4px';
        wrapper.appendChild(icon);
      }
    }

    // 主文本
    const mainText = document.createElement('span');
    mainText.textContent = text;
    mainText.style.lineHeight = '1.3';
    wrapper.appendChild(mainText);

    // 副标题
    if (subtitle) {
      const subText = document.createElement('span');
      subText.textContent = subtitle;
      subText.style.cssText = `
        font-size: 0.85em;
        opacity: 0.7;
        margin-top: 2px;
      `;
      wrapper.appendChild(subText);
    }

    return wrapper;
  }

  /**
   * 更新标签位置
   * @param label - 渲染的标签
   * @param x - X 坐标
   * @param y - Y 坐标
   * @param animated - 是否动画
   * @param duration - 动画时长
   */
  private updateLabelPosition(
    label: RenderedLabel,
    x: number,
    y: number,
    animated: boolean,
    duration: number
  ): void {
    const { element, config } = label;
    const anchor = config.anchor || 'bottom';
    const offset = config.offset || [0, 0];
    const anchorOffset = ANCHOR_OFFSETS[anchor] || ANCHOR_OFFSETS.bottom;

    const finalX = x + offset[0];
    const finalY = y + offset[1];

    element.style.transition = animated ? `left ${duration}ms ease-out, top ${duration}ms ease-out` : 'none';
    element.style.left = `${finalX}px`;
    element.style.top = `${finalY}px`;
    element.style.transform = `translate(${anchorOffset.x}, ${anchorOffset.y})`;
  }

  /**
   * 移除标签
   * @param labelId - 标签 ID
   */
  removeLabel(labelId: string): void {
    const label = this.renderedLabels.get(labelId);
    if (label) {
      label.element.remove();
      this.renderedLabels.delete(labelId);
    }
  }

  /**
   * 清除所有标签
   */
  clearAll(): void {
    this.renderedLabels.forEach(label => label.element.remove());
    this.renderedLabels.clear();
  }

  /**
   * 获取所有已渲染的标签
   */
  getRenderedLabels(): RenderedLabel[] {
    return Array.from(this.renderedLabels.values());
  }

  /**
   * 设置标签可见性
   * @param labelId - 标签 ID
   * @param visible - 是否可见
   */
  setLabelVisibility(labelId: string, visible: boolean): void {
    const label = this.renderedLabels.get(labelId);
    if (label) {
      label.element.style.opacity = visible ? '1' : '0';
      label.element.style.pointerEvents = visible ? 'auto' : 'none';
    }
  }

  /**
   * 批量更新标签位置
   * @param updates - 位置更新列表
   */
  batchUpdatePositions(updates: Array<{ id: string; x: number; y: number }>): void {
    updates.forEach(({ id, x, y }) => {
      const label = this.renderedLabels.get(id);
      if (label) {
        this.updateLabelPosition(label, x, y, false, 0);
        label.screenPosition = { x, y };
        label.bounds = label.element.getBoundingClientRect();
      }
    });
  }

  /**
   * 销毁渲染器
   */
  destroy(): void {
    this.clearAll();
    this.labelContainer.remove();
  }
}

export default LabelRenderer;
