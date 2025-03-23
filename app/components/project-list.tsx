import Link from "next/link";
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

export function ProjectList() {
  return (<section id="projects-section" className="py-16 sm:py-24">
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
  </section>)
}