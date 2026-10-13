### 仓库指南（中文转述）

#### 项目结构与模块组织

- `app/`：包含 Next.js 页面、布局、组件以及全局样式（例如，`global.css` 中集成 Tailwind CSS）。
- `style/`：组件的自定义 CSS 模块（`components.css`）和实用工具（`utilities.css`）。
- `public/`：静态资源，如图像和字体。
- 根目录文件：`package.json`、`next.config.js` 以及配置文件。

#### 构建、测试和发展命令

- `bun run dev`：在 <http://localhost:3000> 上启动开发服务器。
- `bun run build`：为生产环境构建应用。
- `bun run start`：运行生产服务器。
- `bun run lint`：使用 ESLint 检查代码。
- `bun test`：运行测试（如果使用 Jest 配置）。

#### 编码风格与命名约定

- 缩进：JS/TS 文件使用 2 个空格。
- 样式：优先使用 Tailwind CSS 的实用类；除非必要，避免自定义 CSS。
- 命名：组件使用 PascalCase（例如，`BlogPost.tsx`），变量/函数使用 camelCase。
- 格式化：使用 Prettier（如果配置了 `bun run format`）和 ESLint 保持一致。
- 注释：除非必要，避免内联注释；复杂逻辑使用 JSDoc 文档化。

#### 测试指南

- 框架：Jest 结合 React Testing Library（如果存在测试）。
- 位置：将测试文件与源文件共置（例如，`Component.test.tsx`）。
- 约定：测试名称描述性强，例如 “renders without crashing”。
- 覆盖率：目标至少 80%；使用 `bun test --coverage` 运行。
- 执行：`bun test` 来运行所有测试。

#### 提交与拉取请求指南

- 提交：遵循 Conventional Commits 规范（例如，`feat: add text-autospace support`，`fix: resolve styling issue`）。
- PR：包含清晰标题、描述（链接到问题）、以及 UI 变更的截图。
- 要求：通过 linting/测试，基于 main 分支 rebase，并获得至少一位审核批准。
- 安全：避免提交秘密信息；使用 `.env` 文件。

本指南旨在确保博客项目的协作顺利进行。
