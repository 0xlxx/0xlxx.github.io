# Blog Author

配合这个仓库的 Obsidian 插件：新建文章、把粘贴/拖入的图片落到 `content/images/`，并插入站点可用的图片链接。

## 能力

- **新建博客文章**：命令面板 →「新建博客文章」，填标题/摘要，生成 `content/posts/<标题>.mdx`
  （frontmatter 与 `bun run new` 完全一致）并打开。
- **粘贴 / 拖入图片**：自动存到 `content/images/<文章名>/`，光标处插入
  `![](../images/…)`；单张图片时光标停在 `[]` 里，方便补 alt。
- 相对路径在 Obsidian 里可直接预览；站点构建时归一成 `/images/…`。

## 安装

在仓库根目录：

```bash
bun run plugin:build
bun run plugin:install            # 自动装进 content/.obsidian/plugins/blog-author
# 或
bun run plugin:install /path/to/vault
```

然后在 Obsidian 的「设置 → 第三方插件」里启用 **Blog Author**。

推荐的 vault 是仓库的 `content/` 目录：文章在 `posts/`，图片在 `images/`；插件默认就是这两个
路径。如果 vault 指向别处，在插件设置里改「文章目录 / 图片目录」。

## 开发

```bash
bun run plugin:typecheck
bun run plugin:build
```

`main.js` 是 `bun build` 的产物，提交在仓库里是为了免去安装前的构建步骤。
