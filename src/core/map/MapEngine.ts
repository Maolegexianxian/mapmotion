/**
 * 地图引擎核心类
 * 封装 MapLibre GL 地图实例，提供统一的地图操作接口
 */
import maplibregl from 'maplibre-gl';
import type { CameraState, MapBounds } from '@/types';

/** 地图引擎配置 */
export interface MapEngineConfig {
  container: HTMLElement | string;
  styleUrl?: string;
  initialCamera?: Partial<CameraState>;
  antialias?: boolean;
  preserveDrawingBuffer?: boolean;
  maxZoom?: number;
  minZoom?: number;
}

/** 地图事件类型 */
export type MapEventType =
  | 'load' | 'move' | 'moveend' | 'zoom' | 'zoomend'
  | 'pitch' | 'pitchend' | 'rotate' | 'rotateend'
  | 'click' | 'dblclick' | 'contextmenu' | 'render' | 'idle';

/** 地图事件回调 */
export type MapEventCallback = (event: maplibregl.MapLibreEvent) => void;

const DEFAULT_STYLE_URL = 'https://demotiles.maplibre.org/style.json';

/**
 * MapEngine - 地图引擎核心类
 */
export class MapEngine {
  private map: maplibregl.Map | null = null;
  private eventListeners: globalThis.Map<string, Set<MapEventCallback>> = new globalThis.Map();
  private isLoaded = false;
  private config: MapEngineConfig;

  constructor(config: MapEngineConfig) {
    this.config = config;
  }

  async initialize(): Promise<void> {
    if (this.map) return;

    const { container, styleUrl, initialCamera, antialias, preserveDrawingBuffer, maxZoom, minZoom } = this.config;

    this.map = new maplibregl.Map({
      container,
      style: styleUrl || DEFAULT_STYLE_URL,
      center: initialCamera?.center
        ? [initialCamera.center.longitude, initialCamera.center.latitude]
        : [116.4074, 39.9042],
      zoom: initialCamera?.zoom ?? 10,
      pitch: initialCamera?.pitch ?? 0,
      bearing: initialCamera?.bearing ?? 0,
      antialias: antialias ?? true,
      preserveDrawingBuffer: preserveDrawingBuffer ?? true,
      maxZoom: maxZoom ?? 22,
      minZoom: minZoom ?? 0,
      attributionControl: false,
    });

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error('地图加载超时')), 30000);
      this.map!.on('load', () => {
        clearTimeout(timeout);
        this.isLoaded = true;
        this.setupEventProxies();
        resolve();
      });
      this.map!.on('error', () => {
        clearTimeout(timeout);
        reject(new Error('地图加载错误'));
      });
    });
  }

  private setupEventProxies(): void {
    if (!this.map) return;
    const events: MapEventType[] = ['move', 'moveend', 'zoom', 'zoomend', 'pitch', 'pitchend', 'rotate', 'rotateend', 'click', 'dblclick', 'contextmenu', 'render', 'idle'];
    events.forEach((eventType) => {
      this.map!.on(eventType, (event: maplibregl.MapLibreEvent) => this.emit(eventType, event));
    });
  }

  private emit(eventType: string, event: maplibregl.MapLibreEvent): void {
    const listeners = this.eventListeners.get(eventType);
    listeners?.forEach((callback) => { try { callback(event); } catch (e) { console.error(e); } });
  }

  on(eventType: MapEventType, callback: MapEventCallback): void {
    if (!this.eventListeners.has(eventType)) this.eventListeners.set(eventType, new Set());
    this.eventListeners.get(eventType)!.add(callback);
  }

  off(eventType: MapEventType, callback: MapEventCallback): void {
    this.eventListeners.get(eventType)?.delete(callback);
  }

  getCameraState(): CameraState {
    if (!this.map) throw new Error('地图未初始化');
    const center = this.map.getCenter();
    return {
      center: { longitude: center.lng, latitude: center.lat },
      zoom: this.map.getZoom(),
      pitch: this.map.getPitch(),
      bearing: this.map.getBearing(),
    };
  }

  setCameraState(state: Partial<CameraState>): void {
    if (!this.map) throw new Error('地图未初始化');
    const options: maplibregl.CameraOptions = {};
    if (state.center) options.center = [state.center.longitude, state.center.latitude];
    if (state.zoom !== undefined) options.zoom = state.zoom;
    if (state.pitch !== undefined) options.pitch = state.pitch;
    if (state.bearing !== undefined) options.bearing = state.bearing;
    this.map.jumpTo(options);
  }

  async flyTo(state: Partial<CameraState>, duration = 1000, easing?: (t: number) => number): Promise<void> {
    if (!this.map) throw new Error('地图未初始化');
    return new Promise((resolve) => {
      const options: maplibregl.FlyToOptions = { duration, essential: true };
      if (state.center) options.center = [state.center.longitude, state.center.latitude];
      if (state.zoom !== undefined) options.zoom = state.zoom;
      if (state.pitch !== undefined) options.pitch = state.pitch;
      if (state.bearing !== undefined) options.bearing = state.bearing;
      if (easing) options.easing = easing;
      this.map!.once('moveend', () => resolve());
      this.map!.flyTo(options);
    });
  }

  fitBounds(bounds: MapBounds, options?: { padding?: number; duration?: number; maxZoom?: number }): void {
    if (!this.map) throw new Error('地图未初始化');
    this.map.fitBounds([[bounds.west, bounds.south], [bounds.east, bounds.north]], {
      padding: options?.padding ?? 50,
      duration: options?.duration ?? 1000,
      maxZoom: options?.maxZoom ?? 18,
    });
  }

  async setStyle(styleUrl: string): Promise<void> {
    if (!this.map) throw new Error('地图未初始化');
    return new Promise((resolve) => {
      this.map!.once('styledata', () => resolve());
      this.map!.setStyle(styleUrl);
    });
  }

  getScreenshot(): string {
    if (!this.map) throw new Error('地图未初始化');
    return this.map.getCanvas().toDataURL('image/png');
  }

  getCanvas(): HTMLCanvasElement {
    if (!this.map) throw new Error('地图未初始化');
    return this.map.getCanvas();
  }

  getMap(): maplibregl.Map {
    if (!this.map) throw new Error('地图未初始化');
    return this.map;
  }

  isReady(): boolean { return this.isLoaded && this.map !== null; }
  triggerRepaint(): void { this.map?.triggerRepaint(); }
  resize(): void { this.map?.resize(); }

  destroy(): void {
    if (this.map) {
      this.map.remove();
      this.map = null;
      this.isLoaded = false;
      this.eventListeners.clear();
    }
  }
}

export default MapEngine;
