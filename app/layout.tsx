import './global.css'
import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { Navbar } from './components/nav'
import Footer from './components/footer'
import { baseUrl } from './sitemap'
import { ViewTransitions } from 'next-view-transitions'
import { Providers } from './providers'

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: 'XinXin Li',
    template: '%s | XinXin Li',
  },
  description: 'Web developer and optimist.',
  openGraph: {
    title: 'XinXin Li',
    description: 'Web developer and optimist.',
    url: baseUrl,
    siteName: 'XinXin Li',
    locale: 'zh_CN',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

const cx = (...classes: string[]) => classes.filter(Boolean).join(' ')

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ViewTransitions>
      <html
        lang="zh"
        suppressHydrationWarning
        className={cx(
          'scroll-smooth antialiased',
          GeistSans.variable,
          GeistMono.variable
        )}
      >
        <body className="min-h-screen bg-background text-foreground relative">
          <Providers>
            <div className="page-layout">
              <div className="w-full z-20 overflow-hidden">
                <Navbar />
              </div>
              <main className="flex-1 animate-in overflow-auto">
                {children}
              </main>
              <div className="w-full border-t border-border grid place-items-center composer-effect overflow-hidden">
                <Footer />
              </div>
            </div>
          </Providers>
        </body>
      </html>
    </ViewTransitions>
  )
}
