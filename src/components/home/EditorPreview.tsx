/**
 * 首页编辑器预览组件
 * 展示编辑器的高保真交互界面，模拟真实编辑体验
 * 
 * @description
 * 该组件是一个纯展示组件，复刻了真实编辑器的 UI 布局和视觉风格。
 * 包含：
 * - 窗口控制栏 (Window Controls)
 * - 顶部工具栏 (Toolbar)
 * - 左侧资源栏 (Sidebar)
 * - 中央画布 (Canvas) - 模拟地图和路径动画
 * - 底部时间线 (Timeline) - 模拟播放头和轨道
 * - 右侧属性面板 (Properties)
 */
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Map as MapIcon, 
  Settings, 
  Video, 
  Image as ImageIcon, 
  Music, 
  Type,
  MousePointer, 
  Move, 
  Crop,
  Eye, 
  Lock, 
  Search,
  Plus,
  Download,
} from 'lucide-react';

/**
 * EditorPreview - 编辑器预览组件
 */
export function EditorPreview() {
  const [isPlaying, setIsPlaying] = useState(true);
  
  // 模拟自动播放循环
  useEffect(() => {
    const timer = setInterval(() => {
      setIsPlaying(prev => !prev);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative mx-auto max-w-6xl rounded-xl border border-white/10 bg-slate-950 shadow-2xl backdrop-blur-sm overflow-hidden group perspective-1000">
      {/* 窗口控制栏 */}
      <div className="flex items-center justify-between border-b border-white/5 bg-white/5 px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="h-3 w-3 rounded-full bg-[#FF5F56]" />
            <div className="h-3 w-3 rounded-full bg-[#FFBD2E]" />
            <div className="h-3 w-3 rounded-full bg-[#27C93F]" />
          </div>
          <div className="ml-4 flex items-center gap-2 text-xs text-slate-500">
            <MapIcon className="h-3 w-3" />
            <span>Travel_Vlog_Tokyo.mapmotion</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
           <span className="text-xs text-slate-500">Autosaved</span>
           <div className="h-6 w-px bg-white/10" />
           <button className="flex items-center gap-1.5 rounded bg-primary-600 px-2 py-1 text-xs font-medium text-white hover:bg-primary-500 transition-colors">
             <Download className="h-3 w-3" />
             Export
           </button>
        </div>
      </div>

      {/* 编辑器主布局 */}
      <div className="flex h-[600px] overflow-hidden bg-slate-900/50">
        
        {/* 左侧边栏 - 资源与图层 */}
        <div className="w-64 flex flex-col border-r border-white/5 bg-slate-950/50">
          <div className="flex items-center gap-4 border-b border-white/5 p-4">
            <span className="text-xs font-bold uppercase text-slate-400 tracking-wider">Layers</span>
            <div className="ml-auto flex gap-2">
              <Search className="h-4 w-4 text-slate-500" />
              <Plus className="h-4 w-4 text-slate-500" />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto py-2">
            <LayerItem icon={Video} label="Map View" active />
            <LayerItem icon={Type} label="Tokyo Title" />
            <LayerItem icon={ImageIcon} label="Overlay_Grain.png" />
            <LayerItem icon={MapIcon} label="Route_Path_01" />
            <LayerItem icon={MapIcon} label="Location_Pin_Shibuya" />
            <LayerItem icon={Music} label="Background_Beat.mp3" />
          </div>
        </div>

        {/* 中间区域 - 画布与时间线 */}
        <div className="flex flex-1 flex-col">
          
          {/* 顶部工具条 */}
          <div className="flex items-center justify-between border-b border-white/5 bg-slate-950/30 px-4 py-2">
            <div className="flex items-center gap-1 bg-slate-900 rounded-lg p-1 border border-white/5">
              <ToolButton icon={MousePointer} active />
              <ToolButton icon={Move} />
              <ToolButton icon={Crop} />
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="font-mono">1920x1080</span>
              <span>60fps</span>
              <span className="px-1.5 py-0.5 rounded bg-white/10 text-white">100%</span>
            </div>
          </div>

          {/* 画布区域 - 模拟地图动画 */}
          <div className="relative flex-1 bg-slate-950 overflow-hidden">
            {/* 模拟地图背景 - 网格与深色底图 */}
            <div className="absolute inset-0 bg-[#050505]">
               {/* 网格 */}
               <div className="absolute inset-0 bg-[linear-gradient(to_right,#222_1px,transparent_1px),linear-gradient(to_bottom,#222_1px,transparent_1px)] bg-[size:40px_40px] opacity-20" />
               
               {/* 模拟地形/地图块 */}
               <div className="absolute top-0 left-0 w-full h-full opacity-30">
                 <svg className="w-full h-full" viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice">
                    <path d="M-100,400 Q200,300 400,500 T900,300" fill="none" stroke="#333" strokeWidth="2" />
                    <path d="M-100,200 Q300,100 600,300 T900,100" fill="none" stroke="#333" strokeWidth="2" />
                 </svg>
               </div>

               {/* 动画路径 */}
               <svg className="absolute inset-0 w-full h-full pointer-events-none">
                 <defs>
                   <linearGradient id="pathGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                     <stop offset="0%" stopColor="#3B82F6" stopOpacity="0" />
                     <stop offset="100%" stopColor="#8B5CF6" />
                   </linearGradient>
                   <filter id="glow">
                     <feGaussianBlur stdDeviation="4" result="coloredBlur" />
                     <feMerge>
                       <feMergeNode in="coloredBlur" />
                       <feMergeNode in="SourceGraphic" />
                     </feMerge>
                   </filter>
                 </defs>
                 
                 {/* 路线轨迹 */}
                 <motion.path
                   d="M100,450 C250,450 300,300 400,300 S600,150 700,150"
                   fill="none"
                   stroke="url(#pathGradient)"
                   strokeWidth="4"
                   strokeLinecap="round"
                   filter="url(#glow)"
                   initial={{ pathLength: 0, opacity: 0 }}
                   animate={{ pathLength: isPlaying ? 1 : 0, opacity: 1 }}
                   transition={{ duration: 3, ease: "easeInOut", repeat: Infinity, repeatDelay: 1 }}
                 />

                 {/* 动态标记点 */}
                 <motion.circle
                   cx="700"
                   cy="150"
                   r="6"
                   fill="#fff"
                   initial={{ scale: 0 }}
                   animate={{ scale: isPlaying ? 1 : 0 }}
                   transition={{ delay: 3, duration: 0.5, repeat: Infinity, repeatDelay: 3.5 }}
                 />
                 
                 {/* 标签卡片 */}
                 <foreignObject x="720" y="110" width="160" height="80">
                   <motion.div
                     initial={{ opacity: 0, x: -10 }}
                     animate={{ opacity: isPlaying ? 1 : 0, x: isPlaying ? 0 : -10 }}
                     transition={{ delay: 3.2, duration: 0.5, repeat: Infinity, repeatDelay: 3.3 }}
                     className="rounded-lg bg-slate-900/90 border border-white/10 p-3 backdrop-blur-md shadow-xl"
                   >
                     <h4 className="text-sm font-bold text-white">Tokyo Tower</h4>
                     <div className="flex gap-1 mt-1">
                       <span className="text-[10px] text-primary-400">35.6586° N</span>
                       <span className="text-[10px] text-primary-400">139.7454° E</span>
                     </div>
                   </motion.div>
                 </foreignObject>
               </svg>
            </div>
            
            {/* 安全框指示器 */}
            <div className="absolute inset-8 border border-white/5 pointer-events-none">
              <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-white/20" />
              <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-white/20" />
              <div className="absolute bottom-0 left-0 w-4 h-4 border-b border-l border-white/20" />
              <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-white/20" />
            </div>
          </div>

          {/* 底部时间线 */}
          <div className="h-48 bg-slate-950 border-t border-white/5 flex flex-col">
            {/* 播放控制 */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-white/5 bg-slate-900/30">
               <div className="flex items-center gap-2">
                 <button className="p-1 hover:text-white text-slate-400"><SkipBack className="h-4 w-4" /></button>
                 <button 
                   className="p-1 hover:text-white text-primary-500"
                   onClick={() => setIsPlaying(!isPlaying)}
                 >
                   {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                 </button>
                 <button className="p-1 hover:text-white text-slate-400"><SkipForward className="h-4 w-4" /></button>
                 <span className="ml-2 font-mono text-xs text-primary-400">00:00:12:15</span>
               </div>
               <div className="flex items-center gap-2">
                 <Settings className="h-4 w-4 text-slate-500" />
               </div>
            </div>
            
            {/* 轨道区域 */}
            <div className="flex-1 overflow-hidden relative p-2 space-y-1">
               {/* 播放头 */}
               <motion.div 
                 className="absolute top-0 bottom-0 w-px bg-red-500 z-10 shadow-[0_0_10px_rgba(239,68,68,0.5)]"
                 initial={{ left: "0%" }}
                 animate={{ left: isPlaying ? "100%" : "0%" }}
                 transition={{ duration: 10, ease: "linear", repeat: Infinity }}
               >
                 <div className="absolute -top-1 -left-1.5 w-3 h-3 bg-red-500 transform rotate-45" />
               </motion.div>

               {/* 轨道 1 */}
               <TimelineTrack label="Camera" color="bg-purple-500/30 border-purple-500/50" width="100%" delay={0} />
               {/* 轨道 2 */}
               <TimelineTrack label="Route" color="bg-blue-500/30 border-blue-500/50" width="80%" delay={0.5} />
               {/* 轨道 3 */}
               <TimelineTrack label="Labels" color="bg-green-500/30 border-green-500/50" width="40%" delay={3} left="60%" />
            </div>
          </div>
        </div>

        {/* 右侧属性面板 */}
        <div className="w-60 border-l border-white/5 bg-slate-950/50 p-4 flex flex-col gap-6">
           <div>
             <h3 className="text-xs font-bold text-slate-400 uppercase mb-3">Properties</h3>
             <div className="space-y-4">
               <PropertyItem label="Position X" value="1250.5" />
               <PropertyItem label="Position Y" value="850.2" />
               <PropertyItem label="Scale" value="100%" />
               <PropertyItem label="Rotation" value="0°" />
               <PropertyItem label="Opacity" value="100%" />
             </div>
           </div>
           
           <div className="h-px bg-white/5" />
           
           <div>
             <h3 className="text-xs font-bold text-slate-400 uppercase mb-3">Effects</h3>
             <div className="space-y-2">
               <div className="flex items-center justify-between p-2 rounded bg-white/5 border border-white/5">
                 <span className="text-xs text-slate-300">Glow</span>
                 <div className="h-3 w-3 rounded-full bg-green-500" />
               </div>
               <div className="flex items-center justify-between p-2 rounded bg-white/5 border border-white/5">
                 <span className="text-xs text-slate-300">Motion Blur</span>
                 <div className="h-3 w-3 rounded-full bg-green-500" />
               </div>
             </div>
           </div>
        </div>

      </div>
    </div>
  );
}

/** 图层项组件 */
function LayerItem({ icon: Icon, label, active }: { icon: any, label: string, active?: boolean }) {
  return (
    <div className={`flex items-center gap-3 px-4 py-2 text-sm ${active ? 'bg-primary-500/10 text-white border-l-2 border-primary-500' : 'text-slate-400 hover:bg-white/5 hover:text-white border-l-2 border-transparent'}`}>
      <Icon className="h-4 w-4" />
      <span className="flex-1 truncate">{label}</span>
      <div className="flex gap-2 opacity-0 group-hover:opacity-100">
        <Eye className="h-3 w-3" />
        <Lock className="h-3 w-3" />
      </div>
    </div>
  );
}

/** 工具按钮组件 */
function ToolButton({ icon: Icon, active }: { icon: any, active?: boolean }) {
  return (
    <button className={`p-1.5 rounded ${active ? 'bg-primary-500 text-white' : 'text-slate-400 hover:bg-white/10 hover:text-white'}`}>
      <Icon className="h-4 w-4" />
    </button>
  );
}

/** 属性项组件 */
function PropertyItem({ label, value }: { label: string, value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-slate-500">{label}</span>
      <span className="text-xs font-mono text-primary-300 bg-white/5 px-2 py-1 rounded border border-white/5 min-w-[60px] text-right">{value}</span>
    </div>
  );
}

/** 时间线轨道组件 */
function TimelineTrack({ label, color, width, left = "0%", delay: _delay }: { label: string, color: string, width: string, left?: string, delay?: number }) {
  return (
    <div className="flex items-center gap-2 h-8 hover:bg-white/5 rounded px-2">
      <span className="w-16 text-[10px] text-slate-500 truncate">{label}</span>
      <div className="flex-1 relative h-6 bg-white/5 rounded overflow-hidden">
        <div 
          className={`absolute top-1 bottom-1 rounded-sm border ${color}`}
          style={{ width, left }}
        />
        {/* 关键帧点 */}
        <div className="absolute top-1/2 -translate-y-1/2 left-0 w-2 h-2 bg-white rotate-45 shadow-sm" style={{ left }} />
        <div className="absolute top-1/2 -translate-y-1/2 w-2 h-2 bg-white rotate-45 shadow-sm" style={{ left: `calc(${left} + ${width})` }} />
      </div>
    </div>
  );
}
