/**
 * 时间线状态管理 Store
 * 使用 Zustand 管理时间线播放状态和时间控制
 * 
 * @description
 * 时间线 Store 负责管理：
 * - 播放状态（播放、暂停、停止）
 * - 当前时间和总时长
 * - 播放速度
 * - 循环设置
 * - 选中的轨道和关键帧
 */
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

/** 播放状态枚举 */
export type PlaybackState = 'playing' | 'paused' | 'stopped';

/** 循环模式枚举 */
export type LoopMode = 'none' | 'loop' | 'pingpong';

/** 时间线 Store 状态接口 */
interface TimelineState {
  /** 当前播放时间（毫秒） */
  currentTime: number;
  /** 总时长（毫秒） */
  duration: number;
  /** 是否正在播放 */
  isPlaying: boolean;
  /** 播放状态 */
  playbackState: PlaybackState;
  /** 播放速度（1.0 为正常速度） */
  playbackSpeed: number;
  /** 循环模式 */
  loopMode: LoopMode;
  /** 循环范围开始时间（毫秒） */
  loopStart: number;
  /** 循环范围结束时间（毫秒） */
  loopEnd: number;
  /** 是否启用循环范围 */
  isLoopRangeEnabled: boolean;
  /** 帧率（FPS） */
  frameRate: number;
  /** 选中的轨道 ID 列表 */
  selectedTrackIds: string[];
  /** 选中的关键帧 ID 列表 */
  selectedKeyframeIds: string[];
  /** 是否正在拖拽播放头 */
  isDraggingPlayhead: boolean;
  /** 播放动画帧 ID */
  animationFrameId: number | null;
  /** 上一帧时间戳 */
  lastFrameTime: number | null;
}

/** 时间线 Store 操作接口 */
interface TimelineActions {
  /** 开始播放 */
  play: () => void;
  /** 暂停播放 */
  pause: () => void;
  /** 停止播放并重置到起始位置 */
  stop: () => void;
  /** 切换播放/暂停状态 */
  togglePlayPause: () => void;
  /** 跳转到指定时间 */
  seekTo: (timeMs: number) => void;
  /** 设置当前时间（内部使用） */
  setCurrentTime: (timeMs: number) => void;
  /** 设置总时长 */
  setDuration: (durationMs: number) => void;
  /** 设置播放速度 */
  setPlaybackSpeed: (speed: number) => void;
  /** 设置循环模式 */
  setLoopMode: (mode: LoopMode) => void;
  /** 设置循环范围 */
  setLoopRange: (start: number, end: number) => void;
  /** 启用/禁用循环范围 */
  setLoopRangeEnabled: (enabled: boolean) => void;
  /** 设置帧率 */
  setFrameRate: (fps: number) => void;
  /** 选中轨道 */
  selectTracks: (trackIds: string[]) => void;
  /** 添加轨道到选中列表 */
  addTrackToSelection: (trackId: string) => void;
  /** 从选中列表移除轨道 */
  removeTrackFromSelection: (trackId: string) => void;
  /** 清空轨道选中 */
  clearTrackSelection: () => void;
  /** 选中关键帧 */
  selectKeyframes: (keyframeIds: string[]) => void;
  /** 添加关键帧到选中列表 */
  addKeyframeToSelection: (keyframeId: string) => void;
  /** 从选中列表移除关键帧 */
  removeKeyframeFromSelection: (keyframeId: string) => void;
  /** 清空关键帧选中 */
  clearKeyframeSelection: () => void;
  /** 设置播放头拖拽状态 */
  setIsDraggingPlayhead: (isDragging: boolean) => void;
  /** 前进一帧 */
  stepForward: () => void;
  /** 后退一帧 */
  stepBackward: () => void;
  /** 跳到开头 */
  goToStart: () => void;
  /** 跳到结尾 */
  goToEnd: () => void;
  /** 重置时间线状态 */
  reset: () => void;
}

/** 时间线 Store 类型 */
type TimelineStore = TimelineState & TimelineActions;

/** 初始状态 */
const initialState: TimelineState = {
  currentTime: 0,
  duration: 10000, // 默认 10 秒
  isPlaying: false,
  playbackState: 'stopped',
  playbackSpeed: 1.0,
  loopMode: 'none',
  loopStart: 0,
  loopEnd: 10000,
  isLoopRangeEnabled: false,
  frameRate: 30,
  selectedTrackIds: [],
  selectedKeyframeIds: [],
  isDraggingPlayhead: false,
  animationFrameId: null,
  lastFrameTime: null,
};

/**
 * 时间线状态管理 Store
 * 
 * @description
 * 提供完整的时间线控制功能，包括：
 * - 播放控制（播放、暂停、停止）
 * - 时间定位和跳转
 * - 循环播放支持
 * - 轨道和关键帧选择
 */
export const useTimelineStore = create<TimelineStore>()(
  devtools(
    immer((set, get) => {
      /**
       * 播放动画循环
       * 使用 requestAnimationFrame 实现平滑播放
       */
      const playbackLoop = () => {
        const state = get();
        
        if (!state.isPlaying) {
          set((draft) => {
            draft.animationFrameId = null;
            draft.lastFrameTime = null;
          });
          return;
        }
        
        const now = performance.now();
        const lastTime = state.lastFrameTime || now;
        const deltaTime = (now - lastTime) * state.playbackSpeed;
        
        let newTime = state.currentTime + deltaTime;
        
        // 处理循环逻辑
        if (state.isLoopRangeEnabled) {
          if (newTime >= state.loopEnd) {
            if (state.loopMode === 'loop') {
              newTime = state.loopStart;
            } else if (state.loopMode === 'pingpong') {
              // TODO: 实现 pingpong 模式
              newTime = state.loopStart;
            } else {
              newTime = state.loopEnd;
              set((draft) => {
                draft.isPlaying = false;
                draft.playbackState = 'paused';
              });
            }
          }
        } else {
          if (newTime >= state.duration) {
            if (state.loopMode === 'loop') {
              newTime = 0;
            } else {
              newTime = state.duration;
              set((draft) => {
                draft.isPlaying = false;
                draft.playbackState = 'paused';
              });
            }
          }
        }
        
        set((draft) => {
          draft.currentTime = newTime;
          draft.lastFrameTime = now;
        });
        
        // 继续下一帧
        if (get().isPlaying) {
          const frameId = requestAnimationFrame(playbackLoop);
          set((draft) => {
            draft.animationFrameId = frameId;
          });
        }
      };

      return {
        ...initialState,

        // 开始播放
        play: () => {
          set((draft) => {
            draft.isPlaying = true;
            draft.playbackState = 'playing';
            draft.lastFrameTime = performance.now();
          });
          
          // 启动播放循环
          const frameId = requestAnimationFrame(playbackLoop);
          set((draft) => {
            draft.animationFrameId = frameId;
          });
        },

        // 暂停播放
        pause: () => {
          const { animationFrameId } = get();
          
          if (animationFrameId !== null) {
            cancelAnimationFrame(animationFrameId);
          }
          
          set((draft) => {
            draft.isPlaying = false;
            draft.playbackState = 'paused';
            draft.animationFrameId = null;
            draft.lastFrameTime = null;
          });
        },

        // 停止播放
        stop: () => {
          const { animationFrameId } = get();
          
          if (animationFrameId !== null) {
            cancelAnimationFrame(animationFrameId);
          }
          
          set((draft) => {
            draft.isPlaying = false;
            draft.playbackState = 'stopped';
            draft.currentTime = 0;
            draft.animationFrameId = null;
            draft.lastFrameTime = null;
          });
        },

        // 切换播放/暂停
        togglePlayPause: () => {
          const { isPlaying, play, pause } = get();
          if (isPlaying) {
            pause();
          } else {
            play();
          }
        },

        // 跳转到指定时间
        seekTo: (timeMs) => {
          const { duration, isLoopRangeEnabled, loopStart, loopEnd } = get();
          
          let clampedTime = Math.max(0, Math.min(timeMs, duration));
          
          if (isLoopRangeEnabled) {
            clampedTime = Math.max(loopStart, Math.min(clampedTime, loopEnd));
          }
          
          set((draft) => {
            draft.currentTime = clampedTime;
          });
        },

        // 设置当前时间
        setCurrentTime: (timeMs) => {
          set((draft) => {
            draft.currentTime = Math.max(0, Math.min(timeMs, draft.duration));
          });
        },

        // 设置总时长
        setDuration: (durationMs) => {
          set((draft) => {
            draft.duration = Math.max(1000, durationMs); // 最小 1 秒
            draft.loopEnd = durationMs;
            
            // 如果当前时间超过新时长，重置到结尾
            if (draft.currentTime > durationMs) {
              draft.currentTime = durationMs;
            }
          });
        },

        // 设置播放速度
        setPlaybackSpeed: (speed) => {
          set((draft) => {
            draft.playbackSpeed = Math.max(0.1, Math.min(speed, 4.0));
          });
        },

        // 设置循环模式
        setLoopMode: (mode) => {
          set((draft) => {
            draft.loopMode = mode;
          });
        },

        // 设置循环范围
        setLoopRange: (start, end) => {
          set((draft) => {
            draft.loopStart = Math.max(0, Math.min(start, draft.duration));
            draft.loopEnd = Math.max(draft.loopStart, Math.min(end, draft.duration));
          });
        },

        // 启用/禁用循环范围
        setLoopRangeEnabled: (enabled) => {
          set((draft) => {
            draft.isLoopRangeEnabled = enabled;
          });
        },

        // 设置帧率
        setFrameRate: (fps) => {
          set((draft) => {
            draft.frameRate = Math.max(1, Math.min(fps, 120));
          });
        },

        // 选中轨道
        selectTracks: (trackIds) => {
          set((draft) => {
            draft.selectedTrackIds = trackIds;
          });
        },

        // 添加轨道到选中列表
        addTrackToSelection: (trackId) => {
          set((draft) => {
            if (!draft.selectedTrackIds.includes(trackId)) {
              draft.selectedTrackIds.push(trackId);
            }
          });
        },

        // 从选中列表移除轨道
        removeTrackFromSelection: (trackId) => {
          set((draft) => {
            draft.selectedTrackIds = draft.selectedTrackIds.filter(id => id !== trackId);
          });
        },

        // 清空轨道选中
        clearTrackSelection: () => {
          set((draft) => {
            draft.selectedTrackIds = [];
          });
        },

        // 选中关键帧
        selectKeyframes: (keyframeIds) => {
          set((draft) => {
            draft.selectedKeyframeIds = keyframeIds;
          });
        },

        // 添加关键帧到选中列表
        addKeyframeToSelection: (keyframeId) => {
          set((draft) => {
            if (!draft.selectedKeyframeIds.includes(keyframeId)) {
              draft.selectedKeyframeIds.push(keyframeId);
            }
          });
        },

        // 从选中列表移除关键帧
        removeKeyframeFromSelection: (keyframeId) => {
          set((draft) => {
            draft.selectedKeyframeIds = draft.selectedKeyframeIds.filter(id => id !== keyframeId);
          });
        },

        // 清空关键帧选中
        clearKeyframeSelection: () => {
          set((draft) => {
            draft.selectedKeyframeIds = [];
          });
        },

        // 设置播放头拖拽状态
        setIsDraggingPlayhead: (isDragging) => {
          set((draft) => {
            draft.isDraggingPlayhead = isDragging;
          });
        },

        // 前进一帧
        stepForward: () => {
          const { currentTime, duration, frameRate } = get();
          const frameDuration = 1000 / frameRate;
          const newTime = Math.min(currentTime + frameDuration, duration);
          
          set((draft) => {
            draft.currentTime = newTime;
          });
        },

        // 后退一帧
        stepBackward: () => {
          const { currentTime, frameRate } = get();
          const frameDuration = 1000 / frameRate;
          const newTime = Math.max(currentTime - frameDuration, 0);
          
          set((draft) => {
            draft.currentTime = newTime;
          });
        },

        // 跳到开头
        goToStart: () => {
          const { isLoopRangeEnabled, loopStart } = get();
          
          set((draft) => {
            draft.currentTime = isLoopRangeEnabled ? loopStart : 0;
          });
        },

        // 跳到结尾
        goToEnd: () => {
          const { duration, isLoopRangeEnabled, loopEnd } = get();
          
          set((draft) => {
            draft.currentTime = isLoopRangeEnabled ? loopEnd : duration;
          });
        },

        // 重置时间线状态
        reset: () => {
          const { animationFrameId } = get();
          
          if (animationFrameId !== null) {
            cancelAnimationFrame(animationFrameId);
          }
          
          set(() => ({ ...initialState }));
        },
      };
    }),
    { name: 'TimelineStore' }
  )
);

export default useTimelineStore;
