/**
 * 快捷键 Hook
 * 提供键盘快捷键绑定和管理功能
 */
import { useEffect, useCallback, useRef } from 'react';

/** 修饰键 */
export interface ModifierKeys {
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  meta?: boolean;
}

/** 快捷键定义 */
export interface ShortcutDefinition {
  /** 主键 */
  key: string;
  /** 修饰键 */
  modifiers?: ModifierKeys;
  /** 回调函数 */
  handler: (event: KeyboardEvent) => void;
  /** 描述 */
  description?: string;
  /** 是否阻止默认行为 */
  preventDefault?: boolean;
  /** 是否阻止事件冒泡 */
  stopPropagation?: boolean;
  /** 是否在输入框中也触发 */
  allowInInput?: boolean;
  /** 是否启用 */
  enabled?: boolean;
}

/** 快捷键组 */
export interface ShortcutGroup {
  /** 组名 */
  name: string;
  /** 快捷键列表 */
  shortcuts: ShortcutDefinition[];
}

/**
 * 检查是否在输入元素中
 * @param element - 目标元素
 */
function isInputElement(element: EventTarget | null): boolean {
  if (!element || !(element instanceof HTMLElement)) return false;
  const tagName = element.tagName.toLowerCase();
  return (
    tagName === 'input' ||
    tagName === 'textarea' ||
    tagName === 'select' ||
    element.isContentEditable
  );
}

/**
 * 检查修饰键是否匹配
 * @param event - 键盘事件
 * @param modifiers - 期望的修饰键
 */
function matchModifiers(event: KeyboardEvent, modifiers?: ModifierKeys): boolean {
  const { ctrl = false, shift = false, alt = false, meta = false } = modifiers || {};
  
  // 在 Mac 上，ctrl 和 meta 通常互换使用
  const ctrlOrMeta = ctrl || meta;
  const eventCtrlOrMeta = event.ctrlKey || event.metaKey;

  return (
    (ctrlOrMeta ? eventCtrlOrMeta : !eventCtrlOrMeta) &&
    (shift ? event.shiftKey : !event.shiftKey) &&
    (alt ? event.altKey : !event.altKey)
  );
}

/**
 * 获取快捷键的显示文本
 * @param shortcut - 快捷键定义
 */
export function getShortcutText(shortcut: ShortcutDefinition): string {
  const parts: string[] = [];
  const { modifiers, key } = shortcut;
  
  const isMac = typeof navigator !== 'undefined' && /Mac/.test(navigator.platform);
  
  if (modifiers?.ctrl || modifiers?.meta) {
    parts.push(isMac ? '⌘' : 'Ctrl');
  }
  if (modifiers?.shift) {
    parts.push(isMac ? '⇧' : 'Shift');
  }
  if (modifiers?.alt) {
    parts.push(isMac ? '⌥' : 'Alt');
  }
  
  // 格式化特殊键
  let displayKey = key.toUpperCase();
  const keyMap: Record<string, string> = {
    ARROWUP: '↑',
    ARROWDOWN: '↓',
    ARROWLEFT: '←',
    ARROWRIGHT: '→',
    ENTER: '↵',
    ESCAPE: 'Esc',
    BACKSPACE: '⌫',
    DELETE: 'Del',
    SPACE: 'Space',
    TAB: 'Tab',
  };
  displayKey = keyMap[displayKey] || displayKey;
  
  parts.push(displayKey);
  return parts.join(isMac ? '' : '+');
}

/**
 * useKeyboardShortcuts - 快捷键 Hook
 * 
 * @param shortcuts - 快捷键定义列表
 * @param deps - 依赖数组
 */
export function useKeyboardShortcuts(
  shortcuts: ShortcutDefinition[],
  deps: React.DependencyList = []
): void {
  const shortcutsRef = useRef(shortcuts);
  shortcutsRef.current = shortcuts;

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    for (const shortcut of shortcutsRef.current) {
      if (shortcut.enabled === false) continue;

      // 检查是否在输入元素中
      if (!shortcut.allowInInput && isInputElement(event.target)) {
        continue;
      }

      // 检查键是否匹配
      if (event.key.toLowerCase() !== shortcut.key.toLowerCase()) {
        continue;
      }

      // 检查修饰键是否匹配
      if (!matchModifiers(event, shortcut.modifiers)) {
        continue;
      }

      // 执行处理函数
      if (shortcut.preventDefault !== false) {
        event.preventDefault();
      }
      if (shortcut.stopPropagation) {
        event.stopPropagation();
      }

      shortcut.handler(event);
      break;
    }
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown, ...deps]);
}

/**
 * 预定义的常用快捷键
 */
export const CommonShortcuts = {
  /** 撤销 */
  undo: (handler: () => void): ShortcutDefinition => ({
    key: 'z',
    modifiers: { ctrl: true },
    handler,
    description: '撤销',
  }),

  /** 重做 */
  redo: (handler: () => void): ShortcutDefinition => ({
    key: 'z',
    modifiers: { ctrl: true, shift: true },
    handler,
    description: '重做',
  }),

  /** 保存 */
  save: (handler: () => void): ShortcutDefinition => ({
    key: 's',
    modifiers: { ctrl: true },
    handler,
    description: '保存',
  }),

  /** 全选 */
  selectAll: (handler: () => void): ShortcutDefinition => ({
    key: 'a',
    modifiers: { ctrl: true },
    handler,
    description: '全选',
  }),

  /** 复制 */
  copy: (handler: () => void): ShortcutDefinition => ({
    key: 'c',
    modifiers: { ctrl: true },
    handler,
    description: '复制',
  }),

  /** 粘贴 */
  paste: (handler: () => void): ShortcutDefinition => ({
    key: 'v',
    modifiers: { ctrl: true },
    handler,
    description: '粘贴',
  }),

  /** 剪切 */
  cut: (handler: () => void): ShortcutDefinition => ({
    key: 'x',
    modifiers: { ctrl: true },
    handler,
    description: '剪切',
  }),

  /** 删除 */
  delete: (handler: () => void): ShortcutDefinition => ({
    key: 'Delete',
    handler,
    description: '删除',
  }),

  /** 播放/暂停 */
  playPause: (handler: () => void): ShortcutDefinition => ({
    key: ' ',
    handler,
    description: '播放/暂停',
    allowInInput: false,
  }),

  /** 放大 */
  zoomIn: (handler: () => void): ShortcutDefinition => ({
    key: '=',
    modifiers: { ctrl: true },
    handler,
    description: '放大',
  }),

  /** 缩小 */
  zoomOut: (handler: () => void): ShortcutDefinition => ({
    key: '-',
    modifiers: { ctrl: true },
    handler,
    description: '缩小',
  }),

  /** 适应视图 */
  fitView: (handler: () => void): ShortcutDefinition => ({
    key: '0',
    modifiers: { ctrl: true },
    handler,
    description: '适应视图',
  }),

  /** 新建 */
  new: (handler: () => void): ShortcutDefinition => ({
    key: 'n',
    modifiers: { ctrl: true },
    handler,
    description: '新建',
  }),

  /** 打开 */
  open: (handler: () => void): ShortcutDefinition => ({
    key: 'o',
    modifiers: { ctrl: true },
    handler,
    description: '打开',
  }),

  /** 导出 */
  export: (handler: () => void): ShortcutDefinition => ({
    key: 'e',
    modifiers: { ctrl: true, shift: true },
    handler,
    description: '导出',
  }),

  /** 取消/关闭 */
  escape: (handler: () => void): ShortcutDefinition => ({
    key: 'Escape',
    handler,
    description: '取消',
    allowInInput: true,
  }),
};

export default useKeyboardShortcuts;
