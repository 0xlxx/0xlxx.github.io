import { ReactNode } from 'react'
import { Navbar } from "app/components/nav"


export const metadata = {
  title: '作品集',
  description: 'CSS作品和3D作品展示',
}

export default function PortfolioLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <>
      <div className="fixed inset-0 z-[-1] bg-background pointer-events-none" />
      <Navbar />
      {children}
    </>
  )
}
