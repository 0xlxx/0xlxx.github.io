'use client'

import { useState } from 'react'
import { motion } from 'motion/react'
import { Icon } from '@iconify-icon/react'
import Link from 'next/link'
import SDFDemo from './components/sdf-demo'
import CSSDemo from './components/css-demo'
import BloomDemo from './components/bloom-demo'
import ParticleDemo from './components/particle-demo'
import ProjectDialog from './components/project-dialog'
import PathMorphingDemo from './components/path-morphing-demo'

// Categories for the portfolio
const categories = [
  { id: 'all', name: '全部', icon: 'mdi:view-grid' },
  { id: 'css', name: 'CSS 作品', icon: 'mdi:language-css3' },
  { id: '3d', name: '3D 作品', icon: 'mdi:cube-outline' }
] as const;

type Category = typeof categories[number]['id']

interface PortfolioItem {
  id: number
  title: string
  description: string
  category: Category
  component: React.ReactNode
  thumbnail?: string
}

// Portfolio items
const portfolioItems: PortfolioItem[] = [
  {
    id: 1,
    title: 'SDF Shapes',
    description: '使用有向距离场构造二维形状',
    category: '3d',
    component: <SDFDemo />,
    thumbnail: '/thumbnails/sdf-demo.jpg'
  },
  {
    id: 2,
    title: '响应式卡片',
    description: '使用纯CSS实现的响应式卡片设计',
    category: 'css',
    component: <CSSDemo />,
    thumbnail: '/thumbnails/css-demo.jpg'
  },
  {
    id: 3,
    title: 'Selective Bloom',
    description: '使用Three.js和UnrealBloomPass实现的选择性泛光效果',
    category: '3d',
    component: <BloomDemo />,
    thumbnail: '/thumbnails/bloom-demo.jpg'
  },
  {
    id: 4,
    title: 'Particle System',
    description: '交互式粒子系统',
    category: '3d',
    component: <ParticleDemo />,
    thumbnail: '/thumbnails/particle-demo.jpg'
  },
  {
    id: 5,
    title: "Path Morphing",
    description: "使用CSS实现的路径变形动画",
    category: 'css',
    component: <PathMorphingDemo />,
    thumbnail: '/thumbnails/path-morphing-demo.jpg'
  }
]

export default function PortfolioPage() {
  const [activeCategory, setActiveCategory] = useState<Category>('all')
  const [activeItem, setActiveItem] = useState<PortfolioItem | null>(null)
  const [dialogOpen, setDialogOpen] = useState<boolean>(false)

  // Filter items based on active category
  const filteredItems = activeCategory === 'all'
    ? portfolioItems
    : portfolioItems.filter(item => item.category === activeCategory)

  // Handle opening a project
  const handleOpenProject = (item: PortfolioItem): void => {
    setActiveItem(item)
    setDialogOpen(true)
  }

  // Handle dialog close
  const handleDialogChange = (open: boolean): void => {
    setDialogOpen(open)
    if (!open) {
      // Small delay before clearing the active item to allow for exit animations
      setTimeout(() => setActiveItem(null), 300)
    }
  }

  return (
    <div className="container mx-auto py-16 px-4 sm:px-6 lg:px-8">
      <section className="duration-500">
        <div className="prose dark:prose-invert mb-12">
          <h1 className="tracking-tight">
            Portfolio
          </h1>
          <p className="text-muted-foreground text-lg">
            我的一些交互式作品，点击卡片查看详情
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-4 mb-12">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 ${
                activeCategory === category.id
                  ? 'bg-primary text-primary-foreground shadow-md'
                  : 'bg-muted text-muted-foreground hover:text-primary hover:bg-muted/80'
              }`}
            >
              <Icon icon={category.icon} size={20} />
              <span className='capitalize'>{category.name}</span>
            </button>
          ))}
        </div>

        {/* Portfolio Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredItems.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.4, ease: [0.22, 0.03, 0.26, 1] }}
              className="border border-border rounded-xl overflow-hidden bg-card hover:border-primary/30 hover:shadow-lg transition-all duration-300 group cursor-pointer"
              onClick={() => handleOpenProject(item)}
            >
              <div className="aspect-video w-full bg-muted relative overflow-hidden">
                {item.thumbnail ? (
                  <div
                    className="w-full h-full bg-cover bg-center group-hover:scale-105 transition-transform duration-500"
                    style={{ backgroundImage: `url(${item.thumbnail})` }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted/50 to-muted">
                    <Icon
                      icon={item.category === 'css' ? 'mdi:language-css3' : 'mdi:cube-outline'}
                      className="text-muted-foreground/30"
                      width={48}
                      height={48}
                    />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
                  <div className="p-4 text-white">
                    <div className="font-medium">点击查看详情</div>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">{item.title}</h3>
                <p className="text-muted-foreground mb-4 line-clamp-2">{item.description}</p>
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 text-xs rounded-full ${
                    item.category === 'css'
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                      : 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                  }`}>
                    {item.category === 'css' ? 'CSS' : '3D'}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Empty state when no items match the filter */}
        {filteredItems.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <Icon icon="mdi:folder-open-outline" size={48} className="mb-4" />
            <p>没有找到匹配的项目</p>
          </div>
        )}
      </section>

      {/* Project Dialog */}
      {activeItem && (
        <ProjectDialog
          title={activeItem.title}
          description={activeItem.description}
          category={activeItem.category}
          isOpen={dialogOpen}
          onOpenChange={handleDialogChange}
        >
          {activeItem.component}
        </ProjectDialog>
      )}
    </div>
  )
}
