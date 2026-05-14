import GithubSlugger from 'github-slugger'
import { unified } from 'unified'
import remarkParse from 'remark-parse'
import { visit } from 'unist-util-visit'
import { toString } from 'mdast-util-to-string'

export async function getHeadings(source: string) {
  const slugger = new GithubSlugger()
  const headings: { text: string; level: number; slug: string }[] = []

  const tree = unified().use(remarkParse).parse(source)

  visit(tree, 'heading', (node: any) => {
    const text = toString(node)
    const slug = slugger.slug(text)
    headings.push({
      text,
      level: node.depth,
      slug,
    })
  })

  return headings
}
