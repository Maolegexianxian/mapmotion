/**
 * 编辑器地图画布组件
 * 使用 MapLibre GL 渲染地图
 */
import { useRef, useEffect, useState, useCallback } from 'react';
import maplibregl from 'maplibre-gl';
import { ZoomIn, ZoomOut, Compass, Maximize } from 'lucide-react';

import { useProjectStore } from '@/stores/projectStore';

import 'maplibre-gl/dist/maplibre-gl.css';

/** 默认地图样式 URL */
const DEFAULT_STYLE = 'https://demotiles.maplibre.org/style.json';

/**
 * EditorCanvas - 地图画布组件
 */
export function EditorCanvas() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  const { currentProject, currentSceneIndex } = useProjectStore();
  const currentScene = currentProject?.scenes[currentSceneIndex];

  // 初始化地图
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: DEFAULT_STYLE,
      center: currentScene?.cameraDefaults.center
        ? [currentScene.cameraDefaults.center.longitude, currentScene.cameraDefaults.center.latitude]
        : [116.4074, 39.9042],
      zoom: currentScene?.cameraDefaults.zoom ?? 10,
      pitch: currentScene?.cameraDefaults.pitch ?? 45,
      bearing: currentScene?.cameraDefaults.bearing ?? 0,
      antialias: true,
    });

    map.on('load', () => {
      setIsMapLoaded(true);
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // 放大
  const handleZoomIn = useCallback(() => {
    mapRef.current?.zoomIn();
  }, []);

  // 缩小
  const handleZoomOut = useCallback(() => {
    mapRef.current?.zoomOut();
  }, []);

  // 重置方位
  const handleResetBearing = useCallback(() => {
    mapRef.current?.easeTo({ bearing: 0, pitch: 0 });
  }, []);

  // 适应视图
  const handleFitView = useCallback(() => {
    if (currentScene?.bounds) {
      mapRef.current?.fitBounds([
        [currentScene.bounds.west, currentScene.bounds.south],
        [currentScene.bounds.east, currentScene.bounds.north],
      ]);
    }
  }, [currentScene]);

  return (
    <div className="relative flex-1 bg-editor-panel">
      {/* 地图容器 */}
      <div ref={mapContainerRef} className="h-full w-full" />

      {/* 加载指示器 */}
      {!isMapLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-editor-panel">
          <div className="text-sm text-slate-400">加载地图中...</div>
        </div>
      )}

      {/* 地图控件 */}
      <div className="absolute right-4 top-4 flex flex-col gap-1">
        <button
          onClick={handleZoomIn}
          className="flex h-8 w-8 items-center justify-center rounded bg-white/90 text-slate-700 shadow hover:bg-white dark:bg-slate-800/90 dark:text-slate-300 dark:hover:bg-slate-800"
          title="放大"
        >
          <ZoomIn className="h-4 w-4" />
        </button>
        <button
          onClick={handleZoomOut}
          className="flex h-8 w-8 items-center justify-center rounded bg-white/90 text-slate-700 shadow hover:bg-white dark:bg-slate-800/90 dark:text-slate-300 dark:hover:bg-slate-800"
          title="缩小"
        >
          <ZoomOut className="h-4 w-4" />
        </button>
        <button
          onClick={handleResetBearing}
          className="flex h-8 w-8 items-center justify-center rounded bg-white/90 text-slate-700 shadow hover:bg-white dark:bg-slate-800/90 dark:text-slate-300 dark:hover:bg-slate-800"
          title="重置方位"
        >
          <Compass className="h-4 w-4" />
        </button>
        <button
          onClick={handleFitView}
          className="flex h-8 w-8 items-center justify-center rounded bg-white/90 text-slate-700 shadow hover:bg-white dark:bg-slate-800/90 dark:text-slate-300 dark:hover:bg-slate-800"
          title="适应视图"
        >
          <Maximize className="h-4 w-4" />
        </button>
      </div>

      {/* 比例尺和坐标显示 */}
      <div className="absolute bottom-4 left-4 rounded bg-black/50 px-2 py-1 text-xs text-white">
        {currentScene?.cameraDefaults.center
          ? `${currentScene.cameraDefaults.center.longitude.toFixed(4)}, ${currentScene.cameraDefaults.center.latitude.toFixed(4)}`
          : '116.4074, 39.9042'}
      </div>
    </div>
  );
}

export default EditorCanvas;
