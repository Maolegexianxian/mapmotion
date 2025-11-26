/**
 * 视频导出器
 * 使用浏览器原生 API 进行视频录制和导出
 */

/** 导出配置 */
export interface ExportConfig {
  /** 宽度 */
  width: number;
  /** 高度 */
  height: number;
  /** 帧率 */
  fps: number;
  /** 视频比特率 (bps) */
  videoBitrate?: number;
  /** 输出格式 */
  format: 'webm' | 'mp4';
  /** 背景颜色 */
  backgroundColor?: string;
  /** 是否透明背景 */
  transparent?: boolean;
}

/** 导出状态 */
export type ExportState = 'idle' | 'preparing' | 'recording' | 'encoding' | 'complete' | 'error';

/** 导出进度回调 */
export type ProgressCallback = (progress: number, state: ExportState, message?: string) => void;

/** 帧渲染回调 */
export type FrameRenderCallback = (frameIndex: number, totalFrames: number) => Promise<void>;

/**
 * VideoExporter - 视频导出器
 * 
 * 使用 MediaRecorder API 进行视频录制
 */
export class VideoExporter {
  /** 导出配置 */
  private config: Required<ExportConfig>;
  
  /** 当前状态 */
  private state: ExportState = 'idle';
  
  /** 进度回调 */
  private progressCallback?: ProgressCallback;
  
  /** 取消标志 */
  private isCancelled = false;
  
  /** Canvas 元素 */
  private canvas: HTMLCanvasElement | null = null;
  
  /** MediaRecorder 实例 */
  private mediaRecorder: MediaRecorder | null = null;
  
  /** 录制的数据块 */
  private recordedChunks: Blob[] = [];

  /**
   * 构造函数
   * @param config - 导出配置
   */
  constructor(config: ExportConfig) {
    this.config = {
      width: config.width,
      height: config.height,
      fps: config.fps,
      videoBitrate: config.videoBitrate ?? 8000000,
      format: config.format,
      backgroundColor: config.backgroundColor ?? '#000000',
      transparent: config.transparent ?? false,
    };
  }

  /**
   * 设置进度回调
   * @param callback - 进度回调函数
   */
  onProgress(callback: ProgressCallback): void {
    this.progressCallback = callback;
  }

  /**
   * 导出视频
   * @param durationMs - 视频时长（毫秒）
   * @param renderFrame - 帧渲染回调
   * @returns 导出的视频 Blob
   */
  async export(
    durationMs: number,
    renderFrame: FrameRenderCallback
  ): Promise<Blob | null> {
    this.isCancelled = false;
    this.recordedChunks = [];
    
    try {
      // 准备阶段
      this.updateState('preparing', 0, '正在准备导出...');
      
      // 创建 Canvas
      this.canvas = document.createElement('canvas');
      this.canvas.width = this.config.width;
      this.canvas.height = this.config.height;

      // 计算总帧数
      const totalFrames = Math.ceil((durationMs / 1000) * this.config.fps);
      const frameInterval = 1000 / this.config.fps;

      // 获取 Canvas 流
      const stream = this.canvas.captureStream(this.config.fps);
      
      // 检查浏览器支持
      const mimeType = this.getMimeType();
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        throw new Error(`浏览器不支持 ${mimeType} 格式`);
      }

      // 创建 MediaRecorder
      this.mediaRecorder = new MediaRecorder(stream, {
        mimeType,
        videoBitsPerSecond: this.config.videoBitrate,
      });

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.recordedChunks.push(event.data);
        }
      };

      // 开始录制
      this.mediaRecorder.start();
      this.updateState('recording', 0, '正在录制...');

      // 逐帧渲染
      for (let i = 0; i < totalFrames; i++) {
        if (this.isCancelled) {
          this.mediaRecorder.stop();
          this.updateState('idle', 0, '导出已取消');
          return null;
        }

        // 渲染当前帧
        await renderFrame(i, totalFrames);
        
        // 更新进度
        const progress = ((i + 1) / totalFrames) * 100;
        this.updateState('recording', progress, `正在录制帧 ${i + 1}/${totalFrames}`);

        // 等待下一帧
        await this.wait(frameInterval);
      }

      // 停止录制
      this.updateState('encoding', 95, '正在编码视频...');
      
      const blob = await this.stopRecording();
      
      this.updateState('complete', 100, '导出完成');
      return blob;
    } catch (error) {
      const message = error instanceof Error ? error.message : '未知错误';
      this.updateState('error', 0, `导出失败: ${message}`);
      return null;
    } finally {
      this.cleanup();
    }
  }

  /**
   * 导出图片序列
   * @param durationMs - 视频时长（毫秒）
   * @param renderFrame - 帧渲染回调
   * @param getFrameData - 获取帧数据回调
   * @returns 图片数据数组
   */
  async exportImageSequence(
    durationMs: number,
    renderFrame: FrameRenderCallback,
    getFrameData: () => string
  ): Promise<string[]> {
    this.isCancelled = false;
    const frames: string[] = [];

    try {
      this.updateState('preparing', 0, '正在准备导出...');

      const totalFrames = Math.ceil((durationMs / 1000) * this.config.fps);
      const frameInterval = 1000 / this.config.fps;

      this.updateState('recording', 0, '正在导出图片序列...');

      for (let i = 0; i < totalFrames; i++) {
        if (this.isCancelled) {
          this.updateState('idle', 0, '导出已取消');
          return [];
        }

        // 渲染当前帧
        await renderFrame(i, totalFrames);
        
        // 获取帧数据
        const frameData = getFrameData();
        frames.push(frameData);

        // 更新进度
        const progress = ((i + 1) / totalFrames) * 100;
        this.updateState('recording', progress, `正在导出帧 ${i + 1}/${totalFrames}`);

        // 等待下一帧
        await this.wait(frameInterval);
      }

      this.updateState('complete', 100, '导出完成');
      return frames;
    } catch (error) {
      const message = error instanceof Error ? error.message : '未知错误';
      this.updateState('error', 0, `导出失败: ${message}`);
      return [];
    }
  }

  /**
   * 取消导出
   */
  cancel(): void {
    this.isCancelled = true;
  }

  /**
   * 获取当前状态
   */
  getState(): ExportState {
    return this.state;
  }

  /**
   * 获取 MIME 类型
   */
  private getMimeType(): string {
    if (this.config.format === 'webm') {
      return 'video/webm;codecs=vp9';
    }
    // MP4 格式需要特殊处理，部分浏览器可能不支持
    return 'video/mp4;codecs=avc1';
  }

  /**
   * 停止录制并返回 Blob
   */
  private stopRecording(): Promise<Blob> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) {
        reject(new Error('MediaRecorder 未初始化'));
        return;
      }

      this.mediaRecorder.onstop = () => {
        const mimeType = this.getMimeType();
        const blob = new Blob(this.recordedChunks, { type: mimeType });
        resolve(blob);
      };

      this.mediaRecorder.onerror = (event) => {
        reject(new Error(`录制错误: ${event}`));
      };

      this.mediaRecorder.stop();
    });
  }

  /**
   * 更新状态
   * @param state - 新状态
   * @param progress - 进度 (0-100)
   * @param message - 消息
   */
  private updateState(state: ExportState, progress: number, message?: string): void {
    this.state = state;
    if (this.progressCallback) {
      this.progressCallback(progress, state, message);
    }
  }

  /**
   * 等待指定时间
   * @param ms - 毫秒数
   */
  private wait(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * 清理资源
   */
  private cleanup(): void {
    if (this.mediaRecorder) {
      this.mediaRecorder = null;
    }
    if (this.canvas) {
      this.canvas = null;
    }
    this.recordedChunks = [];
  }

  /**
   * 下载导出的视频
   * @param blob - 视频 Blob
   * @param filename - 文件名
   */
  static downloadBlob(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  /**
   * 检查浏览器是否支持视频导出
   */
  static isSupported(): boolean {
    return (
      typeof MediaRecorder !== 'undefined' &&
      typeof HTMLCanvasElement.prototype.captureStream === 'function'
    );
  }

  /**
   * 获取支持的格式列表
   */
  static getSupportedFormats(): string[] {
    const formats: string[] = [];
    
    if (MediaRecorder.isTypeSupported('video/webm;codecs=vp9')) {
      formats.push('webm');
    }
    if (MediaRecorder.isTypeSupported('video/webm;codecs=vp8')) {
      formats.push('webm-vp8');
    }
    if (MediaRecorder.isTypeSupported('video/mp4;codecs=avc1')) {
      formats.push('mp4');
    }

    return formats;
  }
}

export default VideoExporter;
