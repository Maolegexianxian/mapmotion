/**
 * 地点搜索面板组件
 */
import { useState, useCallback, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, MapPin, Clock, X, Loader2 } from 'lucide-react';

/** 搜索结果项 */
export interface SearchResult {
  id: string;
  name: string;
  address: string;
  type: 'place' | 'address' | 'poi';
  coordinates: { lng: number; lat: number };
}

interface SearchPanelProps {
  onSelect: (result: SearchResult) => void;
  onClose: () => void;
}

/** 模拟搜索结果（实际应调用地图 API） */
const mockSearch = async (query: string): Promise<SearchResult[]> => {
  await new Promise((resolve) => setTimeout(resolve, 500));
  
  if (!query.trim()) return [];
  
  // 模拟搜索结果
  return [
    {
      id: '1',
      name: `${query} 市中心`,
      address: `${query}市中心商业区`,
      type: 'place',
      coordinates: { lng: 116.4074 + Math.random() * 0.1, lat: 39.9042 + Math.random() * 0.1 },
    },
    {
      id: '2',
      name: `${query} 火车站`,
      address: `${query}市火车站广场`,
      type: 'poi',
      coordinates: { lng: 116.4074 + Math.random() * 0.1, lat: 39.9042 + Math.random() * 0.1 },
    },
    {
      id: '3',
      name: `${query} 机场`,
      address: `${query}国际机场`,
      type: 'poi',
      coordinates: { lng: 116.4074 + Math.random() * 0.1, lat: 39.9042 + Math.random() * 0.1 },
    },
  ];
};

/**
 * SearchPanel - 地点搜索面板
 */
export function SearchPanel({ onSelect, onClose }: SearchPanelProps) {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<SearchResult[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  // 自动聚焦
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // 搜索处理
  const handleSearch = useCallback(async (searchQuery: string) => {
    setQuery(searchQuery);
    
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    try {
      const searchResults = await mockSearch(searchQuery);
      setResults(searchResults);
    } catch (error) {
      console.error('搜索失败:', error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 选择结果
  const handleSelect = useCallback((result: SearchResult) => {
    // 添加到最近搜索
    setRecentSearches((prev) => {
      const filtered = prev.filter((r) => r.id !== result.id);
      return [result, ...filtered].slice(0, 5);
    });
    
    onSelect(result);
  }, [onSelect]);

  // 清除最近搜索
  const handleClearRecent = useCallback(() => {
    setRecentSearches([]);
  }, []);

  // 键盘事件
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  }, [onClose]);

  return (
    <div className="flex h-full flex-col">
      {/* 搜索输入框 */}
      <div className="p-3 border-b border-editor-border">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t('editor.search.placeholder')}
            className="w-full rounded-lg bg-editor-hover py-2 pl-10 pr-10 text-sm text-white placeholder-slate-500 outline-none focus:ring-1 focus:ring-primary-500"
          />
          {query && (
            <button
              onClick={() => handleSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* 搜索结果 */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-slate-500" />
            <span className="ml-2 text-sm text-slate-500">{t('editor.search.searching')}</span>
          </div>
        ) : results.length > 0 ? (
          <div className="p-2">
            {results.map((result) => (
              <SearchResultItem
                key={result.id}
                result={result}
                onSelect={() => handleSelect(result)}
              />
            ))}
          </div>
        ) : query ? (
          <div className="py-8 text-center text-sm text-slate-500">
            {t('editor.search.noResults')}
          </div>
        ) : recentSearches.length > 0 ? (
          <div className="p-2">
            <div className="flex items-center justify-between px-2 py-1">
              <span className="text-xs font-medium text-slate-500">
                {t('editor.search.recentSearches')}
              </span>
              <button
                onClick={handleClearRecent}
                className="text-xs text-slate-500 hover:text-white"
              >
                {t('editor.search.clearHistory')}
              </button>
            </div>
            {recentSearches.map((result) => (
              <SearchResultItem
                key={result.id}
                result={result}
                onSelect={() => handleSelect(result)}
                isRecent
              />
            ))}
          </div>
        ) : (
          <div className="py-8 text-center text-sm text-slate-500">
            输入地点名称开始搜索
          </div>
        )}
      </div>
    </div>
  );
}

/** 搜索结果项 */
interface SearchResultItemProps {
  result: SearchResult;
  onSelect: () => void;
  isRecent?: boolean;
}

function SearchResultItem({ result, onSelect, isRecent }: SearchResultItemProps) {
  return (
    <button
      onClick={onSelect}
      className="flex w-full items-start gap-3 rounded-lg p-2 text-left hover:bg-editor-hover"
    >
      <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-editor-panel">
        {isRecent ? (
          <Clock className="h-4 w-4 text-slate-500" />
        ) : (
          <MapPin className="h-4 w-4 text-primary-500" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-white truncate">{result.name}</div>
        <div className="text-xs text-slate-500 truncate">{result.address}</div>
      </div>
    </button>
  );
}

export default SearchPanel;
