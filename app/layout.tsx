import './global.css'
import type { Metadata } from 'next'
import { Navbar } from './components/nav'
import Footer from './components/footer'
import { baseUrl } from './sitemap'
import { Providers } from './providers'
import { inter } from "./font"

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: 'Bjorn Li',
    template: '%s | Bjorn Li',
  },
  description: 'Web developer and optimist.',
  openGraph: {
    title: 'Bjorn Li',
    description: 'Web developer and optimist.',
    url: baseUrl,
    siteName: 'Bjorn Li',
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
    <html
      lang="zh"
      suppressHydrationWarning
      className={cx(
        'scroll-smooth antialiased',
        inter.className
      )}
    >
      <head>
        {/* Preload critical resources */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

        {/* Add viewport meta tag for responsive design */}
        <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
      </head>
      <body className="min-h-screen bg-transparent text-foreground font-sans">
        <Providers>
          <div className="page-layout relative flex flex-col min-h-screen">
            <div className="fixed top-0 w-full z-20">
              <Navbar />
            </div>
            <main className="flex-1 overflow-x-hidden">
              {children}
            </main>
            <div className="fixed bottom-0 w-full z-20">
              <Footer />
            </div>
          </div>
        </Providers>
      </body>
    </html>
  )
}
