import type { NextConfig } from 'next';
import withPWAInit from '@ducanh2912/next-pwa';

// Configuração do PWA
const withPWA = withPWAInit({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development', // Desativa no ambiente de desenvolvimento para não gerar cache desnecessário
  register: true,
  skipWaiting: true,
});

// A sua configuração atual do Next.js (intocada)
const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

// Exportar a configuração envolvida pelo PWA
export default withPWA(nextConfig);