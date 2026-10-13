### 仓库指南（中文转述）

#### 技术栈

- UI 框架：**octane**（React 编程模型，编译期渲染，无虚拟 DOM）。组件写在 `.tsx` 里。
- 构建：**Vite 8** + `@octanejs/vite-plugin`。
- 样式：**StyleX**（`@octanejs/stylex`）写组件样式；`src/styles/*.css` 只放 design token、reset 与正文排版。
- 正文渲染：`@tanstack/markdown` 的 octane 适配器；公式由自定义扩展开启，KaTeX 按需加载。

#### 项目结构与模块组织

- `src/main.tsx`：入口，挂载 `App` 并引入全局样式。
- `src/app.tsx`：站点外壳（header / main / footer）与路由分发。
- `src/router.ts`、`src/store.ts`：基于 `history.pushState` 的路由与 `useSyncExternalStore` 状态容器。
- `src/theme.ts`：明暗主题；`src/head.ts`：客户端同步 title / canonical / og。
- `src/site.ts`：站点级常量（域名、标题、描述），构建期脚本与运行时共用。
- `src/components/`：共享组件；`src/routes/`：页面（home / blog / post / about / not-found）。
- `src/content/posts.ts`：`virtual:posts` 索引 + 正文懒加载。
- `src/markdown/`：markdown 扩展（`math.ts`）与 KaTeX 适配层（`katex.ts`）。
- `src/styles/`：`tokens.css`（design token）、`global.css`（reset + 全局规则）、`prose.css`（正文排版）。
- `build/`：Vite 插件——`posts-plugin.ts` 生成文章索引，`site-plugin.ts` 生成 sitemap / rss / robots。
- `content/posts/`：文章源文件（`.mdx`）；`public/`：静态资源。

#### 构建、测试和发展命令

- `bun run dev`：启动 Vite 开发服务器（默认 <http://localhost:5173>）。
- `bun run build`：生产构建，产物在 `dist/`，同时写出 `sitemap.xml` / `rss.xml` / `robots.txt`。
- `bun run preview`：本地预览构建产物。
- `bun run typecheck`：运行 `tsc --noEmit`。
- `bun run deploy`：构建并发布到 Cloudflare Workers Static Assets。

#### 编码风格与命名约定

- 缩进：JS/TS 文件使用 2 个空格。
- 样式：组件样式一律用 StyleX（`stylex.create` + `stylex.props`）；只有 design token、reset、正文排版这类全局规则才写 CSS 文件。
- 布局：内容决定尺寸，设计只给约束；组件按自身容器自适应时用容器查询，而不是堆设备断点。
- 命名：组件 PascalCase（例如 `BlogPost.tsx`），变量/函数 camelCase。
- 注释：只在必要时写，用中文说明「为什么」而不是复述代码。

#### 提交与拉取请求指南

- 提交遵循 Conventional Commits（例如 `feat: 支持 markdown 公式`、`fix: 修复路由匹配`）。
- PR 包含清晰标题、描述（链接到问题）以及 UI 变更的截图。
- 要求：`bun run typecheck` 与 `bun run build` 通过，基于 main 分支 rebase。
- 安全：避免提交秘密信息；使用 `.env` 文件。

本指南旨在确保博客项目的协作顺利进行。
