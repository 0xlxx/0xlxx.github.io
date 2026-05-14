
import { ReactNode } from 'react'
import { Navbar } from "app/components/nav"


export default function BlogLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <div className="relative">
        <div className="fixed inset-0 z-[-1] bg-background pointer-events-none" />
        {children}
        <Navbar />
      </div>
    </>
  )
}
