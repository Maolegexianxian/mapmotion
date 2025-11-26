/**
 * 编辑器地图画布组件
 * 使用 MapLibre GL 渲染地图，支持工具交互和标记显示
 */
import { useRef, useEffect, useState, useCallback } from 'react';
import maplibregl from 'maplibre-gl';
import {
  ZoomIn,
  ZoomOut,
  Compass,
  Maximize,
  MousePointer,
  Hand,
  MapPin,
  Type,
  Hexagon,
  Search,
} from 'lucide-react';

import { useProjectStore } from '@/stores/projectStore';
import { useEditorStore, type EditorTool } from '@/stores/editorStore';
import { SearchPanel, type SearchResult } from './SearchPanel';

import 'maplibre-gl/dist/maplibre-gl.css';

/** 默认地图样式 URL */
const DEFAULT_STYLE = 'https://demotiles.maplibre.org/style.json';

/** 工具配置 */
const TOOLS: Array<{ id: EditorTool; icon: typeof MousePointer; label: string; cursor: string }> = [
  { id: 'select', icon: MousePointer, label: '选择', cursor: 'default' },
  { id: 'pan', icon: Hand, label: '平移', cursor: 'grab' },
  { id: 'draw-point', icon: MapPin, label: '添加标记', cursor: 'crosshair' },
  { id: 'label', icon: Type, label: '添加标签', cursor: 'text' },
  { id: 'draw-polygon', icon: Hexagon, label: '绘制区域', cursor: 'crosshair' },
];

/** 标记数据 */
interface MarkerData {
  id: string;
  lngLat: [number, number];
  color: string;
  label?: string;
}

/** 初始标记数据 */
const initialMarkers: MarkerData[] = [
  { id: 'm1', lngLat: [116.4074, 39.9042], color: '#ef4444', label: '北京' },
  { id: 'm2', lngLat: [121.4737, 31.2304], color: '#3b82f6', label: '上海' },
  { id: 'm3', lngLat: [113.2644, 23.1291], color: '#22c55e', label: '广州' },
];

/**
 * EditorCanvas - 地图画布组件
 */
export function EditorCanvas() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<Map<string, maplibregl.Marker>>(new Map());
  
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [mousePosition, setMousePosition] = useState<{ lng: number; lat: number } | null>(null);
  const [showSearch, setShowSearch] = useState(false);
  const [markers, setMarkers] = useState<MarkerData[]>(initialMarkers);

  const { currentProject, currentSceneIndex } = useProjectStore();
  const currentScene = currentProject?.scenes[currentSceneIndex];
  
  const { currentTool, setTool, select } = useEditorStore();

  // 初始化地图
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: DEFAULT_STYLE,
      center: currentScene?.cameraDefaults.center
        ? [currentScene.cameraDefaults.center.longitude, currentScene.cameraDefaults.center.latitude]
        : [116.4074, 39.9042],
      zoom: currentScene?.cameraDefaults.zoom ?? 4,
      pitch: currentScene?.cameraDefaults.pitch ?? 0,
      bearing: currentScene?.cameraDefaults.bearing ?? 0,
      antialias: true,
    });

    map.on('load', () => {
      setIsMapLoaded(true);
    });

    // 鼠标移动追踪
    map.on('mousemove', (e) => {
      setMousePosition({ lng: e.lngLat.lng, lat: e.lngLat.lat });
    });

    map.on('mouseout', () => {
      setMousePosition(null);
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // 根据工具更新光标
  useEffect(() => {
    if (!mapRef.current) return;
    const tool = TOOLS.find((t) => t.id === currentTool);
    if (tool) {
      mapRef.current.getCanvas().style.cursor = tool.cursor;
    }
    
    // 平移工具禁用拖拽交互
    if (currentTool === 'pan') {
      mapRef.current.dragPan.enable();
    }
  }, [currentTool]);

  // 渲染标记
  useEffect(() => {
    if (!mapRef.current || !isMapLoaded) return;

    // 清除现有标记
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current.clear();

    // 添加新标记
    markers.forEach((data) => {
      const el = document.createElement('div');
      el.className = 'marker-element';
      el.style.cssText = `
        width: 24px;
        height: 24px;
        background: ${data.color};
        border: 2px solid white;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        cursor: pointer;
      `;

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat(data.lngLat)
        .addTo(mapRef.current!);

      // 点击选中
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        select({ type: 'feature', id: data.id });
      });

      // 添加标签
      if (data.label) {
        const popup = new maplibregl.Popup({
          offset: 25,
          closeButton: false,
          closeOnClick: false,
        }).setHTML(`<div style="font-size:12px;font-weight:500;">${data.label}</div>`);
        
        el.addEventListener('mouseenter', () => popup.addTo(mapRef.current!));
        el.addEventListener('mouseleave', () => popup.remove());
        marker.setPopup(popup);
      }

      markersRef.current.set(data.id, marker);
    });
  }, [markers, isMapLoaded, select]);

  // 地图点击事件
  useEffect(() => {
    if (!mapRef.current || !isMapLoaded) return;

    const handleClick = (e: maplibregl.MapMouseEvent) => {
      if (currentTool === 'draw-point') {
        // 添加新标记
        const newMarker: MarkerData = {
          id: `m_${Date.now()}`,
          lngLat: [e.lngLat.lng, e.lngLat.lat],
          color: '#f59e0b',
          label: `标记 ${markers.length + 1}`,
        };
        setMarkers((prev) => [...prev, newMarker]);
        select({ type: 'feature', id: newMarker.id });
      }
    };

    mapRef.current.on('click', handleClick);
    return () => {
      mapRef.current?.off('click', handleClick);
    };
  }, [currentTool, markers.length, isMapLoaded, select]);

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
    if (markers.length > 0) {
      const bounds = new maplibregl.LngLatBounds();
      markers.forEach((m) => bounds.extend(m.lngLat));
      mapRef.current?.fitBounds(bounds, { padding: 50 });
    } else if (currentScene?.bounds) {
      mapRef.current?.fitBounds([
        [currentScene.bounds.west, currentScene.bounds.south],
        [currentScene.bounds.east, currentScene.bounds.north],
      ]);
    }
  }, [currentScene, markers]);

  // 搜索选择
  const handleSearchSelect = useCallback((result: SearchResult) => {
    mapRef.current?.flyTo({
      center: [result.coordinates.lng, result.coordinates.lat],
      zoom: 12,
    });
    setShowSearch(false);
  }, []);

  return (
    <div className="relative flex-1 bg-editor-panel">
      {/* 地图容器 */}
      <div ref={mapContainerRef} className="h-full w-full" />

      {/* 加载指示器 */}
      {!isMapLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-editor-panel">
          <div className="flex flex-col items-center gap-2">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
            <div className="text-sm text-slate-400">加载地图中...</div>
          </div>
        </div>
      )}

      {/* 左侧工具栏 */}
      <div className="absolute left-4 top-4 flex flex-col gap-1 rounded-lg bg-white/95 p-1 shadow-lg dark:bg-slate-800/95">
        {TOOLS.map((tool) => {
          const Icon = tool.icon;
          const isActive = currentTool === tool.id;
          return (
            <button
              key={tool.id}
              onClick={() => setTool(tool.id)}
              className={`flex h-8 w-8 items-center justify-center rounded transition-colors ${
                isActive
                  ? 'bg-primary-500 text-white'
                  : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700'
              }`}
              title={tool.label}
            >
              <Icon className="h-4 w-4" />
            </button>
          );
        })}
        <hr className="my-1 border-slate-200 dark:border-slate-600" />
        <button
          onClick={() => setShowSearch(true)}
          className="flex h-8 w-8 items-center justify-center rounded text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700"
          title="搜索地点"
        >
          <Search className="h-4 w-4" />
        </button>
      </div>

      {/* 右侧地图控件 */}
      <div className="absolute right-4 top-4 flex flex-col gap-1 rounded-lg bg-white/95 p-1 shadow-lg dark:bg-slate-800/95">
        <button
          onClick={handleZoomIn}
          className="flex h-8 w-8 items-center justify-center rounded text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700"
          title="放大"
        >
          <ZoomIn className="h-4 w-4" />
        </button>
        <button
          onClick={handleZoomOut}
          className="flex h-8 w-8 items-center justify-center rounded text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700"
          title="缩小"
        >
          <ZoomOut className="h-4 w-4" />
        </button>
        <hr className="my-1 border-slate-200 dark:border-slate-600" />
        <button
          onClick={handleResetBearing}
          className="flex h-8 w-8 items-center justify-center rounded text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700"
          title="重置方位"
        >
          <Compass className="h-4 w-4" />
        </button>
        <button
          onClick={handleFitView}
          className="flex h-8 w-8 items-center justify-center rounded text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700"
          title="适应视图"
        >
          <Maximize className="h-4 w-4" />
        </button>
      </div>

      {/* 底部信息栏 */}
      <div className="absolute bottom-4 left-4 flex items-center gap-3">
        {/* 坐标显示 */}
        <div className="rounded bg-black/60 px-2 py-1 text-xs text-white font-mono">
          {mousePosition
            ? `${mousePosition.lng.toFixed(4)}, ${mousePosition.lat.toFixed(4)}`
            : '移动鼠标查看坐标'}
        </div>
        {/* 当前工具 */}
        <div className="rounded bg-primary-500/80 px-2 py-1 text-xs text-white">
          {TOOLS.find((t) => t.id === currentTool)?.label || '选择'}
        </div>
        {/* 标记数量 */}
        <div className="rounded bg-black/60 px-2 py-1 text-xs text-white">
          {markers.length} 个标记
        </div>
      </div>

      {/* 搜索面板 */}
      {showSearch && (
        <div className="absolute left-16 top-4 w-80 rounded-lg bg-editor-panel shadow-xl">
          <SearchPanel
            onSelect={handleSearchSelect}
            onClose={() => setShowSearch(false)}
          />
        </div>
      )}
    </div>
  );
}

export default EditorCanvas;
