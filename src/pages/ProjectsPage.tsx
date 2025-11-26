/**
 * 项目列表页面
 * 显示用户的所有项目
 */
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Plus, MoreHorizontal, Trash2, Copy, Share2, FolderOpen } from 'lucide-react';

import { ROUTES, generatePath } from '@/routes';
import { useProjectStore } from '@/stores/projectStore';

/**
 * ProjectsPage - 项目列表页面
 */
export default function ProjectsPage() {
  const { t } = useTranslation();
  const { projects, deleteProject, duplicateProject } = useProjectStore();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-editor-bg">
      {/* 顶部导航 */}
      <header className="border-b border-slate-200 bg-white dark:border-editor-border dark:bg-editor-sidebar">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to={ROUTES.HOME} className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600">
              <span className="text-lg font-bold text-white">M</span>
            </div>
            <span className="text-lg font-semibold text-slate-900 dark:text-white">
              MapMotion
            </span>
          </Link>
        </div>
      </header>

      {/* 主内容 */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* 页面标题 */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            {t('nav.projects')}
          </h1>
          <Link to={ROUTES.EDITOR} className="btn-primary">
            <Plus className="h-4 w-4" />
            {t('project.newProject')}
          </Link>
        </div>

        {/* 项目列表 */}
        {projects.length > 0 ? (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <div
                key={project.id}
                className="group relative rounded-xl border border-slate-200 bg-white p-4 transition-shadow hover:shadow-lg dark:border-editor-border dark:bg-editor-surface"
              >
                {/* 缩略图 */}
                <Link
                  to={generatePath(ROUTES.EDITOR_PROJECT, { projectId: project.id })}
                  className="block aspect-video rounded-lg bg-slate-100 dark:bg-editor-panel"
                >
                  {project.meta.thumbnailUrl ? (
                    <img
                      src={project.meta.thumbnailUrl}
                      alt={project.meta.title}
                      className="h-full w-full rounded-lg object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <FolderOpen className="h-12 w-12 text-slate-300 dark:text-slate-600" />
                    </div>
                  )}
                </Link>

                {/* 项目信息 */}
                <div className="mt-4">
                  <h3 className="font-medium text-slate-900 dark:text-white">
                    {project.meta.title}
                  </h3>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    {t('project.lastModified')}:{' '}
                    {new Date(project.meta.updatedAt).toLocaleDateString()}
                  </p>
                </div>

                {/* 操作菜单 */}
                <div className="absolute top-6 right-6 opacity-0 transition-opacity group-hover:opacity-100">
                  <div className="flex items-center gap-1 rounded-lg bg-white/90 p-1 shadow-lg backdrop-blur dark:bg-slate-800/90">
                    <button
                      onClick={() => duplicateProject(project.id)}
                      className="btn-icon"
                      title={t('project.duplicateProject')}
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                    <button className="btn-icon" title={t('project.shareProject')}>
                      <Share2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm(t('project.confirmDelete'))) {
                          deleteProject(project.id);
                        }
                      }}
                      className="btn-icon text-error-600 hover:bg-error-50 dark:text-error-400"
                      title={t('project.deleteProject')}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* 空状态 */
          <div className="mt-16 text-center">
            <FolderOpen className="mx-auto h-16 w-16 text-slate-300 dark:text-slate-600" />
            <h3 className="mt-4 text-lg font-medium text-slate-900 dark:text-white">
              暂无项目
            </h3>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              点击上方按钮创建您的第一个地图动画项目
            </p>
            <Link to={ROUTES.EDITOR} className="btn-primary mt-6">
              <Plus className="h-4 w-4" />
              {t('project.newProject')}
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
