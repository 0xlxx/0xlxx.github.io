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
bun run build:pages # 构建 GitHub Pages 版本（路由写成目录下的 index.html）
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
  router.ts       pushState 路由
  store.ts        useSyncExternalStore 状态容器
  theme.ts        明暗主题
  seo.ts          页面级 SEO 元数据（标题、canonical、og、JSON-LD），运行时与构建期共用
  head.ts         客户端把 seo.ts 的取值写进 <head>
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

两个目标共用同一份代码、同一份构建：

- **Cloudflare Workers**（<https://bjorn.men>）：`bun run deploy` 会先构建，再把 `dist/` 作为
  Workers Static Assets 发布。每个已知路由都有一份带独立 head 的 HTML（`about.html` 等，
  Workers 会把它服务在 `/about` 上）；未命中的路径返回 `404.html`，不再把未知地址伪装成首页，
  见 `wrangler.jsonc`。
- **GitHub Pages**（<https://0xlxx.github.io/>）：仓库名 `0xlxx.github.io` 是账号的用户站，所以
  Pages 挂在根路径。推送到 `main` 后由 `.github/workflows/pages.yml` 执行 `bun run build:pages`
  并发布；Pages 只认目录，所以同一批路由写成 `<route>/index.html`，未知路径落到 `404.html`。

## SEO

- 每个路由的标题、描述、canonical、Open Graph / Twitter 卡片和 JSON-LD 都由 `src/seo.ts`
  生成：构建期写进静态 HTML（`scripts/generate-seo-html.ts`），客户端换页时由 `src/head.ts`
  同步，爬虫与分享预览拿到的都是当前页面的值。
- 每个页面在 `<noscript>` 里带一份构建期渲染的正文与站内链接（同样的 Markdown 扩展，
  公式与代码高亮都在构建期完成），不执行 JS 的读者和爬虫也能读到内容；含公式的页面会在
  head 里用一个 `<noscript>` 样式表按需加载 KaTeX，启用脚本时不会多请求。
- canonical 统一指向 `https://bjorn.men`，GitHub Pages 作为镜像不与自己竞争排名；404 页带
  `noindex` 且不输出 canonical。
- 文章有配图时 og:image 用同名的 PNG（社交平台不认 AVIF），没有配图则用 `/og.jpg`。
- `sitemap.xml` 带 `<lastmod>` 与图片条目，`robots.txt` 指向它；`rss.xml` 供订阅。
