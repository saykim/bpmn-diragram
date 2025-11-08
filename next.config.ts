import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 이미지 최적화 설정
  images: {
    unoptimized: false,
  },
  
  // 트레일링 슬래시 처리
  trailingSlash: false,
  
  // 리다이렉트 설정 (루트를 대시보드로)
  async redirects() {
    return [
      {
        source: '/',
        destination: '/dashboard',
        permanent: false,
      },
    ];
  },
  
  // 웹팩 설정 (bpmn-js 등 클라이언트 전용 라이브러리)
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
      };
    }
    return config;
  },
};

export default nextConfig;
