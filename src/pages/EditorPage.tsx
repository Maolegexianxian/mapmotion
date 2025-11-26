/**
 * 编辑器页面
 * 核心功能页面，包含地图、时间线、属性面板等
 */
import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { EditorLayout } from '@/components/editor/EditorLayout';
import { useProjectStore } from '@/stores/projectStore';

/**
 * EditorPage - 编辑器页面组件
 */
export default function EditorPage() {
  const { projectId } = useParams<{ projectId?: string }>();
  const { t } = useTranslation();
  const { loadProject, createNewProject, currentProject } = useProjectStore();

  // 加载或创建项目
  useEffect(() => {
    if (projectId) {
      // 加载现有项目
      loadProject(projectId);
    } else if (!currentProject) {
      // 创建新项目
      createNewProject({ title: t('project.untitled') });
    }
  }, [projectId, loadProject, createNewProject, currentProject, t]);

  return <EditorLayout />;
}
