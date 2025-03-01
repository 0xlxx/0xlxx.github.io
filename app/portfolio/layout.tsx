export default function PortfolioLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="portfolio-layout">
      {children}
    </div>
  )
}

export const metadata = {
  title: '作品集',
  description: 'CSS作品和3D作品展示',
}
