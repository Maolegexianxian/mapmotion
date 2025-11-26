/**
 * 颜色工具函数
 */

/** RGB 颜色 */
export interface RGB {
  r: number;
  g: number;
  b: number;
}

/** HSL 颜色 */
export interface HSL {
  h: number;
  s: number;
  l: number;
}

/**
 * Hex 转 RGB
 * @param hex - 十六进制颜色
 */
export function hexToRgb(hex: string): RGB | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result || !result[1] || !result[2] || !result[3]) return null;
  return {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  };
}

/**
 * RGB 转 Hex
 * @param r - 红色 (0-255)
 * @param g - 绿色 (0-255)
 * @param b - 蓝色 (0-255)
 */
export function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map((x) => x.toString(16).padStart(2, '0')).join('');
}

/**
 * RGB 转 HSL
 * @param r - 红色 (0-255)
 * @param g - 绿色 (0-255)
 * @param b - 蓝色 (0-255)
 */
export function rgbToHsl(r: number, g: number, b: number): HSL {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let h = 0;
  let s = 0;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

/**
 * HSL 转 RGB
 * @param h - 色相 (0-360)
 * @param s - 饱和度 (0-100)
 * @param l - 亮度 (0-100)
 */
export function hslToRgb(h: number, s: number, l: number): RGB {
  h /= 360;
  s /= 100;
  l /= 100;

  let r, g, b;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
  };
}

/**
 * 调整颜色亮度
 * @param hex - 十六进制颜色
 * @param amount - 调整量 (-100 到 100)
 */
export function adjustBrightness(hex: string, amount: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;

  const adjust = (value: number) => Math.max(0, Math.min(255, value + amount));
  return rgbToHex(adjust(rgb.r), adjust(rgb.g), adjust(rgb.b));
}

/**
 * 计算对比色
 * @param hex - 十六进制颜色
 */
export function getContrastColor(hex: string): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return '#000000';

  const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
  return luminance > 0.5 ? '#000000' : '#ffffff';
}

/**
 * 颜色混合
 * @param color1 - 颜色1
 * @param color2 - 颜色2
 * @param weight - 混合权重 (0-1)
 */
export function mixColors(color1: string, color2: string, weight = 0.5): string {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);
  if (!rgb1 || !rgb2) return color1;

  const r = Math.round(rgb1.r * (1 - weight) + rgb2.r * weight);
  const g = Math.round(rgb1.g * (1 - weight) + rgb2.g * weight);
  const b = Math.round(rgb1.b * (1 - weight) + rgb2.b * weight);

  return rgbToHex(r, g, b);
}

/**
 * 生成渐变色数组
 * @param startColor - 起始颜色
 * @param endColor - 结束颜色
 * @param steps - 步数
 */
export function generateGradient(startColor: string, endColor: string, steps: number): string[] {
  const colors: string[] = [];
  for (let i = 0; i < steps; i++) {
    colors.push(mixColors(startColor, endColor, i / (steps - 1)));
  }
  return colors;
}

/**
 * 颜色预设
 */
export const ColorPresets = {
  primary: '#2563eb',
  secondary: '#64748b',
  success: '#22c55e',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',
};

/**
 * 地图配色方案
 */
export const MapColorSchemes = {
  light: {
    background: '#f8fafc',
    water: '#a5d8ff',
    land: '#e9ecef',
    roads: '#ffffff',
    buildings: '#dee2e6',
    labels: '#495057',
  },
  dark: {
    background: '#1a1b1e',
    water: '#1e3a5f',
    land: '#2d2e32',
    roads: '#3d3e42',
    buildings: '#4a4b4f',
    labels: '#e9ecef',
  },
  satellite: {
    background: '#0c1018',
    water: '#0a2540',
    land: '#1a2e1a',
    roads: '#484850',
    buildings: '#606068',
    labels: '#ffffff',
  },
};
