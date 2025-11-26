# Web 地图动画工具 — 技术栈与实现方案

版本：v1.0  
日期：2025-11-26  
状态：正式草案（企业级）  
适用范围：架构师、研发、测试、运维、SRE、合规

## 0. 变更记录
- 2025-11-26：首次发布 v1.0（架构与组件、数据模型、API、渲染、运维与安全）。

## 1. 架构总览
- 客户端（Web）：TypeScript + React；地图渲染 MapLibre GL；高级图层 deck.gl；时间线与镜头引擎；标签布局；数据导入与预览；快速导出。
- 服务端（API）：Node.js（NestJS）或 Go（Gin/Fiber）；鉴权、项目/资产/模板管理、计费与配额；外部 API 代理与速率限制；导出作业编排。
- 渲染服务：无头浏览器（Puppeteer/Playwright）驱动 WebGL 渲染；FFmpeg 高质量编码（x264/x265/ProRes/PNG 序列/透明背景）。
- 数据层：PostgreSQL（核心元数据与项目）、Redis（缓存与队列）、对象存储 S3/R2（导出成品与静态资产）、CDN 分发。
- 可观测与运营：OpenTelemetry + Prometheus + Grafana（指标）；ELK/OpenSearch（日志）；Sentry（前后端异常）；WebSocket/SSE（进度）。

## 2. 技术选型与理由
- 前端：
  - React + Vite（快速开发与现代打包）；Zustand/Redux（状态管理）；React Router（路由）。
  - MapLibre GL（开源矢量样式、与 Mapbox Style 生态兼容）；deck.gl（高性能图层如 Terrain/Path/Scatter）。
  - turf.js（空间计算）；WebWorker/OffscreenCanvas（性能与流畅度）。
  - i18n（react-i18next）；样式（Tailwind/CSS Modules）；测试（Jest + Playwright）。
- 后端：
  - Node.js/NestJS（生态完善、与前端团队技能契合）或 Go（高并发与资源效率）。
  - Redis（缓存/队列）；PostgreSQL（可靠关系型、支持 JSONB）；S3/R2（低成本对象存储）。
  - 队列：BullMQ（Node）或 Asynq（Go）；反向代理与速率：Nginx/Envoy。
- 渲染：
  - 无头 Chrome 强兼容性；FFmpeg 编码通用高质量输出与序列导出。
- 运维：
  - Docker + Kubernetes（弹性与隔离）；GitHub Actions/GitLab CI（CI/CD）；Terraform（IaC）。

## 3. 逻辑组件与职责
- Web 客户端：
  - 地图/图层引擎、时间线/镜头引擎、标签布局、数据导入、项目编辑器、预览/快速导出。
- API 服务：
  - 认证与鉴权（JWT/OAuth2）、项目/场景/时间线/模板管理、资产上传与处理、外部 API 代理（Geocoding/Directions/Tiles）、计费与配额、审计日志。
- 渲染服务：
  - 作业接收与编排；加载项目→驱动时间线→帧/流渲染→编码→写入对象存储；失败重试与隔离。
- 代理与缓存：
  - 外部 API Key 管理与签名；速率限制与熔断；瓦片与检索结果缓存。
- 可观测性：
  - 指标与告警；日志与追踪；进度 WebSocket 推送。

## 4. 数据模型（Schema 概要）
- `users`：id、email、password_hash、locale、org_id、created_at、last_login
- `organizations`：id、name、plan、billing_id、created_at
- `projects`：id、owner_id、org_id、title、status（draft/active/archived）、version、meta_json、created_at、updated_at
- `scenes`：id、project_id、index、camera_defaults_json、created_at、updated_at
- `items`：id、scene_id、type（camera/path/label/data-style/overlay）、start_ms、duration_ms、easing、params_json
- `assets`：id、owner_id、type（icon/font/image/csv）、url、meta_json、created_at
- `styles`：id、owner_id、name、style_json、theme_json、created_at
- `templates`：id、owner_id、type（route/news/storemap）、config_json、created_at
- `exports`：id、project_id、scene_id、preset、status（queued/running/success/failed）、progress、result_url、created_at、started_at、finished_at
- `jobs`：id、type（render/encode/proxy-cache）、payload_json、status、retries、created_at、updated_at
- 约束与索引：外键与级联、常用字段索引（owner_id/org_id/status）、JSONB 字段索引（GIN）。

## 5. 项目 JSON 模型（示例）
```json
{
  "project": {
    "id": "prj_123",
    "title": "City Intro",
    "version": 1,
    "scenes": [
      {
        "id": "scn_1",
        "cameraDefaults": { "zoom": 6.5, "pitch": 45, "bearing": 30 },
        "items": [
          { "id": "it_1", "type": "camera", "startMs": 0, "durationMs": 3000, "params": { "action": "dollyIn", "strength": 0.8 } },
          { "id": "it_2", "type": "path", "startMs": 3000, "durationMs": 5000, "params": { "source": "geojson:path_abc", "speed": 60 } },
          { "id": "it_3", "type": "label", "startMs": 3500, "durationMs": 4000, "params": { "featureId": "poi_001", "template": "cityLabel" } }
        ]
      }
    ]
  }
}
```

## 6. API 设计（REST 概要）
- 认证：
  - `POST /api/auth/login` → { token }
  - `POST /api/auth/refresh` → { token }
  - `GET /api/me` → 用户信息
- 项目与场景：
  - `GET /api/projects`、`POST /api/projects`、`GET /api/projects/{id}`、`PATCH /api/projects/{id}`
  - `POST /api/projects/{id}/snapshot`、`POST /api/projects/{id}/share`
  - `POST /api/projects/{id}/scenes`、`GET /api/scenes/{id}`
- 时间线与条目：
  - `POST /api/scenes/{id}/items`、`PATCH /api/items/{id}`、`DELETE /api/items/{id}`
- 资产与样式：
  - `POST /api/assets`（上传）、`GET /api/styles`、`POST /api/styles`
- 导出：
  - `POST /api/exports`（创建作业，含 preset 与选项）；`GET /api/exports/{id}`；`WS /api/exports/{id}/progress`
- 代理与外部：
  - `/api/proxy/geocode?q=...`、`/api/proxy/directions?from=...&to=...`（服务端签名与限流）
- 计费与配额：
  - `GET /api/billing/usage`、`POST /api/billing/upgrade`

### 错误与版本
- 错误响应：统一 `{"code":"string","message":"string","details":{}}`；追踪 ID 通过 `X-Trace-Id`。
- 版本：URL 版本化 `/v1/...`；向后兼容策略与弃用时间表。

## 7. 渲染与导出实现
- 浏览器端快速导出：
  - `Canvas.captureStream` → `MediaRecorder`（WebM/H.264）；或 `WebCodecs` 帧编码；音轨/水印覆盖层。
  - 帧率与码率可调；分段渲染与拼接（大项目）。
- 服务器端高质量导出：
  - 无头浏览器加载项目（隔离容器）→ 时间线驱动渲染帧（WebGL 支持）→ FFmpeg 编码（x264/x265/ProRes/PNG 序列）。
  - 作业：入队、资源配额（CPU/GPU/内存/并发）、超时与重试、失败诊断与告警。
- 透明背景：
  - 使用 RGBA 渲染通道与 PNG 序列；或 ProRes 4444；确保合成边缘防抖与防溢出。

## 8. 性能与伸缩策略
- 客户端：
  - 图层合并与 LOD；预取瓦片；Worker 化路径插值与标签布局；渐进式渲染。
- 服务端：
  - Redis 缓存（Geocoding/Directions）；瓦片代理 CDN；异步队列限速；水平扩展渲染实例。
- 目标：
  - 并发导出作业 100 个，平均排队等待≤30s；99% 导出成功率；单项目内存≤512MB（渲染容器）。

## 9. 安全、合规与治理
- 秘钥管理：仅服务端持有第三方 API 密钥；KMS/Secrets Manager；滚动与吊销流程。
- 认证与授权：JWT/OAuth2；RBAC（组织与项目级）；分享链接有效期/密码与访问日志。
- 输入校验：所有外部输入（CSV/URL/查询）严格校验与清洗；防注入、防 XSS/CSRF。
- 版权与署名：数据源 Attribution 自动展示；导出水印与尾注可选；法律审查与供应商条款跟踪。
- 隐私：GDPR/CCPA；用户数据加密传输与敏感字段加密存储；数据保留与擦除请求支持。
- 供应链安全：依赖扫描（Snyk/OWASP）；镜像签名与漏洞基线；SBOM 生成与跟踪。

## 10. 监控、日志与告警
- 指标（SLI）：导出成功率、耗时分布、外部 API 错误率、客户端 FPS、后端 CPU/内存/队列长度。
- SLO：
  - 月可用性≥99.9%；导出 95% 在 5 分钟内完成（标准 30s 动画）；错误率≤1%。
- 日志：结构化 JSON；TraceID 贯穿；隐私遮蔽；保留与归档策略。
- 告警：阈值与异常模式；值班轮值与 Runbook。

## 11. 测试策略
- 单元：路径插值、时间线调度、标签布局、数据解析、样式生成。
- 集成：导出流程（浏览器端/服务端）、代理缓存与速率限制、项目保存与回滚。
- E2E：核心向导场景；跨浏览器兼容测试；视觉回归（快照）。
- 性能/压测：渲染 FPS、导出吞吐与延迟、并发作业与资源边界。
- 安全测试：鉴权与越权、注入/XSS/CSRF、限流与 DoS。

## 12. 部署与运维
- 环境：Dev/Staging/Prod；隔离的渲染池与 API；基础设施即代码（Terraform）。
- CI/CD：
  - 构建 → Lint/Typecheck → 测试 → 安全扫描 → 镜像生成与签名 → 部署 → 冒烟测试 → 灰度 → 全量。
- 发布与回滚：蓝绿/金丝雀；Feature Flags 控制新功能；版本与兼容策略。
- 灾备：跨区对象存储；数据库备份与恢复演练；RPO≤15min、RTO≤60min。

## 13. 成本与容量规划（初版）
- 对象存储与 CDN：按导出量与保留期计费；默认保留 90 天。
- 外部 API：Geocoding/Directions/瓦片调用配额与单价；缓存提升命中。
- 渲染实例：按并发与时长估算；峰值按活动运营与大促扩容。

## 14. 编码规范与质量门禁
- 代码风格：TypeScript 严格模式；ESLint/Prettier；后端 Go/Node 规范化。
- 质量门禁：Lint/Typecheck 必过；单测覆盖率门槛（前端≥70%，后端≥80%）；安全扫描零高危。
- 变更评审：架构与安全评审；重大变更走 ADR；依赖升级走兼容性验证。

## 15. 路线图与阶段目标
- Sprint 1–2：底图/样式、检索、路线、基础镜头、标签模板、快速导出。
- Sprint 3–4：item 时间线、CSV 可视化、项目保存/分享、预设模板。
- Sprint 5–7：三维地形/建筑、服务端导出、品牌模板、授权与署名。
- Sprint 8–9：计费与配额、国际化、监控与 SRE 完整化、性能优化。

## 16. 风险矩阵（简）
- 高概率/高影响：外部 API 限流与变更 → 多源接入 + 缓存 + 熔断降级。
- 中概率/高影响：浏览器编码兼容 → 服务端兜底 + 分块渲染。
- 低概率/高影响：对象存储或 CDN 故障 → 多区域冗余 + 快速切流。

## 17. 合规与法律（指引）
- 明确供应商条款与品牌使用许可；按区域法律要求处理隐私与数据跨境；建立定期合规审查流程。

---

# 附录 A：OpenAPI 草案（片段）
```yaml
openapi: 3.0.3
info:
  title: Web Map Animator API
  version: 1.0.0
paths:
  /v1/projects:
    get:
      summary: List projects
      responses:
        '200': { description: OK }
    post:
      summary: Create project
      responses:
        '201': { description: Created }
  /v1/exports:
    post:
      summary: Create export job
      responses:
        '202': { description: Accepted }
```

# 附录 B：导出预设（建议）
- 社媒 1080p：`1920x1080`，`H.264`，`8–12 Mbps`，`30fps`。
- 竖屏 9:16：`1080x1920`，`H.264`，`8–12 Mbps`，`30fps`。
- 高质量序列：`4K PNG`（透明可选），`ProRes 4444`。

# 附录 C：浏览器端编码兼容
- 首选 WebM/VP9 与 H.264（视浏览器支持）；提供服务端编码兜底与统一输出。

