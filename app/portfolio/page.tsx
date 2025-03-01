'use client'

import { useState } from 'react'
import { motion } from 'motion/react'
import { Icon } from '@iconify-icon/react'
import Link from 'next/link'
import SDFDemo from './components/sdf-demo'
import CSSDemo from './components/css-demo'
import BloomDemo from './components/bloom-demo'
import ParticleDemo from './components/particle-demo'

// Categories for the portfolio
const categories = [
  { id: 'all', name: '全部', icon: 'mdi:view-grid' },
  { id: 'css', name: 'CSS 作品', icon: 'mdi:language-css3' },
  { id: '3d', name: '3D 作品', icon: 'mdi:cube-outline' }
]

// Portfolio items
const portfolioItems = [
  {
    id: 1,
    title: '流体动画',
    description: '使用WebGL实现的SDF流体动画效果',
    category: '3d',
    component: <SDFDemo />
  },
  {
    id: 2,
    title: '响应式卡片',
    description: '使用纯CSS实现的响应式卡片设计',
    category: 'css',
    component: <CSSDemo />
  },
  {
    id: 3,
    title: '选择性泛光效果',
    description: '使用Three.js和UnrealBloomPass实现的选择性泛光效果',
    category: '3d',
    component: <BloomDemo />
  },
  {
    id: 4,
    title: '粒子系统',
    description: '交互式粒子系统，支持鼠标交互和参数调整',
    category: '3d',
    component: <ParticleDemo />
  }
]

export default function PortfolioPage() {
  const [activeCategory, setActiveCategory] = useState('all')
  
  // Filter items based on active category
  const filteredItems = activeCategory === 'all' 
    ? portfolioItems 
    : portfolioItems.filter(item => item.category === activeCategory)

  return (
    <div className="container mx-auto py-16">
      <section className="animate-in slide-in-from-bottom">
        <div className="prose dark:prose-invert mb-12">
          <h1 className="tracking-tight [view-transition-name:page-title]">
            作品集
          </h1>
          <p className="text-muted-foreground">
            这里展示了我的CSS作品和3D作品集合，包括各种视觉效果和交互设计。每个作品都支持全屏显示和参数调整。
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-4 mb-12">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-colors ${
                activeCategory === category.id
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:text-primary'
              }`}
            >
              <Icon icon={category.icon} size={20} />
              <span>{category.name}</span>
            </button>
          ))}
        </div>

        {/* Portfolio Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {filteredItems.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.3 }}
              className="border border-border rounded-xl overflow-hidden bg-card"
            >
              <div className="aspect-video w-full bg-muted relative">
                {item.component}
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                <p className="text-muted-foreground mb-4">{item.description}</p>
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
      </section>
    </div>
  )
}
