import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Turbopack 사용 시 빈 설정 추가 (에러 방지)
  turbopack: {},

  // 서버 레벨 리다이렉트
  async redirects() {
    return [
      {
        source: '/',
        destination: '/dashboard',
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
