/**
 * 编辑器画布组件
 * 核心地图渲染和交互区域
 * 
 * @description
 * 画布组件是编辑器的核心区域，负责：
 * - MapLibre GL 地图渲染
 * - 地图交互（缩放、平移、旋转）
 * - 图层叠加和可视化
 * - 标签渲染和碰撞检测
 * - 地图控件（缩放、指南针、比例尺等）
 */
import { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import Map, { 
  NavigationControl, 
  ScaleControl, 
  GeolocateControl,
  Source,
  Layer,
  type MapRef,
  type ViewStateChangeEvent,
} from 'react-map-gl/maplibre';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ZoomIn,
  ZoomOut,
  Compass,
  Maximize2,
  MousePointer,
  Move,
  RotateCcw,
  Grid3X3,
  Eye,
  EyeOff,
  MapPin,
  Navigation,
  Crosshair,
} from 'lucide-react';

import { useProjectStore } from '@/stores/projectStore';
import { useTimelineStore } from '@/stores/timelineStore';
import { useEditorStore } from '@/stores/editorStore';

import 'maplibre-gl/dist/maplibre-gl.css';

/** 视图状态接口 */
interface ViewState {
  /** 经度 */
  longitude: number;
  /** 纬度 */
  latitude: number;
  /** 缩放级别 */
  zoom: number;
  /** 俯仰角度 */
  pitch: number;
  /** 方位角度 */
  bearing: number;
}

/** 地图工具类型 */
type MapTool = 'select' | 'pan' | 'marker' | 'route' | 'measure';

// 地图样式现在由 editorStore 管理，通过 StyleSelector 组件切换

/** 默认视图状态 - 北京 */
const DEFAULT_VIEW_STATE: ViewState = {
  longitude: 116.4074,
  latitude: 39.9042,
  zoom: 10,
  pitch: 45,
  bearing: 0,
};

/**
 * EditorCanvas - 编辑器画布组件
 * 
 * @description
 * 提供完整的地图编辑功能，包括：
 * - 地图视图管理
 * - 图层渲染
 * - 交互工具栏
 * - 状态信息显示
 */
export function EditorCanvas() {
  const { t } = useTranslation();
  const mapRef = useRef<MapRef>(null);
  
  /** 当前项目数据 */
  const { currentProject } = useProjectStore();
  
  /** 时间线当前时间 */
  const currentTime = useTimelineStore((state: { currentTime: number }) => state.currentTime);
  
  /** 地图样式 URL */
  const mapStyleUrl = useEditorStore((state) => state.mapStyleUrl);
  
  /** 视图状态 */
  const [viewState, setViewState] = useState<ViewState>(DEFAULT_VIEW_STATE);
  
  /** 当前选中的工具 */
  const [activeTool, setActiveTool] = useState<MapTool>('select');
  
  /** 是否显示网格 */
  const [showGrid, setShowGrid] = useState(false);
  
  /** 是否显示标签 */
  const [showLabels, setShowLabels] = useState(true);
  
  // 使用从 editorStore 获取的地图样式 URL，不再使用本地状态
  
  /** 是否全屏 */
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  /** 鼠标悬停坐标 */
  const [hoverCoords, setHoverCoords] = useState<{ lng: number; lat: number } | null>(null);

  /**
   * 初始化地图视图
   * 根据项目配置设置初始相机位置
   */
  useEffect(() => {
    if (currentProject?.scenes?.[0]?.cameraDefaults) {
      const camera = currentProject.scenes[0].cameraDefaults;
      setViewState({
        longitude: camera.center.longitude,
        latitude: camera.center.latitude,
        zoom: camera.zoom,
        pitch: camera.pitch,
        bearing: camera.bearing,
      });
    }
  }, [currentProject]);

  /**
   * 处理视图状态变化
   * @param evt - 视图状态变化事件
   */
  const handleViewStateChange = useCallback((evt: ViewStateChangeEvent) => {
    setViewState(evt.viewState);
  }, []);

  /**
   * 处理鼠标移动
   * 更新悬停坐标显示
   */
  const handleMouseMove = useCallback((evt: maplibregl.MapMouseEvent) => {
    setHoverCoords({
      lng: Number(evt.lngLat.lng.toFixed(6)),
      lat: Number(evt.lngLat.lat.toFixed(6)),
    });
  }, []);

  /**
   * 重置视图到默认位置
   */
  const handleResetView = useCallback(() => {
    if (currentProject?.scenes?.[0]?.cameraDefaults) {
      const camera = currentProject.scenes[0].cameraDefaults;
      setViewState({
        longitude: camera.center.longitude,
        latitude: camera.center.latitude,
        zoom: camera.zoom,
        pitch: camera.pitch,
        bearing: camera.bearing,
      });
    } else {
      setViewState(DEFAULT_VIEW_STATE);
    }
  }, [currentProject]);

  /**
   * 放大地图
   */
  const handleZoomIn = useCallback(() => {
    setViewState(prev => ({
      ...prev,
      zoom: Math.min(prev.zoom + 1, 22),
    }));
  }, []);

  /**
   * 缩小地图
   */
  const handleZoomOut = useCallback(() => {
    setViewState(prev => ({
      ...prev,
      zoom: Math.max(prev.zoom - 1, 0),
    }));
  }, []);

  /**
   * 重置方位角
   */
  const handleResetBearing = useCallback(() => {
    setViewState(prev => ({
      ...prev,
      bearing: 0,
      pitch: 0,
    }));
  }, []);

  /**
   * 切换全屏模式
   */
  const toggleFullscreen = useCallback(() => {
    setIsFullscreen(prev => !prev);
  }, []);

  /**
   * 工具栏配置
   */
  const tools = useMemo(() => [
    { id: 'select' as MapTool, icon: MousePointer, titleKey: 'tools.select' },
    { id: 'pan' as MapTool, icon: Move, titleKey: 'tools.pan' },
    { id: 'marker' as MapTool, icon: MapPin, titleKey: 'tools.marker' },
    { id: 'route' as MapTool, icon: Navigation, titleKey: 'tools.route' },
    { id: 'measure' as MapTool, icon: Crosshair, titleKey: 'tools.measure' },
  ], []);

  /**
   * 渲染工具按钮
   * @param tool - 工具配置
   */
  const renderToolButton = useCallback((tool: typeof tools[0]) => {
    const Icon = tool.icon;
    const isActive = activeTool === tool.id;
    
    return (
      <button
        key={tool.id}
        onClick={() => setActiveTool(tool.id)}
        className={`
          flex h-8 w-8 items-center justify-center rounded-md transition-all duration-150
          ${isActive 
            ? 'bg-primary-600 text-white' 
            : 'text-slate-400 hover:bg-slate-700 hover:text-slate-200'
          }
        `}
        title={t(tool.titleKey)}
        aria-label={t(tool.titleKey)}
        aria-pressed={isActive}
      >
        <Icon className="h-4 w-4" />
      </button>
    );
  }, [activeTool, t]);

  /**
   * 格式化坐标显示
   * @param value - 坐标值
   * @param type - 坐标类型
   */
  const formatCoordinate = useCallback((value: number, type: 'lng' | 'lat') => {
    const direction = type === 'lng' 
      ? (value >= 0 ? 'E' : 'W')
      : (value >= 0 ? 'N' : 'S');
    return `${Math.abs(value).toFixed(6)}° ${direction}`;
  }, []);

  return (
    <div className={`relative flex-1 overflow-hidden bg-editor-bg ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
      {/* 地图容器 */}
      <Map
        ref={mapRef}
        {...viewState}
        onMove={handleViewStateChange}
        onMouseMove={handleMouseMove}
        mapStyle={mapStyleUrl}
        style={{ width: '100%', height: '100%' }}
        attributionControl={false}
        reuseMaps
        dragRotate
        pitchWithRotate
      >
        {/* 导航控件 */}
        <NavigationControl 
          position="bottom-right" 
          showCompass 
          showZoom={false}
          visualizePitch
        />
        
        {/* 比例尺控件 */}
        <ScaleControl 
          position="bottom-left" 
          maxWidth={100}
          unit="metric"
        />
        
        {/* 定位控件 */}
        <GeolocateControl 
          position="bottom-right"
          trackUserLocation
        />
        
        {/* 网格覆盖层 */}
        {showGrid && (
          <Source
            id="grid-source"
            type="geojson"
            data={{
              type: 'FeatureCollection',
              features: [],
            }}
          >
            <Layer
              id="grid-layer"
              type="line"
              paint={{
                'line-color': '#ffffff',
                'line-opacity': 0.1,
                'line-width': 1,
              }}
            />
          </Source>
        )}
      </Map>
      
      {/* 左上角工具栏 */}
      <div className="absolute left-4 top-4 flex flex-col gap-2">
        {/* 工具选择器 */}
        <div className="flex flex-col gap-1 rounded-lg border border-editor-border bg-editor-sidebar/95 p-1.5 backdrop-blur-sm">
          {tools.map(renderToolButton)}
        </div>
        
        {/* 视图工具 */}
        <div className="flex flex-col gap-1 rounded-lg border border-editor-border bg-editor-sidebar/95 p-1.5 backdrop-blur-sm">
          <button
            onClick={() => setShowGrid(!showGrid)}
            className={`
              flex h-8 w-8 items-center justify-center rounded-md transition-all duration-150
              ${showGrid 
                ? 'bg-primary-600 text-white' 
                : 'text-slate-400 hover:bg-slate-700 hover:text-slate-200'
              }
            `}
            title={t('tools.grid')}
            aria-label={t('tools.grid')}
            aria-pressed={showGrid}
          >
            <Grid3X3 className="h-4 w-4" />
          </button>
          
          <button
            onClick={() => setShowLabels(!showLabels)}
            className={`
              flex h-8 w-8 items-center justify-center rounded-md transition-all duration-150
              ${showLabels 
                ? 'text-slate-200 hover:bg-slate-700' 
                : 'text-slate-500 hover:bg-slate-700 hover:text-slate-400'
              }
            `}
            title={showLabels ? t('tools.hideLabels') : t('tools.showLabels')}
            aria-label={showLabels ? t('tools.hideLabels') : t('tools.showLabels')}
          >
            {showLabels ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
          </button>
        </div>
      </div>
      
      {/* 右上角缩放控件 */}
      <div className="absolute right-4 top-4 flex flex-col gap-2">
        {/* 缩放控制 */}
        <div className="flex flex-col gap-1 rounded-lg border border-editor-border bg-editor-sidebar/95 p-1.5 backdrop-blur-sm">
          <button
            onClick={handleZoomIn}
            className="flex h-8 w-8 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-slate-700 hover:text-slate-200"
            title={t('tools.zoomIn')}
            aria-label={t('tools.zoomIn')}
          >
            <ZoomIn className="h-4 w-4" />
          </button>
          
          <div className="flex h-8 items-center justify-center text-xs font-medium text-slate-300">
            {viewState.zoom.toFixed(1)}
          </div>
          
          <button
            onClick={handleZoomOut}
            className="flex h-8 w-8 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-slate-700 hover:text-slate-200"
            title={t('tools.zoomOut')}
            aria-label={t('tools.zoomOut')}
          >
            <ZoomOut className="h-4 w-4" />
          </button>
        </div>
        
        {/* 视图重置 */}
        <div className="flex flex-col gap-1 rounded-lg border border-editor-border bg-editor-sidebar/95 p-1.5 backdrop-blur-sm">
          <button
            onClick={handleResetBearing}
            className="flex h-8 w-8 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-slate-700 hover:text-slate-200"
            title={t('tools.resetBearing')}
            aria-label={t('tools.resetBearing')}
            style={{ transform: `rotate(${-viewState.bearing}deg)` }}
          >
            <Compass className="h-4 w-4" />
          </button>
          
          <button
            onClick={handleResetView}
            className="flex h-8 w-8 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-slate-700 hover:text-slate-200"
            title={t('tools.resetView')}
            aria-label={t('tools.resetView')}
          >
            <RotateCcw className="h-4 w-4" />
          </button>
          
          <button
            onClick={toggleFullscreen}
            className="flex h-8 w-8 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-slate-700 hover:text-slate-200"
            title={t('tools.fullscreen')}
            aria-label={t('tools.fullscreen')}
          >
            <Maximize2 className="h-4 w-4" />
          </button>
        </div>
      </div>
      
      {/* 底部状态栏 */}
      <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-4 rounded-lg border border-editor-border bg-editor-sidebar/95 px-4 py-2 backdrop-blur-sm">
        {/* 当前时间 */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">{t('canvas.time')}</span>
          <span className="font-mono text-sm text-slate-200">
            {formatTime(currentTime)}
          </span>
        </div>
        
        <div className="h-4 w-px bg-editor-border" />
        
        {/* 坐标显示 */}
        {hoverCoords && (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <span className="text-xs text-slate-500">Lng</span>
              <span className="font-mono text-xs text-slate-300">
                {formatCoordinate(hoverCoords.lng, 'lng')}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-xs text-slate-500">Lat</span>
              <span className="font-mono text-xs text-slate-300">
                {formatCoordinate(hoverCoords.lat, 'lat')}
              </span>
            </div>
          </div>
        )}
        
        <div className="h-4 w-px bg-editor-border" />
        
        {/* 缩放级别 */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">Zoom</span>
          <span className="font-mono text-sm text-slate-200">
            {viewState.zoom.toFixed(2)}
          </span>
        </div>
        
        {/* 俯仰角和方位角 */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">Pitch</span>
          <span className="font-mono text-sm text-slate-200">
            {viewState.pitch.toFixed(0)}°
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">Bearing</span>
          <span className="font-mono text-sm text-slate-200">
            {viewState.bearing.toFixed(0)}°
          </span>
        </div>
      </div>
      
      {/* 数据源署名 */}
      <div className="absolute bottom-4 right-4 rounded bg-black/50 px-2 py-1 text-xs text-slate-400">
        © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer" className="hover:text-slate-200">OpenStreetMap</a>
        {' | '}
        © <a href="https://carto.com/attributions" target="_blank" rel="noopener noreferrer" className="hover:text-slate-200">CARTO</a>
      </div>
      
      {/* 全屏退出提示 */}
      <AnimatePresence>
        {isFullscreen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute left-1/2 top-4 -translate-x-1/2 rounded-lg bg-black/70 px-4 py-2 text-sm text-white"
          >
            {t('canvas.pressEscToExit')}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * 格式化时间显示
 * @param ms - 毫秒数
 * @returns 格式化后的时间字符串 (MM:SS.ms)
 */
function formatTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const milliseconds = Math.floor((ms % 1000) / 10);
  
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}`;
}

export default EditorCanvas;
