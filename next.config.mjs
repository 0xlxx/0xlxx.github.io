/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['next-mdx-remote'],
  experimental: {
    mdxRs: true,
    ppr: true,
  }
}

export default nextConfig
