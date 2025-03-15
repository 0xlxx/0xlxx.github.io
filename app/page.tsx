import Link from "next/link";
import ShaderBackground from "app/portfolio/components/shader-background";
import Image from "next/image";
import { Icon } from "@iconify/react";

export default function Page() {
  const featuredProjects = [
    {
      title: "Black Hole Effect",
      description:
        "Interactive 3D visualization using Three.js and custom shaders",
      image: "/images/black-hole.png",
      url: "/portfolio",
      tags: ["Three.js", "WebGL", "GLSL"]
    },
    {
      title: "Particle System",
      description:
        "Interactive particle system with physics and user interaction",
      image: "/images/particle.png",
      url: "/portfolio",
      tags: ["Canvas", "JavaScript", "Physics"]
    },
    {
      title: "Bloom Effect",
      description:
        "Selective bloom effect with Three.js and post-processing",
      image: "/images/bloom.png",
      url: "/portfolio",
      tags: ["Three.js", "Shader", "Post-processing"]
    },
  ];

  return (
    <div className="relative w-full min-h-screen overflow-x-hidden">
      {/* <ShaderBackground className="fixed w-screen h-screen inset-0 -z-1" /> */}
      <div className="fixed w-screen h-screen scroll-blur"></div>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 py-8 sm:py-12 md:py-16">
        {/* Hero Section */}
        <section
          id="hero-section"
          className="min-h-[80vh] flex flex-col justify-center"
        >
          <div className="max-w-3xl space-y-6 ">
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
                <span className="inline-block w-5 h-5">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                </span>
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
                className="project-card group rounded-xl overflow-hidden border border-border bg-card hover:border-primary/20 transition-all duration-300 flex flex-col h-full"
              >
                <div className="aspect-video bg-gradient-to-br from-purple-500/20 via-blue-500/20 to-cyan-500/20 dark:from-purple-500/30 dark:via-blue-500/30 dark:to-cyan-500/30 relative overflow-hidden flex items-center justify-center">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>
                <div className="p-6 flex flex-col flex-grow bg-gradient-to-br from-card to-card/80 dark:from-card/90 dark:to-card/60">
                  <div className="mb-2">
                    <h3 className="text-xl font-semibold mb-1">
                      {project.title}
                    </h3>
                    <div className="h-0.5 w-12 bg-primary mb-3"></div>
                  </div>
                  <p className="text-muted-foreground text-sm mb-4 flex-grow">
                    {project.description}
                  </p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {project.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="bg-primary/5 dark:bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-md"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <Link
                    href={project.url}
                    className="text-sm bg-primary/10 dark:bg-primary/20 text-primary hover:bg-primary/20 dark:hover:bg-primary/30 px-4 py-2 rounded-lg transition-colors inline-flex items-center justify-center gap-1 self-start"
                  >
                    <span>View Project</span>
                    <span className="inline-block w-4 h-4">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                    </span>
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
              { name: "AI", icon: "logos:ai" },
              { name: "JavaScript", icon: "logos:javascript" },
              { name: "TypeScript", icon: "logos:typescript-icon" },
              { name: "C/C++", icon: "logos:c-plusplus" },
              { name: "React", icon: "logos:react" },
              { name: "Three.js", icon: "logos:threejs" },
              { name: "Node.js", icon: "logos:nodejs-icon" },
              { name: "Next.js", icon: "simple-icons:nextdotjs" },
              { name: "TailwindCSS", icon: "logos:tailwindcss-icon" },
              { name: "D3.js", icon: "logos:d3" },
              { name: "GLSL", icon: "logos:opengl" },
            ].map((skill, index) => (
              <div
                key={index}
                className="skill-item flex flex-col items-center justify-center p-4 rounded-lg border border-border bg-card hover:border-primary/20 transition-all duration-300"
              >
                <div className="relative flex items-center justify-center w-14 h-14 mb-2 rounded-full bg-white shadow-sm overflow-hidden">
                  <Icon
                    icon={skill.icon}
                    className={`w-8 h-8 text-black`}
                  />
                </div>
                <span className="text-sm text-center font-medium">{skill.name}</span>
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
              <span className="flex-shrink-0 text-muted-foreground">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg>
              </span>
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
              <span className="flex-shrink-0 text-muted-foreground">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>
              </span>
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
