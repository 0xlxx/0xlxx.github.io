import type { ReactNode } from "react"
import SDFDemo from "./components/sdf-demo"
import CSSDemo from "./components/css-demo"
import BloomDemo from "./components/bloom-demo"
import ParticleDemo from "./components/particle-demo"
import PathMorphingDemo from "./components/path-morphing-demo"

export type DemoProjectCategory = "css" | "3d"

export type DemoProject = {
  slug: string
  title: string
  summary: string
  description: string
  category: DemoProjectCategory
  section: string
  component: () => ReactNode
}

export const categoryMeta: Record<DemoProjectCategory, { label: string; tone: string }> = {
  css: { label: "UI", tone: "border border-border text-muted-foreground" },
  "3d": { label: "3D", tone: "border border-border text-muted-foreground" },
}

export const demoSections = ["3D", "UI"]

export const demoProjects: DemoProject[] = [
  {
    slug: "sdf-shapes",
    title: "SDF Shapes",
    summary: "使用有向距离场构造二维形状",
    description: "探索 Signed Distance Field 在界面设计中的可塑性。",
    category: "3d",
    section: "3D",
    component: () => <SDFDemo />,
  },
  {
    slug: "selective-bloom",
    title: "Selective Bloom",
    summary: "Three.js 泛光后处理效果",
    description: "演示如何通过遮罩控制光晕范围，让焦点更聚合。",
    category: "3d",
    section: "3D",
    component: () => <BloomDemo />,
  },
  {
    slug: "particle-system",
    title: "Particle System",
    summary: "交互式粒子系统",
    description: "轻触或移动鼠标，让粒子随势流动、聚散。",
    category: "3d",
    section: "3D",
    component: () => <ParticleDemo />,
  },
  {
    slug: "responsive-card",
    title: "Responsive Card",
    summary: "纯 CSS 响应式设计",
    description: "通过流式布局和 clamp 实现柔和的响应式过渡。",
    category: "css",
    section: "UI",
    component: () => <CSSDemo />,
  },
  {
    slug: "path-morphing",
    title: "Path Morphing",
    summary: "CSS 路径变形动画",
    description: "使用 clip-path 和关键帧打造平滑的形状过渡。",
    category: "css",
    section: "UI",
    component: () => <PathMorphingDemo />,
  },
]

export function getProjectBySlug(slug: string) {
  const normalized = decodeURIComponent(slug).toLowerCase()
  return demoProjects.find(
    (project) => project.slug.toLowerCase() === normalized
  )
}

