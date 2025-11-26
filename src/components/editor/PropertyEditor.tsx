/**
 * 属性编辑器组件
 * 提供各种属性的编辑控件
 */
import { useState, useCallback, useRef, useEffect } from 'react';
import { ChevronDown, ChevronRight, RotateCcw } from 'lucide-react';

/** 属性组 */
export interface PropertyGroup {
  id: string;
  title: string;
  expanded?: boolean;
  properties: PropertyItem[];
}

/** 属性项 */
export interface PropertyItem {
  id: string;
  label: string;
  type: 'number' | 'text' | 'color' | 'select' | 'slider' | 'toggle' | 'position' | 'size';
  value: unknown;
  min?: number;
  max?: number;
  step?: number;
  options?: Array<{ label: string; value: string | number }>;
  disabled?: boolean;
  unit?: string;
}

interface PropertyEditorProps {
  groups: PropertyGroup[];
  onChange: (propertyId: string, value: unknown) => void;
  onReset?: (propertyId: string) => void;
}

/**
 * PropertyEditor - 属性编辑器
 */
export function PropertyEditor({ groups, onChange, onReset }: PropertyEditorProps) {
  return (
    <div className="space-y-2">
      {groups.map((group) => (
        <PropertyGroupComponent
          key={group.id}
          group={group}
          onChange={onChange}
          onReset={onReset}
        />
      ))}
    </div>
  );
}

/** 属性组组件 */
interface PropertyGroupComponentProps {
  group: PropertyGroup;
  onChange: (propertyId: string, value: unknown) => void;
  onReset?: ((propertyId: string) => void) | undefined;
}

function PropertyGroupComponent({ group, onChange, onReset }: PropertyGroupComponentProps) {
  const [expanded, setExpanded] = useState(group.expanded ?? true);

  return (
    <div className="rounded bg-editor-panel">
      {/* 组标题 */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-medium text-slate-300 hover:bg-editor-hover"
      >
        {expanded ? (
          <ChevronDown className="h-3 w-3" />
        ) : (
          <ChevronRight className="h-3 w-3" />
        )}
        {group.title}
      </button>

      {/* 属性列表 */}
      {expanded && (
        <div className="space-y-1 px-3 pb-3">
          {group.properties.map((property) => (
            <PropertyRow
              key={property.id}
              property={property}
              onChange={(value) => onChange(property.id, value)}
              onReset={onReset ? () => onReset(property.id) : undefined}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/** 属性行 */
interface PropertyRowProps {
  property: PropertyItem;
  onChange: (value: unknown) => void;
  onReset?: (() => void) | undefined;
}

function PropertyRow({ property, onChange, onReset }: PropertyRowProps) {
  return (
    <div className="group flex items-center gap-2">
      <label className="w-20 flex-shrink-0 text-xs text-slate-400">
        {property.label}
      </label>
      <div className="flex-1">
        <PropertyInput property={property} onChange={onChange} />
      </div>
      {onReset && (
        <button
          onClick={onReset}
          className="p-1 text-slate-500 opacity-0 hover:text-white group-hover:opacity-100"
          title="重置"
        >
          <RotateCcw className="h-3 w-3" />
        </button>
      )}
    </div>
  );
}

/** 属性输入控件 */
interface PropertyInputProps {
  property: PropertyItem;
  onChange: (value: unknown) => void;
}

function PropertyInput({ property, onChange }: PropertyInputProps) {
  switch (property.type) {
    case 'number':
      return <NumberInput property={property} onChange={onChange} />;
    case 'text':
      return <TextInput property={property} onChange={onChange} />;
    case 'color':
      return <ColorInput property={property} onChange={onChange} />;
    case 'select':
      return <SelectInput property={property} onChange={onChange} />;
    case 'slider':
      return <SliderInput property={property} onChange={onChange} />;
    case 'toggle':
      return <ToggleInput property={property} onChange={onChange} />;
    case 'position':
      return <PositionInput property={property} onChange={onChange} />;
    case 'size':
      return <SizeInput property={property} onChange={onChange} />;
    default:
      return <TextInput property={property} onChange={onChange} />;
  }
}

/** 数字输入 */
function NumberInput({ property, onChange }: PropertyInputProps) {
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = parseFloat(e.target.value);
      if (!isNaN(value)) {
        onChange(value);
      }
    },
    [onChange]
  );

  return (
    <div className="flex items-center gap-1">
      <input
        type="number"
        value={property.value as number}
        onChange={handleChange}
        min={property.min}
        max={property.max}
        step={property.step ?? 1}
        disabled={property.disabled}
        className="w-full rounded bg-editor-hover px-2 py-1 text-xs text-white outline-none focus:ring-1 focus:ring-primary-500 disabled:opacity-50"
      />
      {property.unit && (
        <span className="text-xs text-slate-500">{property.unit}</span>
      )}
    </div>
  );
}

/** 文本输入 */
function TextInput({ property, onChange }: PropertyInputProps) {
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(e.target.value);
    },
    [onChange]
  );

  return (
    <input
      type="text"
      value={property.value as string}
      onChange={handleChange}
      disabled={property.disabled}
      className="w-full rounded bg-editor-hover px-2 py-1 text-xs text-white outline-none focus:ring-1 focus:ring-primary-500 disabled:opacity-50"
    />
  );
}

/** 颜色输入 */
function ColorInput({ property, onChange }: PropertyInputProps) {
  const [showPicker, setShowPicker] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  // 点击外部关闭
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setShowPicker(false);
      }
    };
    if (showPicker) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showPicker]);

  const color = property.value as string;

  return (
    <div className="relative" ref={pickerRef}>
      <div className="flex items-center gap-2">
        <button
          onClick={() => setShowPicker(!showPicker)}
          className="h-6 w-6 rounded border border-slate-600"
          style={{ backgroundColor: color }}
        />
        <input
          type="text"
          value={color}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 rounded bg-editor-hover px-2 py-1 text-xs text-white outline-none focus:ring-1 focus:ring-primary-500"
        />
      </div>
      {showPicker && (
        <div className="absolute left-0 top-8 z-50 rounded bg-editor-panel p-2 shadow-lg">
          <input
            type="color"
            value={color}
            onChange={(e) => onChange(e.target.value)}
            className="h-32 w-32 cursor-pointer"
          />
          {/* 预设颜色 */}
          <div className="mt-2 grid grid-cols-6 gap-1">
            {['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899', '#ffffff', '#94a3b8', '#1e293b'].map(
              (c) => (
                <button
                  key={c}
                  onClick={() => onChange(c)}
                  className="h-5 w-5 rounded border border-slate-600"
                  style={{ backgroundColor: c }}
                />
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/** 选择输入 */
function SelectInput({ property, onChange }: PropertyInputProps) {
  return (
    <select
      value={property.value as string}
      onChange={(e) => onChange(e.target.value)}
      disabled={property.disabled}
      className="w-full rounded bg-editor-hover px-2 py-1 text-xs text-white outline-none focus:ring-1 focus:ring-primary-500 disabled:opacity-50"
    >
      {property.options?.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}

/** 滑块输入 */
function SliderInput({ property, onChange }: PropertyInputProps) {
  const value = property.value as number;
  const min = property.min ?? 0;
  const max = property.max ?? 100;

  return (
    <div className="flex items-center gap-2">
      <input
        type="range"
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        min={min}
        max={max}
        step={property.step ?? 1}
        disabled={property.disabled}
        className="flex-1 accent-primary-500"
      />
      <span className="w-10 text-right text-xs text-slate-400">
        {value}{property.unit || ''}
      </span>
    </div>
  );
}

/** 开关输入 */
function ToggleInput({ property, onChange }: PropertyInputProps) {
  const checked = property.value as boolean;

  return (
    <button
      onClick={() => onChange(!checked)}
      disabled={property.disabled}
      className={`
        relative h-5 w-9 rounded-full transition-colors
        ${checked ? 'bg-primary-500' : 'bg-slate-600'}
        ${property.disabled ? 'opacity-50' : ''}
      `}
    >
      <span
        className={`
          absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform
          ${checked ? 'left-4' : 'left-0.5'}
        `}
      />
    </button>
  );
}

/** 位置输入 (x, y) */
function PositionInput({ property, onChange }: PropertyInputProps) {
  const value = property.value as { x: number; y: number };

  return (
    <div className="flex items-center gap-1">
      <span className="text-xs text-slate-500">X</span>
      <input
        type="number"
        value={value.x}
        onChange={(e) => onChange({ ...value, x: parseFloat(e.target.value) })}
        className="w-16 rounded bg-editor-hover px-2 py-1 text-xs text-white outline-none focus:ring-1 focus:ring-primary-500"
      />
      <span className="text-xs text-slate-500">Y</span>
      <input
        type="number"
        value={value.y}
        onChange={(e) => onChange({ ...value, y: parseFloat(e.target.value) })}
        className="w-16 rounded bg-editor-hover px-2 py-1 text-xs text-white outline-none focus:ring-1 focus:ring-primary-500"
      />
    </div>
  );
}

/** 尺寸输入 (width, height) */
function SizeInput({ property, onChange }: PropertyInputProps) {
  const value = property.value as { width: number; height: number };
  const [linked, setLinked] = useState(true);
  const aspectRatio = value.width / value.height;

  const handleWidthChange = (newWidth: number) => {
    if (linked) {
      onChange({ width: newWidth, height: Math.round(newWidth / aspectRatio) });
    } else {
      onChange({ ...value, width: newWidth });
    }
  };

  const handleHeightChange = (newHeight: number) => {
    if (linked) {
      onChange({ width: Math.round(newHeight * aspectRatio), height: newHeight });
    } else {
      onChange({ ...value, height: newHeight });
    }
  };

  return (
    <div className="flex items-center gap-1">
      <span className="text-xs text-slate-500">W</span>
      <input
        type="number"
        value={value.width}
        onChange={(e) => handleWidthChange(parseFloat(e.target.value))}
        className="w-14 rounded bg-editor-hover px-2 py-1 text-xs text-white outline-none focus:ring-1 focus:ring-primary-500"
      />
      <button
        onClick={() => setLinked(!linked)}
        className={`px-1 text-xs ${linked ? 'text-primary-400' : 'text-slate-500'}`}
        title={linked ? '取消链接' : '链接宽高'}
      >
        🔗
      </button>
      <span className="text-xs text-slate-500">H</span>
      <input
        type="number"
        value={value.height}
        onChange={(e) => handleHeightChange(parseFloat(e.target.value))}
        className="w-14 rounded bg-editor-hover px-2 py-1 text-xs text-white outline-none focus:ring-1 focus:ring-primary-500"
      />
    </div>
  );
}

export default PropertyEditor;
