"use client"

import { ReactNode, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../../components/ui/dialog"
import { Icon } from "@iconify-icon/react"
import { animate, stagger } from "motion"
import { useEffect, useRef } from "react"

interface ProjectDialogProps {
  title: string
  description: string
  children: ReactNode
  category: string
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}

export default function ProjectDialog({
  title,
  description,
  children,
  category,
  isOpen,
  onOpenChange
}: ProjectDialogProps): JSX.Element {
  const contentRef = useRef<HTMLDivElement>(null)
  const [isLoaded, setIsLoaded] = useState<boolean>(false)
  
  // Handle animations when dialog opens
  useEffect(() => {
    if (isOpen && contentRef.current) {
      // Set loaded state to true when dialog opens
      setIsLoaded(true)
      
      // Animate dialog content elements
      const headerElements = contentRef.current.querySelectorAll('.animate-item')
      if (headerElements && headerElements.length) {
        animate(
          headerElements,
          { opacity: [0, 1], y: [10, 0] },
          { delay: stagger(0.1), duration: 0.4, easing: [0.22, 0.03, 0.26, 1] }
        )
      }
    }
    
    // Reset loaded state when dialog closes
    if (!isOpen) {
      setIsLoaded(false)
    }
  }, [isOpen])
  
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-auto" ref={contentRef}>
        <DialogHeader className="mb-4">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-2xl animate-item">{title}</DialogTitle>
              <DialogDescription className="mt-2 animate-item">{description}</DialogDescription>
            </div>
            <div className="animate-item">
              <span className={`px-3 py-1 text-xs rounded-full ${category === 'css'
                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                : 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
              }`}>
                {category === 'css' ? 'CSS' : '3D'}
              </span>
            </div>
          </div>
        </DialogHeader>
        
        {/* Project content - only render when dialog is open for performance */}
        <div className="relative aspect-video w-full bg-muted rounded-lg overflow-hidden">
          {isLoaded && children}
        </div>
        
        <div className="mt-4 text-sm text-muted-foreground animate-item">
          <div className="flex items-center gap-2">
            <Icon icon="mdi:information-outline" />
            <span>点击左上角按钮可全屏查看，部分项目支持参数调整</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
