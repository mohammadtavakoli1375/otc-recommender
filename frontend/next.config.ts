import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: { ignoreDuringBuilds: true },
  // اگر TypeScript هم خطاهای تایپی دارد و می‌خواهی مانع بیلد نشود:
  // typescript: { ignoreBuildErrors: true },
};

export default nextConfig;
