/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['next-mdx-remote'],
  experimental: {
    mdxRs: true,
    ppr: true,
    viewTransition: true,
  }
}

export default nextConfig
