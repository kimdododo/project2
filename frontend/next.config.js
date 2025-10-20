const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      // Nextjs <Image> 컴포넌트는 이미지를 외부에서 불러오는 경우 여기서 도메인을 추가해주세요.
      "lh3.googleusercontent.com",
      "pbs.twimg.com",
      "images.unsplash.com",
      "logos-world.net",
      "img.youtube.com",
    ],
  },
  // PWA 지원
  async headers() {
    return [
      {
        source: '/manifest.json',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/manifest+json',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
