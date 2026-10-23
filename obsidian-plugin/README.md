# Blog Author

配合这个仓库的 Obsidian 插件：新建文章、把粘贴/拖入的图片落到 `public/images/`，并插入站点可用的图片链接。

## 能力

- **新建博客文章**：命令面板 →「新建博客文章」，填标题/摘要，生成 `content/posts/<标题>.mdx`
  （frontmatter 与 `bun run new` 完全一致）并打开。
- **粘贴 / 拖入图片**：自动存到 `public/images/<文章名>/`，光标处插入
  `![](../../public/images/…)`；单张图片时光标停在 `[]` 里，方便补 alt。
- 相对路径在 Obsidian 里可直接预览；站点构建时归一成 `/images/…`。

## 安装

在仓库根目录：

```bash
bun run plugin:build
bun run plugin:install            # 装进当前仓库的 .obsidian/plugins/blog-author
# 或
bun run plugin:install /path/to/vault
```

然后在 Obsidian 的「设置 → 第三方插件」里启用 **Blog Author**。

插件默认假设 vault 根目录就是仓库根目录：文章在 `content/posts`，图片在 `public/images`。
如果 vault 是仓库的子目录，在插件设置里改这两个路径。

## 开发

```bash
bun run plugin:typecheck
bun run plugin:build
```

`main.js` 是 `bun build` 的产物，提交在仓库里是为了免去安装前的构建步骤。
