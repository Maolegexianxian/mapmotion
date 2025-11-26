# MapMotion - Web 地图动画工具

MapMotion 是一个类似 GeoLayers 3 的 Web 地图动画制作工具，让不懂 After Effects 的用户在浏览器内快速制作高质量地图动画。

## 功能特性

- 🗺️ **丰富底图样式** - 多种精美地图样式可选，支持自定义主题配色
- 🛣️ **路线动画** - 自动生成路线并添加流畅的镜头跟随动画
- 🏷️ **智能标签** - 自动避让布局，支持多种标签模板
- 📤 **高质量导出** - 支持 1080P/4K 视频导出，透明背景 PNG 序列

## 技术栈

- **前端框架**: React 18 + TypeScript + Vite
- **状态管理**: Zustand
- **地图渲染**: MapLibre GL + deck.gl
- **样式**: TailwindCSS
- **国际化**: react-i18next
- **测试**: Vitest + Playwright

## 快速开始

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

### 构建生产版本

```bash
npm run build
```

### 运行测试

```bash
# 单元测试
npm run test

# E2E 测试
npm run test:e2e
```

## 项目结构

```
src/
├── components/          # React 组件
│   ├── common/         # 通用组件
│   └── editor/         # 编辑器组件
├── contexts/           # React 上下文
├── hooks/              # 自定义 Hooks
├── locales/            # 国际化文件
├── pages/              # 页面组件
├── routes/             # 路由配置
├── stores/             # Zustand 状态管理
├── styles/             # 全局样式
├── types/              # TypeScript 类型定义
└── utils/              # 工具函数
```

## 浏览器支持

- Chrome/Edge (最新两版)
- Safari (最新两版)
- Firefox (最新两版)

## 许可证

MIT License
