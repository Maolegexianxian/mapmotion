/**
 * 图层管理器
 * 管理地图上的所有图层
 */
import maplibregl from 'maplibre-gl';
import type { LayerConfig } from '@/types';

type InternalLayerType = 'point' | 'line' | 'polygon' | 'symbol' | 'heatmap' | '3d-model' | 'raster' | 'background';

interface LayerMetadata {
  config: LayerConfig;
  order: number;
  sourceId: string | null;
}

/**
 * LayerManager - 图层管理器
 */
export class LayerManager {
  private map: maplibregl.Map;
  private layers: globalThis.Map<string, LayerMetadata> = new globalThis.Map();
  private orderCounter = 0;

  constructor(map: maplibregl.Map) {
    this.map = map;
  }

  addLayer(config: LayerConfig, beforeId?: string): string {
    const { id, visible = true, opacity = 1 } = config;

    if (this.layers.has(id)) {
      this.updateLayer(id, config);
      return id;
    }

    let sourceId: string | null = null;
    if (config.source) {
      sourceId = `${id}-source`;
      if (!this.map.getSource(sourceId)) {
        this.map.addSource(sourceId, config.source as maplibregl.SourceSpecification);
      }
    }

    const layerSpec = this.buildLayerSpec(config, sourceId);
    this.map.addLayer(layerSpec, beforeId);

    if (!visible) this.map.setLayoutProperty(id, 'visibility', 'none');
    this.setLayerOpacity(id, opacity);

    this.layers.set(id, { config, order: this.orderCounter++, sourceId });
    return id;
  }

  private buildLayerSpec(config: LayerConfig, sourceId: string | null): maplibregl.LayerSpecification {
    const { id, type, paint, layout, filter, minzoom, maxzoom } = config;
    const spec: Record<string, unknown> = { id, type: this.mapLayerType(type) };
    if (sourceId) spec.source = sourceId;
    if (config.sourceLayer) spec['source-layer'] = config.sourceLayer;
    if (paint) spec.paint = paint;
    if (layout) spec.layout = layout;
    if (filter) spec.filter = filter;
    if (minzoom !== undefined) spec.minzoom = minzoom;
    if (maxzoom !== undefined) spec.maxzoom = maxzoom;
    return spec as maplibregl.LayerSpecification;
  }

  private mapLayerType(type: InternalLayerType): string {
    const typeMap: Record<InternalLayerType, string> = {
      point: 'circle', line: 'line', polygon: 'fill', symbol: 'symbol',
      heatmap: 'heatmap', '3d-model': 'fill-extrusion', raster: 'raster', background: 'background',
    };
    return typeMap[type] || 'circle';
  }

  removeLayer(id: string): void {
    const metadata = this.layers.get(id);
    if (!metadata) return;
    if (this.map.getLayer(id)) this.map.removeLayer(id);
    if (metadata.sourceId && this.map.getSource(metadata.sourceId)) this.map.removeSource(metadata.sourceId);
    this.layers.delete(id);
  }

  updateLayer(id: string, config: Partial<LayerConfig>): void {
    const metadata = this.layers.get(id);
    if (!metadata) return;

    if (config.paint) {
      Object.entries(config.paint).forEach(([key, value]) => this.map.setPaintProperty(id, key, value));
    }
    if (config.layout) {
      Object.entries(config.layout).forEach(([key, value]) => this.map.setLayoutProperty(id, key, value));
    }
    if (config.visible !== undefined) this.setLayerVisibility(id, config.visible);
    if (config.opacity !== undefined) this.setLayerOpacity(id, config.opacity);
    if (config.filter !== undefined) this.map.setFilter(id, config.filter as maplibregl.FilterSpecification);

    metadata.config = { ...metadata.config, ...config };
  }

  setLayerVisibility(id: string, visible: boolean): void {
    if (this.map.getLayer(id)) this.map.setLayoutProperty(id, 'visibility', visible ? 'visible' : 'none');
  }

  setLayerOpacity(id: string, opacity: number): void {
    const layer = this.map.getLayer(id);
    if (!layer) return;
    const opacityMap: Record<string, string> = {
      fill: 'fill-opacity', line: 'line-opacity', circle: 'circle-opacity',
      symbol: 'icon-opacity', raster: 'raster-opacity', heatmap: 'heatmap-opacity',
      'fill-extrusion': 'fill-extrusion-opacity',
    };
    const prop = opacityMap[layer.type];
    if (prop) this.map.setPaintProperty(id, prop, opacity);
  }

  moveLayer(id: string, beforeId?: string): void {
    if (this.map.getLayer(id)) this.map.moveLayer(id, beforeId);
  }

  getLayer(id: string): LayerConfig | undefined { return this.layers.get(id)?.config; }
  getAllLayerIds(): string[] { return Array.from(this.layers.keys()); }
  getLayerCount(): number { return this.layers.size; }
  hasLayer(id: string): boolean { return this.layers.has(id); }
  clearAll(): void { this.getAllLayerIds().forEach((id) => this.removeLayer(id)); }
  addLayers(configs: LayerConfig[]): void { configs.forEach((config) => this.addLayer(config)); }
  getPaintProperty(id: string, property: string): unknown { return this.map.getPaintProperty(id, property); }
  getLayoutProperty(id: string, property: string): unknown { return this.map.getLayoutProperty(id, property); }
}

export default LayerManager;
