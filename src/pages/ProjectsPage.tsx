/**
 * 项目列表页面
 * 显示和管理用户的所有项目
 * 
 * @description
 * 项目列表页面提供：
 * - 项目网格/列表视图
 * - 项目搜索和排序
 * - 项目的复制、分享、删除操作
 */
import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Trash2, 
  Copy, 
  Share2, 
  FolderOpen,
  Search,
  Grid3X3,
  List,
  Clock,
  ArrowUpDown,
  Map,
} from 'lucide-react';

import { ROUTES, generatePath } from '@/routes';
import { useProjectStore } from '@/stores/projectStore';
import { SpotlightCard } from '@/components/common/SpotlightCard';
import { Seo } from '@/components/common/Seo';

/** 排序选项 */
type SortOption = 'updated' | 'created' | 'name';

/** 视图模式 */
type ViewMode = 'grid' | 'list';

/**
 * ProjectsPage - 项目列表页面
 */
export default function ProjectsPage() {
  const { projects, deleteProject, duplicateProject } = useProjectStore();
  
  /** 搜索关键词 */
  const [searchQuery, setSearchQuery] = useState('');
  
  /** 排序方式 */
  const [sortBy, setSortBy] = useState<SortOption>('updated');
  
  /** 视图模式 */
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  
  /** 筛选和排序后的项目列表 */
  const filteredProjects = useMemo(() => {
    let result = [...projects];
    
    // 搜索筛选
    if (searchQuery) {
      result = result.filter(p => 
        p.meta.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // 排序
    result.sort((a, b) => {
      switch (sortBy) {
        case 'updated':
          return new Date(b.meta.updatedAt).getTime() - new Date(a.meta.updatedAt).getTime();
        case 'created':
          return new Date(b.meta.createdAt).getTime() - new Date(a.meta.createdAt).getTime();
        case 'name':
          return a.meta.title.localeCompare(b.meta.title);
        default:
          return 0;
      }
    });
    
    return result;
  }, [projects, searchQuery, sortBy]);

  return (
    <div className="min-h-screen bg-[#020204] relative overflow-hidden">
      <Seo 
        title="My Projects" 
        description="Manage your map animation projects. Continue editing your drafts or export your finished videos."
        keywords={['project management', 'video drafts', 'map animation portfolio']}
      />
      {/* 背景装饰 */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] opacity-20 pointer-events-none" />
      <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-primary-600/20 blur-[128px] pointer-events-none" />
      <div className="absolute top-40 -left-20 h-72 w-72 rounded-full bg-accent-600/10 blur-[96px] pointer-events-none" />

      {/* 顶部导航 */}
      <header className="sticky top-0 z-50 border-b border-white/5 bg-[#020204]/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to={ROUTES.HOME} className="flex items-center gap-2 group">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary-600 to-accent-600 shadow-glow transition-transform group-hover:scale-105">
              <span className="text-lg font-bold text-white">M</span>
            </div>
            <span className="text-lg font-semibold text-white tracking-tight">
              MapMotion
            </span>
          </Link>
        </div>
      </header>

      {/* 主内容 */}
      <main className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* 页面标题和操作栏 */}
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight text-glow">
              My Projects
            </h1>
            <p className="mt-1 text-slate-400">
              Manage your map animations and record every journey.
            </p>
          </div>
          <Link to={ROUTES.EDITOR} className="btn-primary shrink-0 group shadow-lg shadow-primary-600/20 hover:shadow-primary-600/40">
            <Plus className="h-4 w-4 group-hover:rotate-90 transition-transform" />
            New Project
          </Link>
        </div>

        {/* 工具栏 */}
        <div className="sticky top-20 z-40 mb-8 rounded-2xl border border-white/10 bg-[#0A0A0A]/80 p-2 backdrop-blur-xl shadow-2xl flex flex-wrap items-center gap-4">
          {/* 搜索框 */}
          <div className="relative flex-1 max-w-md group">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500 group-focus-within:text-primary-500 transition-colors" />
            <input
              type="text"
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-transparent bg-white/5 py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:border-primary-500/50 focus:bg-white/10 focus:outline-none focus:ring-1 focus:ring-primary-500/20 transition-all"
            />
          </div>
          
          {/* 排序选择 */}
          <div className="flex items-center gap-2 px-2">
            <ArrowUpDown className="h-4 w-4 text-slate-500" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="bg-transparent text-sm text-slate-300 focus:outline-none cursor-pointer hover:text-white transition-colors"
            >
              <option value="updated" className="bg-[#18181b]">Last Modified</option>
              <option value="created" className="bg-[#18181b]">Date Created</option>
              <option value="name" className="bg-[#18181b]">Name</option>
            </select>
          </div>
          
          <div className="h-6 w-px bg-white/10 hidden sm:block" />
          
          {/* 视图切换 */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-all ${
                viewMode === 'grid' 
                  ? 'bg-white/10 text-white shadow-sm' 
                  : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
              }`}
              title="网格视图"
            >
              <Grid3X3 className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-all ${
                viewMode === 'list' 
                  ? 'bg-white/10 text-white shadow-sm' 
                  : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
              }`}
              title="列表视图"
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* 项目数量 */}
        <div className="mb-6 text-sm text-slate-500 border border-white/5 px-3 py-1 rounded-full inline-block bg-white/5">
          {filteredProjects.length} projects found
        </div>

        {/* 项目列表 */}
        <AnimatePresence mode="popLayout">
          {filteredProjects.length > 0 ? (
            <motion.div 
              className={`mt-4 ${
                viewMode === 'grid' 
                  ? 'grid gap-6 sm:grid-cols-2 lg:grid-cols-3' 
                  : 'flex flex-col gap-3'
              }`}
              layout
            >
              {filteredProjects.map((project) => (
                <motion.div
                  key={project.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                >
                  <SpotlightCard
                    className={`group h-full ${
                      viewMode === 'list' ? 'flex items-center gap-6 p-4' : 'p-0 flex flex-col'
                    }`}
                  >
                    {/* 缩略图 */}
                    <Link
                      to={generatePath(ROUTES.EDITOR_PROJECT, { projectId: project.id })}
                      className={`block relative overflow-hidden ${
                        viewMode === 'list' 
                          ? 'h-24 w-40 shrink-0 rounded-xl' 
                          : 'aspect-video w-full border-b border-white/5'
                      }`}
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900 group-hover:scale-105 transition-transform duration-700" />
                      {project.meta.thumbnailUrl ? (
                        <img
                          src={project.meta.thumbnailUrl}
                          alt={project.meta.title}
                          className="absolute inset-0 h-full w-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-500"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Map className={`text-slate-700 group-hover:text-primary-500/50 transition-colors duration-500 ${viewMode === 'list' ? 'h-8 w-8' : 'h-12 w-12'}`} />
                        </div>
                      )}
                      
                      {/* 遮罩 */}
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-500" />
                      
                      {/* 播放按钮 (仅Grid视图) */}
                      {viewMode === 'grid' && (
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <div className="h-12 w-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-lg transform scale-90 group-hover:scale-100 transition-transform">
                              <div className="w-0 h-0 border-t-[8px] border-t-transparent border-l-[14px] border-l-white border-b-[8px] border-b-transparent ml-1" />
                          </div>
                        </div>
                      )}
                    </Link>

                    {/* 项目信息 */}
                    <div className={viewMode === 'list' ? 'flex-1 min-w-0' : 'p-5 flex-1'}>
                      <Link 
                        to={generatePath(ROUTES.EDITOR_PROJECT, { projectId: project.id })}
                        className="block group-hover:translate-x-1 transition-transform duration-300"
                      >
                        <h3 className="font-bold text-lg text-slate-200 group-hover:text-primary-400 transition-colors truncate">
                          {project.meta.title}
                        </h3>
                      </Link>
                      <div className="mt-2 flex items-center gap-4 text-xs text-slate-500">
                        <span className="flex items-center gap-1.5 bg-white/5 px-2 py-0.5 rounded font-mono group-hover:bg-white/10 transition-colors">
                          <Clock className="h-3 w-3" />
                          {new Date(project.meta.updatedAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                        {project.meta.durationMs && (
                          <span className="flex items-center gap-1.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-slate-600 group-hover:bg-primary-500 transition-colors" />
                            {(project.meta.durationMs / 1000).toFixed(0)}s
                          </span>
                        )}
                      </div>
                    </div>

                    {/* 操作菜单 */}
                    <div className={`${
                      viewMode === 'list' 
                        ? 'flex items-center gap-2' 
                        : 'absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 translate-y-2 group-hover:translate-y-0'
                    }`}>
                      <div className={`flex items-center gap-1 ${
                        viewMode === 'grid' ? 'rounded-lg bg-black/60 p-1 backdrop-blur border border-white/10' : ''
                      }`}>
                        <button
                          onClick={() => duplicateProject(project.id)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-white/10 hover:text-white tooltip"
                          title="Duplicate"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                        <button 
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
                          title="Share"
                        >
                          <Share2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm('Are you sure you want to delete this project?')) {
                              deleteProject(project.id);
                            }
                          }}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-error-900/50 hover:text-error-400"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </SpotlightCard>
                </motion.div>
              ))}
            </motion.div>
          ) : projects.length === 0 ? (
            /* 完全空状态 */
            <div className="flex flex-col items-center justify-center py-32 rounded-3xl border border-dashed border-white/10 bg-white/5">
              <div className="h-20 w-20 rounded-full bg-gradient-to-br from-primary-500/20 to-accent-500/20 flex items-center justify-center mb-6 shadow-glow">
                <FolderOpen className="h-10 w-10 text-primary-400" />
              </div>
              <h3 className="text-xl font-bold text-white">
                No Projects Yet
              </h3>
              <p className="mt-2 text-slate-400 max-w-sm text-center">
                Your creative journey starts here. Create your first project to explore the possibilities.
              </p>
              <Link to={ROUTES.EDITOR} className="btn-primary mt-8 inline-flex items-center gap-2 px-6 py-3">
                <Plus className="h-5 w-5" />
                Create New Project
              </Link>
            </div>
          ) : (
            /* 搜索无结果 */
            <div className="flex flex-col items-center justify-center py-20 rounded-2xl border border-dashed border-white/10 bg-white/5">
              <Search className="h-12 w-12 text-slate-600 mb-4" />
              <h3 className="text-lg font-medium text-slate-300">
                No projects found
              </h3>
              <p className="mt-2 text-slate-500">
                Try using different search keywords
              </p>
              <button 
                onClick={() => setSearchQuery('')}
                className="mt-6 text-primary-400 hover:text-primary-300 transition-colors"
              >
                Clear Search
              </button>
            </div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
