/**
 * 数据导入器
 * 支持 CSV、GeoJSON、KML 等格式的数据导入
 */
import type { GeoCoordinate } from '@/types';

/** 导入数据类型 */
export type ImportDataType = 'csv' | 'geojson' | 'kml' | 'gpx';

/** 导入结果接口 */
export interface ImportResult {
  /** 是否成功 */
  success: boolean;
  /** 导入的要素列表 */
  features: ImportedFeature[];
  /** 错误信息 */
  errors: string[];
  /** 警告信息 */
  warnings: string[];
  /** 导入统计 */
  stats: {
    total: number;
    imported: number;
    skipped: number;
  };
}

/** 导入的要素接口 */
export interface ImportedFeature {
  /** 要素 ID */
  id: string;
  /** 要素名称 */
  name: string;
  /** 几何类型 */
  geometryType: 'Point' | 'LineString' | 'Polygon' | 'MultiPoint' | 'MultiLineString' | 'MultiPolygon';
  /** 坐标数据 */
  coordinates: GeoCoordinate | GeoCoordinate[] | GeoCoordinate[][];
  /** 属性数据 */
  properties: Record<string, unknown>;
}

/** CSV 解析选项 */
export interface CSVParseOptions {
  /** 分隔符 */
  delimiter?: string;
  /** 是否有表头 */
  hasHeader?: boolean;
  /** 经度字段名 */
  longitudeField?: string;
  /** 纬度字段名 */
  latitudeField?: string;
  /** 名称字段名 */
  nameField?: string;
  /** 编码 */
  encoding?: string;
}

/**
 * DataImporter - 数据导入器
 */
export class DataImporter {
  /**
   * 从文件导入数据
   * @param file - 文件对象
   * @param type - 数据类型（可选，自动检测）
   * @param options - 解析选项
   */
  async importFromFile(
    file: File,
    type?: ImportDataType,
    options?: CSVParseOptions
  ): Promise<ImportResult> {
    const detectedType = type || this.detectFileType(file.name);
    const content = await this.readFile(file);

    switch (detectedType) {
      case 'csv':
        return this.parseCSV(content, options);
      case 'geojson':
        return this.parseGeoJSON(content);
      case 'kml':
        return this.parseKML(content);
      case 'gpx':
        return this.parseGPX(content);
      default:
        return {
          success: false,
          features: [],
          errors: [`不支持的文件格式: ${detectedType}`],
          warnings: [],
          stats: { total: 0, imported: 0, skipped: 0 },
        };
    }
  }

  /**
   * 从 URL 导入数据
   * @param url - 数据 URL
   * @param type - 数据类型
   * @param options - 解析选项
   */
  async importFromURL(
    url: string,
    type: ImportDataType,
    options?: CSVParseOptions
  ): Promise<ImportResult> {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const content = await response.text();

      switch (type) {
        case 'csv':
          return this.parseCSV(content, options);
        case 'geojson':
          return this.parseGeoJSON(content);
        case 'kml':
          return this.parseKML(content);
        case 'gpx':
          return this.parseGPX(content);
        default:
          return {
            success: false,
            features: [],
            errors: [`不支持的数据类型: ${type}`],
            warnings: [],
            stats: { total: 0, imported: 0, skipped: 0 },
          };
      }
    } catch (error) {
      return {
        success: false,
        features: [],
        errors: [`加载失败: ${error instanceof Error ? error.message : '未知错误'}`],
        warnings: [],
        stats: { total: 0, imported: 0, skipped: 0 },
      };
    }
  }

  /**
   * 检测文件类型
   * @param filename - 文件名
   */
  private detectFileType(filename: string): ImportDataType {
    const ext = filename.toLowerCase().split('.').pop();
    switch (ext) {
      case 'csv':
      case 'tsv':
        return 'csv';
      case 'geojson':
      case 'json':
        return 'geojson';
      case 'kml':
        return 'kml';
      case 'gpx':
        return 'gpx';
      default:
        return 'csv';
    }
  }

  /**
   * 读取文件内容
   * @param file - 文件对象
   */
  private readFile(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error('文件读取失败'));
      reader.readAsText(file, 'UTF-8');
    });
  }

  /**
   * 解析 CSV 数据
   * @param content - CSV 内容
   * @param options - 解析选项
   */
  parseCSV(content: string, options?: CSVParseOptions): ImportResult {
    const {
      delimiter = ',',
      hasHeader = true,
      longitudeField = 'longitude',
      latitudeField = 'latitude',
      nameField = 'name',
    } = options || {};

    const features: ImportedFeature[] = [];
    const errors: string[] = [];
    const warnings: string[] = [];
    
    const lines = content.trim().split(/\r?\n/);
    if (lines.length === 0) {
      return {
        success: false,
        features: [],
        errors: ['CSV 文件为空'],
        warnings: [],
        stats: { total: 0, imported: 0, skipped: 0 },
      };
    }

    // 解析表头
    let headers: string[] = [];
    let dataStartIndex = 0;

    if (hasHeader && lines[0]) {
      headers = this.parseCSVLine(lines[0], delimiter);
      dataStartIndex = 1;
    } else {
      // 自动生成表头
      const firstLine = lines[0];
      if (firstLine) {
        const count = this.parseCSVLine(firstLine, delimiter).length;
        headers = Array.from({ length: count }, (_, i) => `field_${i}`);
      }
    }

    // 查找坐标字段索引
    const lngIndex = this.findFieldIndex(headers, longitudeField, ['lng', 'lon', 'x', '经度']);
    const latIndex = this.findFieldIndex(headers, latitudeField, ['lat', 'y', '纬度']);
    const nameIndex = this.findFieldIndex(headers, nameField, ['title', '名称', '标题']);

    if (lngIndex === -1 || latIndex === -1) {
      return {
        success: false,
        features: [],
        errors: ['找不到经纬度字段，请指定 longitudeField 和 latitudeField'],
        warnings: [],
        stats: { total: lines.length - dataStartIndex, imported: 0, skipped: lines.length - dataStartIndex },
      };
    }

    // 解析数据行
    let imported = 0;
    let skipped = 0;

    for (let i = dataStartIndex; i < lines.length; i++) {
      const line = lines[i];
      if (!line || !line.trim()) {
        skipped++;
        continue;
      }

      try {
        const values = this.parseCSVLine(line, delimiter);
        const lng = parseFloat(values[lngIndex] || '');
        const lat = parseFloat(values[latIndex] || '');

        if (isNaN(lng) || isNaN(lat)) {
          warnings.push(`第 ${i + 1} 行: 无效的坐标值`);
          skipped++;
          continue;
        }

        // 构建属性对象
        const properties: Record<string, unknown> = {};
        headers.forEach((header, index) => {
          properties[header] = values[index];
        });

        const feature: ImportedFeature = {
          id: `csv-${i}`,
          name: nameIndex !== -1 ? (values[nameIndex] || `点 ${i}`) : `点 ${i}`,
          geometryType: 'Point',
          coordinates: { longitude: lng, latitude: lat },
          properties,
        };

        features.push(feature);
        imported++;
      } catch (error) {
        warnings.push(`第 ${i + 1} 行: 解析失败`);
        skipped++;
      }
    }

    return {
      success: imported > 0,
      features,
      errors,
      warnings,
      stats: { total: lines.length - dataStartIndex, imported, skipped },
    };
  }

  /**
   * 解析 CSV 行
   * @param line - CSV 行
   * @param delimiter - 分隔符
   */
  private parseCSVLine(line: string, delimiter: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      const nextChar = line[i + 1];

      if (inQuotes) {
        if (char === '"' && nextChar === '"') {
          current += '"';
          i++;
        } else if (char === '"') {
          inQuotes = false;
        } else {
          current += char;
        }
      } else {
        if (char === '"') {
          inQuotes = true;
        } else if (char === delimiter) {
          result.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
    }

    result.push(current.trim());
    return result;
  }

  /**
   * 查找字段索引
   * @param headers - 表头数组
   * @param fieldName - 字段名
   * @param aliases - 别名数组
   */
  private findFieldIndex(headers: string[], fieldName: string, aliases: string[]): number {
    const lowerHeaders = headers.map((h) => h.toLowerCase());
    
    // 精确匹配
    let index = lowerHeaders.indexOf(fieldName.toLowerCase());
    if (index !== -1) return index;

    // 别名匹配
    for (const alias of aliases) {
      index = lowerHeaders.indexOf(alias.toLowerCase());
      if (index !== -1) return index;
    }

    // 包含匹配
    for (let i = 0; i < lowerHeaders.length; i++) {
      if (lowerHeaders[i]?.includes(fieldName.toLowerCase())) {
        return i;
      }
    }

    return -1;
  }

  /**
   * 解析 GeoJSON 数据
   * @param content - GeoJSON 内容
   */
  parseGeoJSON(content: string): ImportResult {
    const features: ImportedFeature[] = [];
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      const geojson = JSON.parse(content);
      
      let geoFeatures: GeoJSONFeature[] = [];
      
      if (geojson.type === 'FeatureCollection') {
        geoFeatures = geojson.features || [];
      } else if (geojson.type === 'Feature') {
        geoFeatures = [geojson];
      } else if (geojson.type && geojson.coordinates) {
        // 直接是几何对象
        geoFeatures = [{ type: 'Feature', geometry: geojson, properties: {} }];
      } else {
        errors.push('无效的 GeoJSON 格式');
        return {
          success: false,
          features: [],
          errors,
          warnings: [],
          stats: { total: 0, imported: 0, skipped: 0 },
        };
      }

      let imported = 0;
      let skipped = 0;

      geoFeatures.forEach((feature, index) => {
        try {
          const imported_feature = this.convertGeoJSONFeature(feature, index);
          if (imported_feature) {
            features.push(imported_feature);
            imported++;
          } else {
            skipped++;
          }
        } catch (error) {
          warnings.push(`要素 ${index}: 转换失败`);
          skipped++;
        }
      });

      return {
        success: imported > 0,
        features,
        errors,
        warnings,
        stats: { total: geoFeatures.length, imported, skipped },
      };
    } catch (error) {
      return {
        success: false,
        features: [],
        errors: [`JSON 解析失败: ${error instanceof Error ? error.message : '未知错误'}`],
        warnings: [],
        stats: { total: 0, imported: 0, skipped: 0 },
      };
    }
  }

  /**
   * 转换 GeoJSON 要素
   * @param feature - GeoJSON 要素
   * @param index - 索引
   */
  private convertGeoJSONFeature(feature: GeoJSONFeature, index: number): ImportedFeature | null {
    if (!feature.geometry || !feature.geometry.coordinates) {
      return null;
    }

    const geometry = feature.geometry;
    const properties = feature.properties || {};

    return {
      id: feature.id?.toString() || `geojson-${index}`,
      name: (properties.name as string) || (properties.title as string) || `要素 ${index + 1}`,
      geometryType: geometry.type as ImportedFeature['geometryType'],
      coordinates: this.convertCoordinates(geometry.type, geometry.coordinates),
      properties,
    };
  }

  /**
   * 转换坐标
   * @param type - 几何类型
   * @param coordinates - 坐标数组
   */
  private convertCoordinates(
    type: string,
    coordinates: number[] | number[][] | number[][][] | number[][][][]
  ): GeoCoordinate | GeoCoordinate[] | GeoCoordinate[][] {
    const makeCoord = (coord: number[]): GeoCoordinate => {
      const result: GeoCoordinate = { longitude: coord[0] ?? 0, latitude: coord[1] ?? 0 };
      if (coord[2] !== undefined) result.altitude = coord[2];
      return result;
    };

    switch (type) {
      case 'Point':
        return makeCoord(coordinates as number[]);
      case 'LineString':
      case 'MultiPoint':
        return (coordinates as number[][]).map(makeCoord);
      case 'Polygon':
      case 'MultiLineString':
        return (coordinates as number[][][]).map((ring) => ring.map(makeCoord));
      default:
        return { longitude: 0, latitude: 0 };
    }
  }

  /**
   * 解析 KML 数据
   * @param content - KML 内容
   */
  parseKML(content: string): ImportResult {
    const features: ImportedFeature[] = [];
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(content, 'text/xml');
      
      const parseError = doc.querySelector('parsererror');
      if (parseError) {
        errors.push('KML 格式错误');
        return {
          success: false,
          features: [],
          errors,
          warnings: [],
          stats: { total: 0, imported: 0, skipped: 0 },
        };
      }

      const placemarks = doc.querySelectorAll('Placemark');
      let imported = 0;
      let skipped = 0;

      placemarks.forEach((placemark, index) => {
        try {
          const name = placemark.querySelector('name')?.textContent || `地标 ${index + 1}`;
          const description = placemark.querySelector('description')?.textContent || '';

          // 解析 Point
          const point = placemark.querySelector('Point coordinates');
          if (point?.textContent) {
            const coords = point.textContent.trim().split(',').map(Number);
            const coord: GeoCoordinate = { longitude: coords[0] ?? 0, latitude: coords[1] ?? 0 };
            if (coords[2] !== undefined) coord.altitude = coords[2];
            features.push({
              id: `kml-point-${index}`,
              name,
              geometryType: 'Point',
              coordinates: coord,
              properties: { description },
            });
            imported++;
            return;
          }

          // 解析 LineString
          const lineString = placemark.querySelector('LineString coordinates');
          if (lineString?.textContent) {
            const coordsList = lineString.textContent.trim().split(/\s+/);
            const coordinates: GeoCoordinate[] = coordsList.map((c) => {
              const [lng, lat, alt] = c.split(',').map(Number);
              const result: GeoCoordinate = { longitude: lng ?? 0, latitude: lat ?? 0 };
              if (alt !== undefined) result.altitude = alt;
              return result;
            });
            features.push({
              id: `kml-line-${index}`,
              name,
              geometryType: 'LineString',
              coordinates,
              properties: { description },
            });
            imported++;
            return;
          }

          // 解析 Polygon
          const polygon = placemark.querySelector('Polygon outerBoundaryIs LinearRing coordinates');
          if (polygon?.textContent) {
            const coordsList = polygon.textContent.trim().split(/\s+/);
            const coordinates: GeoCoordinate[] = coordsList.map((c) => {
              const [lng, lat, alt] = c.split(',').map(Number);
              const result: GeoCoordinate = { longitude: lng ?? 0, latitude: lat ?? 0 };
              if (alt !== undefined) result.altitude = alt;
              return result;
            });
            features.push({
              id: `kml-polygon-${index}`,
              name,
              geometryType: 'Polygon',
              coordinates: [coordinates],
              properties: { description },
            });
            imported++;
            return;
          }

          skipped++;
        } catch (error) {
          warnings.push(`地标 ${index}: 解析失败`);
          skipped++;
        }
      });

      return {
        success: imported > 0,
        features,
        errors,
        warnings,
        stats: { total: placemarks.length, imported, skipped },
      };
    } catch (error) {
      return {
        success: false,
        features: [],
        errors: [`KML 解析失败: ${error instanceof Error ? error.message : '未知错误'}`],
        warnings: [],
        stats: { total: 0, imported: 0, skipped: 0 },
      };
    }
  }

  /**
   * 解析 GPX 数据
   * @param content - GPX 内容
   */
  parseGPX(content: string): ImportResult {
    const features: ImportedFeature[] = [];
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(content, 'text/xml');
      
      const parseError = doc.querySelector('parsererror');
      if (parseError) {
        errors.push('GPX 格式错误');
        return {
          success: false,
          features: [],
          errors,
          warnings: [],
          stats: { total: 0, imported: 0, skipped: 0 },
        };
      }

      let imported = 0;
      let total = 0;

      // 解析航点 (Waypoint)
      const waypoints = doc.querySelectorAll('wpt');
      waypoints.forEach((wpt, index) => {
        total++;
        const lat = parseFloat(wpt.getAttribute('lat') || '0');
        const lon = parseFloat(wpt.getAttribute('lon') || '0');
        const name = wpt.querySelector('name')?.textContent || `航点 ${index + 1}`;
        const ele = parseFloat(wpt.querySelector('ele')?.textContent || '0');

        features.push({
          id: `gpx-wpt-${index}`,
          name,
          geometryType: 'Point',
          coordinates: { longitude: lon, latitude: lat, altitude: ele },
          properties: {},
        });
        imported++;
      });

      // 解析轨迹 (Track)
      const tracks = doc.querySelectorAll('trk');
      tracks.forEach((trk, index) => {
        total++;
        const name = trk.querySelector('name')?.textContent || `轨迹 ${index + 1}`;
        const trkpts = trk.querySelectorAll('trkpt');
        
        const coordinates: GeoCoordinate[] = [];
        trkpts.forEach((trkpt) => {
          const lat = parseFloat(trkpt.getAttribute('lat') || '0');
          const lon = parseFloat(trkpt.getAttribute('lon') || '0');
          const ele = parseFloat(trkpt.querySelector('ele')?.textContent || '0');
          coordinates.push({ longitude: lon, latitude: lat, altitude: ele });
        });

        if (coordinates.length > 0) {
          features.push({
            id: `gpx-trk-${index}`,
            name,
            geometryType: 'LineString',
            coordinates,
            properties: {},
          });
          imported++;
        }
      });

      // 解析路线 (Route)
      const routes = doc.querySelectorAll('rte');
      routes.forEach((rte, index) => {
        total++;
        const name = rte.querySelector('name')?.textContent || `路线 ${index + 1}`;
        const rtepts = rte.querySelectorAll('rtept');
        
        const coordinates: GeoCoordinate[] = [];
        rtepts.forEach((rtept) => {
          const lat = parseFloat(rtept.getAttribute('lat') || '0');
          const lon = parseFloat(rtept.getAttribute('lon') || '0');
          const ele = parseFloat(rtept.querySelector('ele')?.textContent || '0');
          coordinates.push({ longitude: lon, latitude: lat, altitude: ele });
        });

        if (coordinates.length > 0) {
          features.push({
            id: `gpx-rte-${index}`,
            name,
            geometryType: 'LineString',
            coordinates,
            properties: {},
          });
          imported++;
        }
      });

      return {
        success: imported > 0,
        features,
        errors,
        warnings,
        stats: { total, imported, skipped: total - imported },
      };
    } catch (error) {
      return {
        success: false,
        features: [],
        errors: [`GPX 解析失败: ${error instanceof Error ? error.message : '未知错误'}`],
        warnings: [],
        stats: { total: 0, imported: 0, skipped: 0 },
      };
    }
  }
}

/** GeoJSON Feature 类型定义 */
interface GeoJSONFeature {
  type: 'Feature';
  id?: string | number;
  geometry: {
    type: string;
    coordinates: number[] | number[][] | number[][][] | number[][][][];
  };
  properties: Record<string, unknown>;
}

export default DataImporter;
