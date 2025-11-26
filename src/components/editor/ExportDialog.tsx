/**
 * 导出对话框组件
 */
import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Download, Loader2 } from 'lucide-react';

/** 导出格式选项 */
const EXPORT_FORMATS = [
  { id: 'mp4', label: 'MP4 视频', extension: '.mp4' },
  { id: 'webm', label: 'WebM 视频', extension: '.webm' },
  { id: 'gif', label: 'GIF 动图', extension: '.gif' },
  { id: 'png', label: 'PNG 序列', extension: '.zip' },
] as const;

/** 分辨率选项 */
const RESOLUTIONS = [
  { id: '720p', width: 1280, height: 720, label: 'HD 720p' },
  { id: '1080p', width: 1920, height: 1080, label: 'Full HD 1080p' },
  { id: '2k', width: 2560, height: 1440, label: '2K QHD' },
  { id: '4k', width: 3840, height: 2160, label: '4K UHD' },
] as const;

/** 帧率选项 */
const FRAME_RATES = [24, 25, 30, 60] as const;

type ExportFormat = typeof EXPORT_FORMATS[number]['id'];
type Resolution = typeof RESOLUTIONS[number]['id'];
type FrameRate = typeof FRAME_RATES[number];

interface ExportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (options: ExportOptions) => void;
  isExporting?: boolean;
  progress?: number;
}

export interface ExportOptions {
  format: ExportFormat;
  resolution: Resolution;
  frameRate: FrameRate;
  quality: number;
  includeAudio: boolean;
}

/**
 * ExportDialog - 导出对话框
 */
export function ExportDialog({
  isOpen,
  onClose,
  onExport,
  isExporting = false,
  progress = 0,
}: ExportDialogProps) {
  const { t } = useTranslation();
  
  const [format, setFormat] = useState<ExportFormat>('mp4');
  const [resolution, setResolution] = useState<Resolution>('1080p');
  const [frameRate, setFrameRate] = useState<FrameRate>(30);
  const [quality, setQuality] = useState(80);
  const [includeAudio, setIncludeAudio] = useState(true);

  const handleExport = useCallback(() => {
    onExport({
      format,
      resolution,
      frameRate,
      quality,
      includeAudio,
    });
  }, [format, resolution, frameRate, quality, includeAudio, onExport]);

  const selectedResolution = RESOLUTIONS.find(r => r.id === resolution);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 背景遮罩 */}
      <div className="absolute inset-0 bg-black/60" onClick={isExporting ? undefined : onClose} />
      
      {/* 对话框 */}
      <div className="relative z-10 w-full max-w-lg rounded-lg bg-editor-panel shadow-xl">
        {/* 标题栏 */}
        <div className="flex items-center justify-between border-b border-editor-border px-4 py-3">
          <h3 className="text-sm font-medium text-white">{t('editor.export.title')}</h3>
          {!isExporting && (
            <button onClick={onClose} className="text-slate-400 hover:text-white">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* 内容 */}
        <div className="p-4 space-y-4">
          {/* 导出进度 */}
          {isExporting && (
            <div className="mb-4 rounded bg-editor-hover p-4">
              <div className="flex items-center gap-2 mb-2">
                <Loader2 className="h-4 w-4 animate-spin text-primary-500" />
                <span className="text-sm text-white">{t('editor.export.progress')}</span>
              </div>
              <div className="h-2 rounded-full bg-slate-700 overflow-hidden">
                <div
                  className="h-full bg-primary-500 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="mt-1 text-right text-xs text-slate-400">{progress}%</div>
            </div>
          )}

          {/* 格式选择 */}
          <div>
            <label className="mb-2 block text-xs font-medium text-slate-400">
              {t('editor.export.format')}
            </label>
            <div className="grid grid-cols-4 gap-2">
              {EXPORT_FORMATS.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFormat(f.id)}
                  disabled={isExporting}
                  className={`
                    rounded px-3 py-2 text-xs font-medium transition-colors
                    ${format === f.id 
                      ? 'bg-primary-600 text-white' 
                      : 'bg-editor-hover text-slate-400 hover:text-white'
                    }
                    disabled:opacity-50
                  `}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* 分辨率选择 */}
          <div>
            <label className="mb-2 block text-xs font-medium text-slate-400">
              {t('editor.export.resolution')}
            </label>
            <div className="grid grid-cols-4 gap-2">
              {RESOLUTIONS.map((r) => (
                <button
                  key={r.id}
                  onClick={() => setResolution(r.id)}
                  disabled={isExporting}
                  className={`
                    rounded px-3 py-2 text-xs transition-colors
                    ${resolution === r.id 
                      ? 'bg-primary-600 text-white' 
                      : 'bg-editor-hover text-slate-400 hover:text-white'
                    }
                    disabled:opacity-50
                  `}
                >
                  {r.label}
                </button>
              ))}
            </div>
            {selectedResolution && (
              <p className="mt-1 text-xs text-slate-500">
                {selectedResolution.width} × {selectedResolution.height}
              </p>
            )}
          </div>

          {/* 帧率选择 */}
          <div>
            <label className="mb-2 block text-xs font-medium text-slate-400">
              {t('editor.export.frameRate')}
            </label>
            <div className="flex gap-2">
              {FRAME_RATES.map((fr) => (
                <button
                  key={fr}
                  onClick={() => setFrameRate(fr)}
                  disabled={isExporting}
                  className={`
                    rounded px-4 py-2 text-xs transition-colors
                    ${frameRate === fr 
                      ? 'bg-primary-600 text-white' 
                      : 'bg-editor-hover text-slate-400 hover:text-white'
                    }
                    disabled:opacity-50
                  `}
                >
                  {fr} fps
                </button>
              ))}
            </div>
          </div>

          {/* 质量滑块 */}
          <div>
            <label className="mb-2 block text-xs font-medium text-slate-400">
              {t('editor.export.quality')}: {quality}%
            </label>
            <input
              type="range"
              value={quality}
              onChange={(e) => setQuality(parseInt(e.target.value))}
              min={10}
              max={100}
              step={5}
              disabled={isExporting}
              className="w-full accent-primary-500"
            />
          </div>

          {/* 包含音频 */}
          {(format === 'mp4' || format === 'webm') && (
            <label className="flex items-center gap-2 text-sm text-slate-300">
              <input
                type="checkbox"
                checked={includeAudio}
                onChange={(e) => setIncludeAudio(e.target.checked)}
                disabled={isExporting}
                className="rounded border-slate-600 bg-editor-hover text-primary-500 focus:ring-primary-500"
              />
              包含音频
            </label>
          )}
        </div>

        {/* 底部按钮 */}
        <div className="flex justify-end gap-2 border-t border-editor-border px-4 py-3">
          <button
            onClick={onClose}
            disabled={isExporting}
            className="rounded px-4 py-1.5 text-sm text-slate-400 hover:bg-editor-hover hover:text-white disabled:opacity-50"
          >
            {t('common.cancel')}
          </button>
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="flex items-center gap-2 rounded bg-primary-600 px-4 py-1.5 text-sm text-white hover:bg-primary-700 disabled:opacity-50"
          >
            {isExporting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                导出中...
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                {t('editor.export.startExport')}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ExportDialog;
