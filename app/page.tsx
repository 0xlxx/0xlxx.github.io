
import AnimateBackground from "app/components/animate-background"
import HomeHero from "app/components/home-hero"
import HomeNav from "app/components/home-nav"
import HomeSocial from "app/components/home-social"

export default function Page() {
  return (
    <div className="relative w-full overflow-hidden">
      <AnimateBackground className="fixed inset-0 pointer-events-none z-0" />
      <main className="relative z-10 flex flex-col items-center justify-center px-6 py-16 sm:py-24 min-h-[80vh]">
        <div className="w-full max-w-5xl space-y-16 sm:space-y-24">
          {/* Hero 区域 */}
          <header className="space-y-10 text-center">
            <HomeHero />
            <HomeNav />
            <HomeSocial />
          </header>
        </div>
      </main>
    </div>
  )
}
