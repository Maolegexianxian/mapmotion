/**
 * 拖拽 Hook
 * 提供通用的拖拽功能
 */
import { useState, useCallback, useRef, useEffect } from 'react';

/** 拖拽状态 */
export interface DragState {
  /** 是否正在拖拽 */
  isDragging: boolean;
  /** 拖拽起点 */
  startPosition: { x: number; y: number } | null;
  /** 当前位置 */
  currentPosition: { x: number; y: number } | null;
  /** 位移 */
  delta: { x: number; y: number };
  /** 拖拽的数据 */
  data: unknown;
}

/** 拖拽配置 */
export interface DragConfig {
  /** 拖拽阈值（像素） */
  threshold?: number;
  /** 是否限制在容器内 */
  constrain?: boolean;
  /** 容器引用 */
  containerRef?: React.RefObject<HTMLElement>;
  /** 拖拽轴向限制 */
  axis?: 'x' | 'y' | 'both';
  /** 是否禁用 */
  disabled?: boolean;
}

/** 拖拽事件处理器 */
export interface DragHandlers {
  /** 拖拽开始 */
  onDragStart?: (state: DragState, event: MouseEvent | TouchEvent) => void;
  /** 拖拽中 */
  onDrag?: (state: DragState, event: MouseEvent | TouchEvent) => void;
  /** 拖拽结束 */
  onDragEnd?: (state: DragState, event: MouseEvent | TouchEvent) => void;
}

/** 拖拽返回值 */
export interface UseDragReturn {
  /** 拖拽状态 */
  state: DragState;
  /** 绑定到拖拽元素的属性 */
  dragProps: {
    onMouseDown: (e: React.MouseEvent) => void;
    onTouchStart: (e: React.TouchEvent) => void;
  };
  /** 手动设置拖拽数据 */
  setDragData: (data: unknown) => void;
  /** 取消拖拽 */
  cancel: () => void;
}

/**
 * 获取事件位置
 */
function getEventPosition(event: MouseEvent | TouchEvent): { x: number; y: number } {
  if ('touches' in event) {
    const touch = event.touches[0] || event.changedTouches[0];
    return { x: touch?.clientX ?? 0, y: touch?.clientY ?? 0 };
  }
  return { x: event.clientX, y: event.clientY };
}

/**
 * useDrag - 拖拽 Hook
 * 
 * @param config - 拖拽配置
 * @param handlers - 事件处理器
 */
export function useDrag(
  config: DragConfig = {},
  handlers: DragHandlers = {}
): UseDragReturn {
  const {
    threshold = 3,
    constrain = false,
    containerRef,
    axis = 'both',
    disabled = false,
  } = config;

  const { onDragStart, onDrag, onDragEnd } = handlers;

  const [state, setState] = useState<DragState>({
    isDragging: false,
    startPosition: null,
    currentPosition: null,
    delta: { x: 0, y: 0 },
    data: null,
  });

  const dragDataRef = useRef<unknown>(null);
  const hasPassedThreshold = useRef(false);
  const startPosRef = useRef<{ x: number; y: number } | null>(null);

  const handleMove = useCallback(
    (event: MouseEvent | TouchEvent) => {
      if (!startPosRef.current || disabled) return;

      const currentPos = getEventPosition(event);
      let deltaX = currentPos.x - startPosRef.current.x;
      let deltaY = currentPos.y - startPosRef.current.y;

      // 轴向限制
      if (axis === 'x') deltaY = 0;
      if (axis === 'y') deltaX = 0;

      // 容器限制
      if (constrain && containerRef?.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const newX = startPosRef.current.x + deltaX;
        const newY = startPosRef.current.y + deltaY;

        if (newX < rect.left) deltaX = rect.left - startPosRef.current.x;
        if (newX > rect.right) deltaX = rect.right - startPosRef.current.x;
        if (newY < rect.top) deltaY = rect.top - startPosRef.current.y;
        if (newY > rect.bottom) deltaY = rect.bottom - startPosRef.current.y;
      }

      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

      // 检查阈值
      if (!hasPassedThreshold.current && distance < threshold) {
        return;
      }

      if (!hasPassedThreshold.current) {
        hasPassedThreshold.current = true;
        const newState: DragState = {
          isDragging: true,
          startPosition: startPosRef.current,
          currentPosition: currentPos,
          delta: { x: deltaX, y: deltaY },
          data: dragDataRef.current,
        };
        setState(newState);
        onDragStart?.(newState, event);
      }

      const newState: DragState = {
        isDragging: true,
        startPosition: startPosRef.current,
        currentPosition: currentPos,
        delta: { x: deltaX, y: deltaY },
        data: dragDataRef.current,
      };

      setState(newState);
      onDrag?.(newState, event);
    },
    [axis, constrain, containerRef, disabled, onDrag, onDragStart, threshold]
  );

  const handleEnd = useCallback(
    (event: MouseEvent | TouchEvent) => {
      if (!startPosRef.current) return;

      const currentPos = getEventPosition(event);
      const deltaX = axis === 'y' ? 0 : currentPos.x - startPosRef.current.x;
      const deltaY = axis === 'x' ? 0 : currentPos.y - startPosRef.current.y;

      const finalState: DragState = {
        isDragging: false,
        startPosition: startPosRef.current,
        currentPosition: currentPos,
        delta: { x: deltaX, y: deltaY },
        data: dragDataRef.current,
      };

      if (hasPassedThreshold.current) {
        onDragEnd?.(finalState, event);
      }

      setState({
        isDragging: false,
        startPosition: null,
        currentPosition: null,
        delta: { x: 0, y: 0 },
        data: null,
      });

      startPosRef.current = null;
      hasPassedThreshold.current = false;

      // 移除全局监听器
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleEnd);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('touchend', handleEnd);
    },
    [axis, handleMove, onDragEnd]
  );

  const handleStart = useCallback(
    (event: MouseEvent | TouchEvent) => {
      if (disabled) return;

      const pos = getEventPosition(event);
      startPosRef.current = pos;
      hasPassedThreshold.current = false;

      // 添加全局监听器
      window.addEventListener('mousemove', handleMove);
      window.addEventListener('mouseup', handleEnd);
      window.addEventListener('touchmove', handleMove, { passive: false });
      window.addEventListener('touchend', handleEnd);
    },
    [disabled, handleMove, handleEnd]
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      handleStart(e.nativeEvent);
    },
    [handleStart]
  );

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      handleStart(e.nativeEvent);
    },
    [handleStart]
  );

  const setDragData = useCallback((data: unknown) => {
    dragDataRef.current = data;
  }, []);

  const cancel = useCallback(() => {
    startPosRef.current = null;
    hasPassedThreshold.current = false;
    setState({
      isDragging: false,
      startPosition: null,
      currentPosition: null,
      delta: { x: 0, y: 0 },
      data: null,
    });
    window.removeEventListener('mousemove', handleMove);
    window.removeEventListener('mouseup', handleEnd);
    window.removeEventListener('touchmove', handleMove);
    window.removeEventListener('touchend', handleEnd);
  }, [handleMove, handleEnd]);

  // 清理
  useEffect(() => {
    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleEnd);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('touchend', handleEnd);
    };
  }, [handleMove, handleEnd]);

  return {
    state,
    dragProps: {
      onMouseDown: handleMouseDown,
      onTouchStart: handleTouchStart,
    },
    setDragData,
    cancel,
  };
}

/** 拖放目标配置 */
export interface DropConfig {
  /** 接受的拖拽类型 */
  accept?: string[];
  /** 是否禁用 */
  disabled?: boolean;
}

/** 拖放目标处理器 */
export interface DropHandlers {
  /** 拖拽进入 */
  onDragEnter?: (event: React.DragEvent) => void;
  /** 拖拽在上方 */
  onDragOver?: (event: React.DragEvent) => void;
  /** 拖拽离开 */
  onDragLeave?: (event: React.DragEvent) => void;
  /** 放下 */
  onDrop?: (event: React.DragEvent, data: unknown) => void;
}

/** 拖放目标返回值 */
export interface UseDropReturn {
  /** 是否有拖拽在上方 */
  isOver: boolean;
  /** 绑定到目标元素的属性 */
  dropProps: {
    onDragEnter: (e: React.DragEvent) => void;
    onDragOver: (e: React.DragEvent) => void;
    onDragLeave: (e: React.DragEvent) => void;
    onDrop: (e: React.DragEvent) => void;
  };
}

/**
 * useDrop - 拖放目标 Hook
 * 
 * @param config - 配置
 * @param handlers - 事件处理器
 */
export function useDrop(
  config: DropConfig = {},
  handlers: DropHandlers = {}
): UseDropReturn {
  const { disabled = false } = config;
  const { onDragEnter, onDragOver, onDragLeave, onDrop } = handlers;

  const [isOver, setIsOver] = useState(false);
  const enterCounter = useRef(0);

  const handleDragEnter = useCallback(
    (e: React.DragEvent) => {
      if (disabled) return;
      e.preventDefault();
      enterCounter.current++;
      if (enterCounter.current === 1) {
        setIsOver(true);
        onDragEnter?.(e);
      }
    },
    [disabled, onDragEnter]
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      if (disabled) return;
      e.preventDefault();
      onDragOver?.(e);
    },
    [disabled, onDragOver]
  );

  const handleDragLeave = useCallback(
    (e: React.DragEvent) => {
      if (disabled) return;
      enterCounter.current--;
      if (enterCounter.current === 0) {
        setIsOver(false);
        onDragLeave?.(e);
      }
    },
    [disabled, onDragLeave]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      if (disabled) return;
      e.preventDefault();
      enterCounter.current = 0;
      setIsOver(false);

      try {
        const data = JSON.parse(e.dataTransfer.getData('application/json'));
        onDrop?.(e, data);
      } catch {
        onDrop?.(e, e.dataTransfer.getData('text/plain'));
      }
    },
    [disabled, onDrop]
  );

  return {
    isOver,
    dropProps: {
      onDragEnter: handleDragEnter,
      onDragOver: handleDragOver,
      onDragLeave: handleDragLeave,
      onDrop: handleDrop,
    },
  };
}

export default useDrag;
