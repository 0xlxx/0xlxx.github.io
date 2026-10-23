import {
  App,
  Editor,
  MarkdownFileInfo,
  MarkdownView,
  Modal,
  Notice,
  Plugin,
  PluginSettingTab,
  Setting,
  TFile,
  normalizePath,
} from 'obsidian'
import {
  imageSlug,
  postFileName,
  postFrontmatter,
  relativeVaultPath,
  today,
} from '../../src/content/post-template'

interface BlogAuthorSettings {
  /** 文章目录（相对 vault 根）。 */
  postsFolder: string
  /** 图片目录（相对 vault 根），对应站点的 public/。 */
  imagesFolder: string
}

// vault 推荐直接指向仓库的 content/，所以这里用相对 vault 的路径。
const DEFAULT_SETTINGS: BlogAuthorSettings = {
  postsFolder: 'posts',
  imagesFolder: 'images',
}

const IMAGE_EXTENSIONS: Record<string, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'image/avif': 'avif',
  'image/svg+xml': 'svg',
}

function isImage(file: File): boolean {
  return file.type.startsWith('image/')
}

function imageExtension(file: File): string {
  const byMime = IMAGE_EXTENSIONS[file.type]
  if (byMime) return byMime
  const byName = /\.([a-z0-9]+)$/i.exec(file.name)?.[1]
  return byName ? byName.toLowerCase() : 'png'
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}

/**
 * 把图片写进 vault 里的 public/images，并在当前光标处插入 Markdown。
 *
 * 链接用**相对路径**（`../../public/images/<slug>/x.png`），这样 Obsidian 的
 * 预览能直接显示；站点构建时会把 `public/…` 前缀归一成 `/images/…`。
 */
export default class BlogAuthorPlugin extends Plugin {
  settings: BlogAuthorSettings = { ...DEFAULT_SETTINGS }

  async onload(): Promise<void> {
    // 兼容遗留的 .mdx：注册后这类文件也能按 Markdown 打开，而不是交给系统处理。
    this.registerExtensions(['mdx'], 'markdown')
    await this.loadSettings()
    this.addSettingTab(new BlogAuthorSettingTab(this.app, this))

    this.addCommand({
      id: 'new-post',
      name: '新建博客文章',
      callback: () => new NewPostModal(this.app, this).open(),
    })

    this.registerEvent(
      this.app.workspace.on('editor-paste', (event, editor, info) => {
        void this.handlePaste(event, editor, info)
      }),
    )
    this.registerEvent(
      this.app.workspace.on('editor-drop', (event, editor, info) => {
        void this.handleDrop(event, editor, info)
      }),
    )
  }

  async loadSettings(): Promise<void> {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData())
  }

  async saveSettings(): Promise<void> {
    await this.saveData(this.settings)
  }

  /** 创建文章并返回相对路径；失败时提示并返回 null。 */
  async createPost(input: { title: string; summary: string }): Promise<string | null> {
    const folder = normalizePath(this.settings.postsFolder)
    await this.ensureFolder(folder)

    const base = postFileName(input.title).replace(/\.md$/, '')
    let path = normalizePath(`${folder}/${base}.md`)
    for (let index = 2; this.app.vault.getAbstractFileByPath(path); index++) {
      path = normalizePath(`${folder}/${base}-${index}.md`)
    }

    try {
      await this.app.vault.create(
        path,
        postFrontmatter({ title: input.title, summary: input.summary, date: today() }),
      )
      return path
    } catch (error) {
      new Notice(`创建文章失败：${errorMessage(error)}`)
      return null
    }
  }

  private async handlePaste(
    event: ClipboardEvent,
    editor: Editor,
    info: MarkdownView | MarkdownFileInfo,
  ): Promise<void> {
    if (event.defaultPrevented) return
    const files = Array.from(event.clipboardData?.files ?? []).filter(isImage)
    if (files.length === 0) return
    if (!info.file) return

    event.preventDefault()
    await this.saveImages(files, info.file, editor)
  }

  private async handleDrop(
    event: DragEvent,
    editor: Editor,
    info: MarkdownView | MarkdownFileInfo,
  ): Promise<void> {
    if (event.defaultPrevented) return
    const files = Array.from(event.dataTransfer?.files ?? []).filter(isImage)
    if (files.length === 0) return
    if (!info.file) return

    event.preventDefault()
    await this.saveImages(files, info.file, editor)
  }

  /** 保存图片并插入链接；公开出来便于在 Obsidian 里直接验证。 */
  async saveImages(files: File[], note: TFile, editor: Editor): Promise<string[]> {
    const slug = imageSlug(note.basename)
    const folder = normalizePath(`${this.settings.imagesFolder}/${slug}`)
    await this.ensureFolder(folder)

    const stamp = today().replace(/-/g, '') + '-' + Date.now().toString(36).slice(-5)
    const saved: string[] = []

    for (const [index, file] of files.entries()) {
      const extension = imageExtension(file)
      const stem = `${slug}-${stamp}${index === 0 ? '' : `-${index + 1}`}`
      let path = normalizePath(`${folder}/${stem}.${extension}`)
      for (let suffix = 2; this.app.vault.getAbstractFileByPath(path); suffix++) {
        path = normalizePath(`${folder}/${stem}-${suffix}.${extension}`)
      }

      try {
        await this.app.vault.createBinary(path, await file.arrayBuffer())
        const link = relativeVaultPath(note.path, path)
        editor.replaceSelection(`![](${link})`)
        // 单张图时把光标放进 `[]`，可以直接补一句图片描述（alt 对 SEO 和无障碍都有用）。
        if (files.length === 1) {
          const cursor = editor.getCursor()
          editor.setCursor({ line: cursor.line, ch: cursor.ch - (link.length + 3) })
        }
        saved.push(path)
      } catch (error) {
        new Notice(`图片保存失败：${errorMessage(error)}`)
      }
    }

    if (saved.length === 1) new Notice('已插入图片，可在方括号里补一句描述')
    else if (saved.length > 1) new Notice(`已插入 ${saved.length} 张图片`)
    return saved
  }

  private async ensureFolder(path: string): Promise<void> {
    const segments = normalizePath(path).split('/')
    let current = ''
    for (const segment of segments) {
      if (!segment) continue
      current = current ? `${current}/${segment}` : segment
      if (this.app.vault.getAbstractFileByPath(current)) continue
      try {
        await this.app.vault.createFolder(current)
      } catch (error) {
        // 并发创建时可能已存在，忽略这种情况。
        if (!this.app.vault.getAbstractFileByPath(current)) throw error
      }
    }
  }
}

class NewPostModal extends Modal {
  private title = ''
  private summary = ''

  constructor(
    app: App,
    private readonly plugin: BlogAuthorPlugin,
  ) {
    super(app)
  }

  onOpen(): void {
    this.titleEl.setText('新建博客文章')

    new Setting(this.contentEl).setName('标题').addText((text) => {
      text.setPlaceholder('文章标题')
      text.onChange((value) => (this.title = value))
      text.inputEl.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
          event.preventDefault()
          void this.create()
        }
      })
      window.setTimeout(() => text.inputEl.focus(), 0)
    })

    new Setting(this.contentEl)
      .setName('摘要')
      .setDesc('列表页与搜索结果里显示的一句话，可以稍后补。')
      .addText((text) => {
        text.setPlaceholder('可选')
        text.onChange((value) => (this.summary = value))
      })

    new Setting(this.contentEl)
      .addButton((button) => button.setButtonText('创建').setCta().onClick(() => void this.create()))
      .addButton((button) => button.setButtonText('取消').onClick(() => this.close()))
  }

  private async create(): Promise<void> {
    const title = this.title.trim()
    if (!title) {
      new Notice('标题不能为空')
      return
    }

    const path = await this.plugin.createPost({ title, summary: this.summary.trim() })
    if (!path) return

    this.close()
    const file = this.app.vault.getAbstractFileByPath(path)
    if (file instanceof TFile) await this.app.workspace.getLeaf(true).openFile(file)
  }

  onClose(): void {
    this.contentEl.empty()
  }
}

class BlogAuthorSettingTab extends PluginSettingTab {
  constructor(
    app: App,
    private readonly plugin: BlogAuthorPlugin,
  ) {
    super(app, plugin)
  }

  display(): void {
    const { containerEl } = this
    containerEl.empty()

    new Setting(containerEl)
      .setName('文章目录')
      .setDesc('相对 vault 根目录。vault 指向 content/ 时就是 posts。')
      .addText((text) =>
        text.setValue(this.plugin.settings.postsFolder).onChange(async (value) => {
          this.plugin.settings.postsFolder = value.trim() || DEFAULT_SETTINGS.postsFolder
          await this.plugin.saveSettings()
        }),
      )

    new Setting(containerEl)
      .setName('图片目录')
      .setDesc('相对 vault 根目录。vault 指向 content/ 时就是 images；构建时映射成 /images/。')
      .addText((text) =>
        text.setValue(this.plugin.settings.imagesFolder).onChange(async (value) => {
          this.plugin.settings.imagesFolder = value.trim() || DEFAULT_SETTINGS.imagesFolder
          await this.plugin.saveSettings()
        }),
      )
  }
}
