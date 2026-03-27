/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ["@github/copilot-sdk"],
  reactCompiler: true,
  images: {
    remotePatterns: [
      { hostname: "avatars.githubusercontent.com" },
      { hostname: "*.googleusercontent.com" },
    ],
  },
}

export default nextConfig
