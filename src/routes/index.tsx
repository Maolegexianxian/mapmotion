/**
 * 路由配置模块
 * 定义应用的所有路由和页面导航
 */
import { lazy } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

/**
 * 懒加载页面组件
 * 使用 React.lazy 实现代码分割，优化首屏加载性能
 */

/** 首页/落地页 */
const HomePage = lazy(() => import('@/pages/HomePage'));

/** 编辑器页面 - 核心功能页面 */
const EditorPage = lazy(() => import('@/pages/EditorPage'));

/** 项目列表页面 */
const ProjectsPage = lazy(() => import('@/pages/ProjectsPage'));

/** 模板库页面 */
const TemplatesPage = lazy(() => import('@/pages/TemplatesPage'));

/** 博客列表页面 */
const BlogPage = lazy(() => import('@/pages/BlogPage'));

/** 博客文章页面 */
const BlogPostPage = lazy(() => import('@/pages/BlogPostPage'));

/** 设置页面 */
const SettingsPage = lazy(() => import('@/pages/SettingsPage'));

/** 404 页面 */
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'));

/**
 * 路由路径常量
 * 集中管理所有路由路径，便于维护和类型安全
 */
export const ROUTES = {
  /** 首页 */
  HOME: '/',
  /** 编辑器 */
  EDITOR: '/editor',
  /** 带项目ID的编辑器 */
  EDITOR_PROJECT: '/editor/:projectId',
  /** 项目列表 */
  PROJECTS: '/projects',
  /** 模板库 */
  TEMPLATES: '/templates',
  /** 博客列表 */
  BLOG: '/blog',
  /** 博客文章详情 */
  BLOG_POST: '/blog/:slug',
  /** 设置 */
  SETTINGS: '/settings',
} as const;

/**
 * 路由类型
 */
export type RouteKey = keyof typeof ROUTES;

/**
 * 生成带参数的路由路径
 * 
 * @param route - 路由模板
 * @param params - 路由参数对象
 * @returns 完整的路由路径
 * 
 * @example
 * ```ts
 * generatePath(ROUTES.EDITOR_PROJECT, { projectId: '123' })
 * // 返回: '/editor/123'
 * ```
 */
export function generatePath(
  route: string,
  params: Record<string, string>
): string {
  let path = route;
  Object.entries(params).forEach(([key, value]) => {
    path = path.replace(`:${key}`, value);
  });
  return path;
}

/**
 * AppRoutes - 应用路由组件
 * 
 * @description
 * 定义应用的所有路由映射，包括：
 * - 首页：产品介绍和快速开始入口
 * - 编辑器：核心地图动画编辑功能
 * - 项目列表：用户项目管理
 * - 模板库：预设模板浏览和使用
 * - 设置：用户偏好设置
 * - 404：未找到页面处理
 * 
 * @returns 路由配置组件
 */
export function AppRoutes() {
  return (
    <Routes>
      {/* 首页 */}
      <Route path={ROUTES.HOME} element={<HomePage />} />
      
      {/* 编辑器页面 - 新建项目 */}
      <Route path={ROUTES.EDITOR} element={<EditorPage />} />
      
      {/* 编辑器页面 - 打开现有项目 */}
      <Route path={ROUTES.EDITOR_PROJECT} element={<EditorPage />} />
      
      {/* 项目列表页面 */}
      <Route path={ROUTES.PROJECTS} element={<ProjectsPage />} />
      
      {/* 模板库页面 */}
      <Route path={ROUTES.TEMPLATES} element={<TemplatesPage />} />

      {/* 博客页面 */}
      <Route path={ROUTES.BLOG} element={<BlogPage />} />
      <Route path={ROUTES.BLOG_POST} element={<BlogPostPage />} />
      
      {/* 设置页面 */}
      <Route path={ROUTES.SETTINGS} element={<SettingsPage />} />
      
      {/* 404 页面 - 匹配所有未定义的路由 */}
      <Route path="/404" element={<NotFoundPage />} />
      
      {/* 重定向未知路由到 404 */}
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  );
}

export default AppRoutes;
