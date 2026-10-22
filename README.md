# Bjorn Li 的博客

中文技术博客，纯静态站点 + 客户端路由。

## 技术栈

| 关注点 | 选型 |
| --- | --- |
| UI | [octane](https://github.com/octanejs/octane) —— React 编程模型，编译期渲染，无虚拟 DOM |
| 构建 | Vite 8 + `@octanejs/vite-plugin` |
| 样式 | StyleX（`@octanejs/stylex`）+ CSS design token（`src/styles/tokens.css`） |
| 正文 | `@tanstack/markdown` 的 octane 适配器；公式用自定义扩展 + 按需加载的 KaTeX |
| 部署 | Cloudflare Workers Static Assets |

没有外部 UI 组件库：组件用原生 HTML 元素加现代 CSS（`color-mix()`、容器查询、`clamp()`、逻辑属性）搭出来。

`react` / `react-dom` 只作为 octane 与 `@tanstack/markdown` 的 peer 依赖待在
`devDependencies` 里，不参与渲染，构建产物里也没有它们 —— octane 是唯一的 UI 运行时。

## 命令

```bash
bun run dev        # 开发服务器（Vite，默认 http://localhost:5173）
bun run build      # 生产构建，产物在 dist/，并写出 sitemap.xml / rss.xml / robots.txt
bun run build:pages # 构建 GitHub Pages 版本（基路径 /blog/，附带 404.html 回退）
bun run preview    # 预览构建产物
bun run typecheck  # tsc --noEmit
bun run deploy     # 构建并发布到 Cloudflare
```

## 目录

```text
build/            Vite 插件：文章索引（virtual:posts）与 sitemap / rss / robots
content/posts/    文章源文件（.mdx，带 frontmatter）
public/           静态资源（图片、_headers）
src/
  app.tsx         站点外壳与路由分发
  base.ts         部署基路径（Cloudflare 为 /，GitHub Pages 为 /blog/）
  router.ts       pushState 路由
  store.ts        useSyncExternalStore 状态容器
  theme.ts        明暗主题
  head.ts         客户端同步 title / canonical / og
  site.ts         站点级常量（域名、标题、描述）
  components/     共享组件
  routes/         home / blog / post / about / not-found
  content/        virtual:posts 索引 + 正文懒加载
  markdown/       markdown 公式扩展与 KaTeX 适配层
  styles/         design token、reset、正文排版
```

## 写新文章

在 `content/posts/` 新建 `.mdx`：

```md
---
title: 文章标题
publishedAt: 2026-01-01
summary: 列表页显示的一句话摘要
slug: 可选的-url-slug
---

正文……
```

`slug` 缺省时用文件名。文章索引在构建期生成，正文在打开文章时才下载。

公式支持行内 `$…$` 与块级 `$$…$$`：KaTeX 只在文章真的含公式时才会被加载。

## 改设计

颜色、字体、字号、间距、圆角、栏宽全部集中在 `src/styles/tokens.css`，组件只引用变量。
明暗主题靠 `html[data-theme='dark']` 覆盖同一批变量，不需要维护第二套组件样式。

## 部署

两个目标共用同一份代码，区别只在构建基路径：

- **Cloudflare Workers**（<https://bjorn.men>）：`bun run deploy` 会先 `vite build`，再把 `dist/`
  作为 Workers Static Assets 发布；未命中的路径回退到 `index.html`（路由在客户端），见
  `wrangler.jsonc`。
- **GitHub Pages**（<https://0xlxx.github.io/blog/>）：推送到 `main` 后由
  `.github/workflows/pages.yml` 执行 `bun run build:pages` 并发布。该命令用
  `SITE_BASE=/blog/` 构建（项目页挂在 `/blog/` 下），并额外写出 `404.html` 作为 SPA 深链接的
  回退。站内链接和静态资源由 `src/base.ts` 统一加前缀，canonical 仍指向 bjorn.men。
