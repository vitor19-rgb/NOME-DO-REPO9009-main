import type { Metadata, Viewport } from 'next';
import './globals.css';

export const viewport: Viewport = {
  themeColor: "#020617",
};

// 1. ADICIONADA A FORÇAGEM DOS ÍCONES PARA O NAVEGADOR RECONHECER O PWA
export const metadata: Metadata = {
  title: 'BioGuesser - central de jogos',
  description: 'Sistema de Análise de Biomas Brasileiros',
  manifest: '/manifest.json',
  applicationName: "BioGuesser",
  icons: {
    icon: [
      { url: '/IconePlaneta2.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon.png', sizes: '512x512', type: 'image/png' },
    ],
    shortcut: ['/icon.png'],
    apple: [
      { url: '/IconePlaneta2.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  appleWebApp: {
    title: "BioGuesser",
    statusBarStyle: "black-translucent",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-br" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased selection:bg-accent selection:text-accent-foreground">
        {children}
        
        {/* 2. SCRIPT DE INSTALAÇÃO DO SERVICE WORKER (OBRIGATÓRIO PARA DESKTOP) */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').then(function(registration) {
                    console.log('ServiceWorker registrado com sucesso com o scope: ', registration.scope);
                  }, function(err) {
                    console.log('ServiceWorker falhou: ', err);
                  });
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}