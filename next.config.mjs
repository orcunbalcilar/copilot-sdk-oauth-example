/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ["@github/copilot-sdk"],
  images: {
    remotePatterns: [
      { hostname: "avatars.githubusercontent.com" },
      { hostname: "*.googleusercontent.com" },
    ],
  },
}

export default nextConfig
