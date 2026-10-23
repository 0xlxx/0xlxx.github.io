import * as stylex from '@octanejs/stylex'
import { PROJECTS } from '../content/projects'

const s = stylex.create({
  root: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-l)',
    paddingBlockEnd: 'var(--space-2xl)',
    maxInlineSize: 'var(--measure)',
  },
  title: {
    fontFamily: 'var(--font-display)',
    fontSize: 'var(--text-xl)',
    fontWeight: 500,
    lineHeight: 1.2,
    letterSpacing: '-0.02em',
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-m)',
  },
  item: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-2xs)',
  },
  name: {
    fontFamily: 'var(--font-display)',
    fontSize: 'var(--text-base)',
    color: 'var(--color-fg)',
    transitionProperty: 'color',
    transitionDuration: '160ms',
    ':hover': {
      color: 'var(--color-accent)',
    },
  },
  desc: {
    fontSize: 'var(--text-s)',
    color: 'var(--color-fg-muted)',
  },
})


export function Projects() {
  return (
    <div {...stylex.props(s.root)}>
      <h1 {...stylex.props(s.title)}>项目</h1>
      <div {...stylex.props(s.list)}>
        {PROJECTS.map((project) => (
          <a
            key={project.name}
            href={project.href}
            target="_blank"
            rel="noopener noreferrer"
            {...stylex.props(s.item)}
          >
            <span {...stylex.props(s.name)}>{project.name}</span>
            <span {...stylex.props(s.desc)}>{project.desc}</span>
          </a>
        ))}
      </div>
    </div>
  )
}
