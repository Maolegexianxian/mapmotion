/**
 * 数据导入对话框组件
 */
import { useState, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Upload, FileText, MapPin, AlertCircle, CheckCircle } from 'lucide-react';

/** 支持的文件类型 */
const _SUPPORTED_FORMATS = [
  { extension: '.csv', mime: 'text/csv', name: 'CSV' },
  { extension: '.json', mime: 'application/json', name: 'GeoJSON' },
  { extension: '.geojson', mime: 'application/geo+json', name: 'GeoJSON' },
  { extension: '.kml', mime: 'application/vnd.google-earth.kml+xml', name: 'KML' },
  { extension: '.gpx', mime: 'application/gpx+xml', name: 'GPX' },
];
void _SUPPORTED_FORMATS; // 避免未使用警告

/** 字段映射 */
interface FieldMapping {
  name?: string;
  latitude?: string;
  longitude?: string;
  value?: string;
}

/** 导入结果 */
export interface ImportResult {
  success: boolean;
  count: number;
  errors: string[];
}

interface DataImportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (data: unknown[], mapping: FieldMapping) => void;
}

/**
 * DataImportDialog - 数据导入对话框
 */
export function DataImportDialog({ isOpen, onClose, onImport }: DataImportDialogProps) {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [file, setFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<unknown[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [mapping, setMapping] = useState<FieldMapping>({});
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<'upload' | 'mapping' | 'preview'>('upload');

  // 处理文件选择
  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setError(null);

    try {
      const content = await readFileContent(selectedFile);
      const { data, columns: cols } = parseFileContent(content, selectedFile.name);
      
      setPreviewData(data.slice(0, 100)); // 只预览前100条
      setColumns(cols);
      
      // 自动检测字段映射
      const autoMapping = detectFieldMapping(cols);
      setMapping(autoMapping);
      
      setStep('mapping');
    } catch (err) {
      setError(err instanceof Error ? err.message : '文件解析失败');
    }
  }, []);

  // 拖放处理
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && fileInputRef.current) {
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(droppedFile);
      fileInputRef.current.files = dataTransfer.files;
      fileInputRef.current.dispatchEvent(new Event('change', { bubbles: true }));
    }
  }, []);

  // 执行导入
  const handleImport = useCallback(() => {
    if (!mapping.latitude || !mapping.longitude) {
      setError('请选择经纬度字段');
      return;
    }
    onImport(previewData, mapping);
    onClose();
    
    // 重置状态
    setFile(null);
    setPreviewData([]);
    setColumns([]);
    setMapping({});
    setStep('upload');
  }, [mapping, previewData, onImport, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 背景遮罩 */}
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      
      {/* 对话框 */}
      <div className="relative z-10 w-full max-w-2xl rounded-lg bg-editor-panel shadow-xl">
        {/* 标题栏 */}
        <div className="flex items-center justify-between border-b border-editor-border px-4 py-3">
          <h3 className="text-sm font-medium text-white">{t('editor.data.title')}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* 内容 */}
        <div className="p-4">
          {/* 步骤指示器 */}
          <div className="mb-4 flex items-center gap-2">
            <StepIndicator step={1} label="上传文件" active={step === 'upload'} completed={step !== 'upload'} />
            <div className="h-px flex-1 bg-editor-border" />
            <StepIndicator step={2} label="字段映射" active={step === 'mapping'} completed={step === 'preview'} />
            <div className="h-px flex-1 bg-editor-border" />
            <StepIndicator step={3} label="预览确认" active={step === 'preview'} completed={false} />
          </div>

          {/* 错误提示 */}
          {error && (
            <div className="mb-4 flex items-center gap-2 rounded bg-red-500/20 px-3 py-2 text-sm text-red-400">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}

          {/* 上传步骤 */}
          {step === 'upload' && (
            <div
              className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-editor-border p-8 hover:border-primary-500"
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
            >
              <Upload className="h-10 w-10 text-slate-500 mb-3" />
              <p className="text-sm text-slate-300 mb-2">拖放文件到此处，或点击选择</p>
              <p className="text-xs text-slate-500 mb-4">{t('editor.data.supportedFormats')}</p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.json,.geojson,.kml,.gpx"
                onChange={handleFileSelect}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="rounded bg-primary-600 px-4 py-2 text-sm text-white hover:bg-primary-700"
              >
                选择文件
              </button>
            </div>
          )}

          {/* 字段映射步骤 */}
          {step === 'mapping' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-slate-300">
                <FileText className="h-4 w-4" />
                <span>{file?.name}</span>
                <span className="text-slate-500">({previewData.length} 条记录)</span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FieldSelect
                  label={t('editor.data.mapping.name')}
                  value={mapping.name || ''}
                  options={columns}
                  onChange={(value) => setMapping({ ...mapping, name: value })}
                />
                <FieldSelect
                  label={t('editor.data.mapping.latitude')}
                  value={mapping.latitude || ''}
                  options={columns}
                  onChange={(value) => setMapping({ ...mapping, latitude: value })}
                  required
                />
                <FieldSelect
                  label={t('editor.data.mapping.longitude')}
                  value={mapping.longitude || ''}
                  options={columns}
                  onChange={(value) => setMapping({ ...mapping, longitude: value })}
                  required
                />
                <FieldSelect
                  label={t('editor.data.mapping.value')}
                  value={mapping.value || ''}
                  options={columns}
                  onChange={(value) => setMapping({ ...mapping, value: value })}
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setStep('upload')}
                  className="rounded px-4 py-1.5 text-sm text-slate-400 hover:bg-editor-hover hover:text-white"
                >
                  上一步
                </button>
                <button
                  onClick={() => setStep('preview')}
                  disabled={!mapping.latitude || !mapping.longitude}
                  className="rounded bg-primary-600 px-4 py-1.5 text-sm text-white hover:bg-primary-700 disabled:opacity-50"
                >
                  下一步
                </button>
              </div>
            </div>
          )}

          {/* 预览步骤 */}
          {step === 'preview' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-green-400">
                <CheckCircle className="h-4 w-4" />
                <span>已解析 {previewData.length} 条数据</span>
              </div>

              {/* 数据预览表格 */}
              <div className="max-h-64 overflow-auto rounded border border-editor-border">
                <table className="w-full text-xs">
                  <thead className="bg-editor-hover text-slate-400">
                    <tr>
                      <th className="px-2 py-1 text-left">#</th>
                      {mapping.name && <th className="px-2 py-1 text-left">名称</th>}
                      <th className="px-2 py-1 text-left">经度</th>
                      <th className="px-2 py-1 text-left">纬度</th>
                      {mapping.value && <th className="px-2 py-1 text-left">数值</th>}
                    </tr>
                  </thead>
                  <tbody className="text-slate-300">
                    {previewData.slice(0, 10).map((row, i) => {
                      const r = row as Record<string, unknown>;
                      return (
                        <tr key={i} className="border-t border-editor-border">
                          <td className="px-2 py-1 text-slate-500">{i + 1}</td>
                          {mapping.name && <td className="px-2 py-1">{String(r[mapping.name] ?? '')}</td>}
                          <td className="px-2 py-1">{mapping.longitude ? String(r[mapping.longitude] ?? '') : ''}</td>
                          <td className="px-2 py-1">{mapping.latitude ? String(r[mapping.latitude] ?? '') : ''}</td>
                          {mapping.value && <td className="px-2 py-1">{String(r[mapping.value] ?? '')}</td>}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setStep('mapping')}
                  className="rounded px-4 py-1.5 text-sm text-slate-400 hover:bg-editor-hover hover:text-white"
                >
                  上一步
                </button>
                <button
                  onClick={handleImport}
                  className="flex items-center gap-2 rounded bg-primary-600 px-4 py-1.5 text-sm text-white hover:bg-primary-700"
                >
                  <MapPin className="h-4 w-4" />
                  导入数据
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/** 步骤指示器 */
interface StepIndicatorProps {
  step: number;
  label: string;
  active: boolean;
  completed: boolean;
}

function StepIndicator({ step, label, active, completed }: StepIndicatorProps) {
  return (
    <div className="flex items-center gap-2">
      <div
        className={`
          flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium
          ${completed ? 'bg-green-500 text-white' : active ? 'bg-primary-500 text-white' : 'bg-editor-hover text-slate-500'}
        `}
      >
        {completed ? '✓' : step}
      </div>
      <span className={`text-xs ${active ? 'text-white' : 'text-slate-500'}`}>{label}</span>
    </div>
  );
}

/** 字段选择器 */
interface FieldSelectProps {
  label: string;
  value?: string;
  options: string[];
  onChange: (value: string) => void;
  required?: boolean;
}

function FieldSelect({ label, value, options, onChange, required }: FieldSelectProps) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-slate-400">
        {label}
        {required && <span className="text-red-400 ml-1">*</span>}
      </label>
      <select
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded bg-editor-hover px-3 py-2 text-sm text-white outline-none focus:ring-1 focus:ring-primary-500"
      >
        <option value="">选择字段...</option>
        {options.map((col) => (
          <option key={col} value={col}>{col}</option>
        ))}
      </select>
    </div>
  );
}

/** 读取文件内容 */
async function readFileContent(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('文件读取失败'));
    reader.readAsText(file);
  });
}

/** 解析文件内容 */
function parseFileContent(content: string, filename: string): { data: unknown[]; columns: string[] } {
  const ext = filename.split('.').pop()?.toLowerCase();
  
  if (ext === 'csv') {
    return parseCSV(content);
  } else if (ext === 'json' || ext === 'geojson') {
    return parseGeoJSON(content);
  }
  
  throw new Error(`不支持的文件格式: .${ext}`);
}

/** 解析 CSV */
function parseCSV(content: string): { data: unknown[]; columns: string[] } {
  const lines = content.trim().split('\n');
  if (lines.length < 2) throw new Error('CSV 文件为空或格式错误');
  
  const headers = lines[0]!.split(',').map(h => h.trim().replace(/^["']|["']$/g, ''));
  const data = lines.slice(1).map(line => {
    const values = line.split(',').map(v => v.trim().replace(/^["']|["']$/g, ''));
    const row: Record<string, string> = {};
    headers.forEach((h, i) => {
      row[h] = values[i] || '';
    });
    return row;
  });
  
  return { data, columns: headers };
}

/** 解析 GeoJSON */
function parseGeoJSON(content: string): { data: unknown[]; columns: string[] } {
  const json = JSON.parse(content);
  
  if (json.type === 'FeatureCollection' && Array.isArray(json.features)) {
    const data = json.features.map((f: { properties?: Record<string, unknown>; geometry?: { coordinates?: number[] } }) => ({
      ...f.properties,
      _lng: f.geometry?.coordinates?.[0],
      _lat: f.geometry?.coordinates?.[1],
    }));
    const columns = data.length > 0 ? Object.keys(data[0] as Record<string, unknown>) : [];
    return { data, columns };
  }
  
  throw new Error('无效的 GeoJSON 格式');
}

/** 自动检测字段映射 */
function detectFieldMapping(columns: string[]): FieldMapping {
  const mapping: FieldMapping = {};
  const lower = columns.map(c => c.toLowerCase());
  
  // 检测名称字段
  const nameFields = ['name', '名称', 'title', '标题', 'label'];
  const nameIndex = lower.findIndex(c => nameFields.some(f => c.includes(f)));
  const nameCol = columns[nameIndex];
  if (nameIndex >= 0 && nameCol) mapping.name = nameCol;
  
  // 检测纬度字段
  const latFields = ['lat', 'latitude', '纬度', '_lat'];
  const latIndex = lower.findIndex(c => latFields.some(f => c.includes(f)));
  const latCol = columns[latIndex];
  if (latIndex >= 0 && latCol) mapping.latitude = latCol;
  
  // 检测经度字段
  const lngFields = ['lng', 'lon', 'longitude', '经度', '_lng'];
  const lngIndex = lower.findIndex(c => lngFields.some(f => c.includes(f)));
  const lngCol = columns[lngIndex];
  if (lngIndex >= 0 && lngCol) mapping.longitude = lngCol;
  
  // 检测数值字段
  const valueFields = ['value', '数值', 'count', '数量', 'amount'];
  const valueIndex = lower.findIndex(c => valueFields.some(f => c.includes(f)));
  const valueCol = columns[valueIndex];
  if (valueIndex >= 0 && valueCol) mapping.value = valueCol;
  
  return mapping;
}

export default DataImportDialog;
