/** @type {import('next').NextConfig} */
const nextConfig = {
  // 기존 코드에 린트 오류가 남아 있어 빌드 단계 린트는 아직 끈다. 타입 검사는 빌드에서 강제한다.
  // 린트 오류 정리 후 이 설정을 제거한다.
  eslint: {
    ignoreDuringBuilds: true,
  },
  webpack: (config) => {
    config.resolve.fallback = { ...config.resolve.fallback, fs: false };

    // Supabase Realtime 모듈의 동적 import 경고 억제
    config.ignoreWarnings = [
      {
        module: /node_modules\/@supabase\/realtime-js/,
        message:
          /Critical dependency: the request of a dependency is an expression/,
      },
    ];

    return config;
  },
  images: {
    remotePatterns: [
      // Supabase Storage 공개 버킷 (dream-images: 생성 이미지·아키타입 카드, avatars: 사용자 업로드 아바타)
      {
        protocol: "https",
        hostname: "tfcwgjimdnzitgjvuwoe.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      // Google OAuth 프로필 이미지 (user_metadata.avatar_url)
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
    ],
  },
  async redirects() {
    return [
      {
        source: "/journal",
        destination: "/library/dreams",
        permanent: true,
      },
      {
        source: "/story/:id",
        destination: "/library/dreams/:id",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
