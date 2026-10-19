import path from "node:path";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Local demo packages live in the sibling omniRec repository. Published npm
  // packages do not need this wider Turbopack root.
  turbopack: {
    root: path.resolve(process.cwd(), "../.."),
  },
  async rewrites() {
    return [
      {
        source: "/omnirec/:path*",
        destination: `${process.env.OMNIREC_EVENT_API_URL ?? "http://localhost:8081"}/:path*`,
      },
      {
        source: "/demo-api/:path*",
        destination: `${process.env.DEMO_API_URL ?? "http://localhost:8082"}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;

