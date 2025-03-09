import { Icon } from "@iconify-icon/react";
import Link from "next/link";
import BlackHoleBackground from "app/portfolio/components/black-hole-background";

export default function Page() {
  const featuredProjects = [
    {
      title: "Black Hole Effect",
      description:
        "Interactive 3D visualization using Three.js and custom shaders",
      image: "/images/black-hole.png",
      url: "/portfolio",
    },
    {
      title: "Particle System",
      description:
        "Interactive particle system with physics and user interaction",
      image: "/images/particle.png",
      url: "/portfolio",
    },
    {
      title: "Bloom Effect",
      description:
        "Selective bloom rendering with Three.js and post-processing",
      image: "/images/bloom.png",
      url: "/portfolio",
    },
  ];
  return (
    <div className="relative w-full h-screen overflow-x-hidden">
      {/* TODO: 滚动模糊背景效果 */}
      <BlackHoleBackground className="fixed inset-0 -z-1 " />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 py-8 sm:py-12 md:py-16">
        {/* Hero Section */}
        <section
          id="hero-section"
          className="min-h-[80vh] flex flex-col justify-center"
        >
          <div className="max-w-3xl space-y-6">
            <h1 className="dtext-4xl sm:text-5xl md:text-6xl font-bold tracking-tight">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70 dark:from-primary dark:to-primary/70">
                Bjorn Li
              </span>
            </h1>

            <p className="subtitle text-xl sm:text-2xl font-medium text-foreground/90">
              Web Developer & Creative Technologist
            </p>

            <div className="description prose dark:prose-invert text-muted-foreground text-base sm:text-lg max-w-2xl">
              <p>
                Hey, I'm a web developer and optimist. Currently working on
                Web3D and AI related projects. I'm also interested in
                visualization technology.
              </p>
            </div>

            <div className="pt-4">
              <Link
                href="/portfolio"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                <span>View Portfolio</span>
                <Icon icon="mdi:arrow-right" width={20} />
              </Link>
            </div>
          </div>
        </section>

        {/* Projects Preview Section */}
        <section id="projects-section" className="py-16 sm:py-24">
          <h2 className="text-2xl sm:text-3xl font-semibold mb-8">
            Featured Projects
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredProjects.map((project) => (
              <div
                key={project.title}
                className="project-card group rounded-xl overflow-hidden border border-border bg-card hover:border-primary/20 transition-all duration-300"
              >
                <div className="aspect-video bg-muted relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>
                <div className="p-5">
                  <h3 className="text-lg font-medium mb-2">
                    Black Hole Effect
                  </h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    Interactive 3D visualization using Three.js and custom
                    shaders
                  </p>
                  <Link
                    href="/portfolio"
                    className="text-sm text-primary hover:underline inline-flex items-center gap-1"
                  >
                    <span>View project</span>
                    <Icon icon="mdi:arrow-right" width={16} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Skills Section */}
        <section id="skills-section" className="py-16 sm:py-24">
          <h2 className="text-2xl sm:text-3xl font-semibold mb-8">
            Skills & Technologies
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {[
              { name: "JavaScript", icon: "logos:javascript" },
              { name: "TypeScript", icon: "logos:typescript-icon" },
              { name: "C/C++", icon: "logos:c", fill: 'white' },
              { name: "React", icon: "logos:react" },
              { name: "Three.js", icon: "logos:threejs", fill: 'white'},
              { name: "Node.js", icon: "logos:nodejs-icon" },
              { name: "Next.js", icon: "logos:nextjs-icon" },
              { name: "TailwindCSS", icon: "logos:tailwindcss-icon" },
              { name: "D3.js", icon: "logos:d3" },
              { name: "GLSL", icon: "vscode-icons:file-type-shaderlab" },
            ].map((skill, index) => (
              <div
                key={index}
                className="skill-item flex flex-col items-center justify-center p-4 rounded-lg border border-border bg-card hover:border-primary/20 transition-all duration-300"
              >
                <Icon icon={skill.icon} className="mb-2 text-[40px]" style={{ fill: skill.fill }} />
                <span className="text-sm text-center ">{skill.name}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Connect Section */}
        <section id="connect-section" className="py-16 sm:py-24">
          <h2 className="text-2xl sm:text-3xl font-semibold mb-8">
            Connect With Me
          </h2>

          <div className="space-y-4 max-w-2xl">
            <div className="social-item backdrop-blur-sm  flex items-center gap-4 p-4 rounded-lg border border-border bg-card hover:border-primary/20 hover:bg-card/85 transition-all duration-300">
              <Icon
                icon="mdi:github"
                width={24}
                className="flex-shrink-0 text-muted-foreground"
              />
              <div className="flex-grow">
                <h3 className="text-base font-medium">GitHub</h3>
                <p className="text-sm text-muted-foreground">
                  Check out my open source projects
                </p>
              </div>
              <Link
                href="https://github.com/lxxorz"
                className="px-3 py-1.5 rounded-md bg-primary/10 text-primary hover:bg-primary/20 transition-colors text-sm"
                target="_blank"
                rel="noopener noreferrer"
              >
                Follow
              </Link>
            </div>

            <div className="social-item backdrop-blur-sm  flex items-center gap-4 p-4 rounded-lg border border-border bg-card hover:border-primary/20 hover:bg-card/85 transition-all duration-300">
              <Icon
                icon="mdi:web"
                width={24}
                className="flex-shrink-0 text-muted-foreground"
              />
              <div className="flex-grow">
                <h3 className="text-base font-medium">Observable</h3>
                <p className="text-sm text-muted-foreground">
                  Interactive data visualizations and experiments
                </p>
              </div>
              <Link
                href="https://observablehq.com/@lxxorz"
                className="px-3 py-1.5 rounded-md bg-primary/10 text-primary hover:bg-primary/20 transition-colors text-sm"
                target="_blank"
                rel="noopener noreferrer"
              >
                View
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
