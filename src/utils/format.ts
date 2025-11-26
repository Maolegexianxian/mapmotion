/**
 * 格式化工具函数
 */

/**
 * 格式化时间 (毫秒 -> mm:ss.ms)
 * @param ms - 毫秒数
 * @param showMs - 是否显示毫秒
 */
export function formatTime(ms: number, showMs = false): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const milliseconds = Math.floor((ms % 1000) / 10);

  const formatted = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  return showMs ? `${formatted}.${milliseconds.toString().padStart(2, '0')}` : formatted;
}

/**
 * 格式化文件大小
 * @param bytes - 字节数
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * 格式化日期
 * @param date - 日期对象或时间戳
 * @param format - 格式化模板
 */
export function formatDate(date: Date | number, format = 'YYYY-MM-DD HH:mm'): string {
  const d = typeof date === 'number' ? new Date(date) : date;
  
  const tokens: Record<string, string> = {
    'YYYY': d.getFullYear().toString(),
    'MM': (d.getMonth() + 1).toString().padStart(2, '0'),
    'DD': d.getDate().toString().padStart(2, '0'),
    'HH': d.getHours().toString().padStart(2, '0'),
    'mm': d.getMinutes().toString().padStart(2, '0'),
    'ss': d.getSeconds().toString().padStart(2, '0'),
  };

  return format.replace(/YYYY|MM|DD|HH|mm|ss/g, (match) => tokens[match] || match);
}

/**
 * 格式化百分比
 * @param value - 数值 (0-1)
 * @param decimals - 小数位数
 */
export function formatPercent(value: number, decimals = 0): string {
  return `${(value * 100).toFixed(decimals)}%`;
}

/**
 * 格式化经纬度
 * @param lng - 经度
 * @param lat - 纬度
 * @param precision - 小数位数
 */
export function formatCoordinates(lng: number, lat: number, precision = 4): string {
  const lngDir = lng >= 0 ? 'E' : 'W';
  const latDir = lat >= 0 ? 'N' : 'S';
  return `${Math.abs(lat).toFixed(precision)}°${latDir}, ${Math.abs(lng).toFixed(precision)}°${lngDir}`;
}

/**
 * 格式化数字 (添加千分位)
 * @param num - 数字
 */
export function formatNumber(num: number): string {
  return num.toLocaleString();
}

/**
 * 截断文本
 * @param text - 文本
 * @param maxLength - 最大长度
 * @param suffix - 后缀
 */
export function truncateText(text: string, maxLength: number, suffix = '...'): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - suffix.length) + suffix;
}

/**
 * 驼峰转短横线
 * @param str - 驼峰字符串
 */
export function camelToKebab(str: string): string {
  return str.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
}

/**
 * 短横线转驼峰
 * @param str - 短横线字符串
 */
export function kebabToCamel(str: string): string {
  return str.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
}
