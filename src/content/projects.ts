/** 项目列表暂时手写，数量少，还不需要数据源。 */
export interface Project {
  name: string
  href: string
  desc: string
}

export const PROJECTS: Project[] = [
  {
    name: 'paperfetcher',
    href: 'https://github.com/0xlxx/paperfetcher',
    desc: '抓取与检索学术论文的命令行工具，结果以 JSON 输出。',
  },
  {
    name: 'paperreader',
    href: 'https://github.com/0xlxx/paperreader',
    desc: '检索并阅读本地 PDF / EPUB / TXT，支持按页或章节提取。',
  },
]
