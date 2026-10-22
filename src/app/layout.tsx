import type { Metadata, Viewport } from 'next';
import './globals.css';

export const viewport: Viewport = {
  themeColor: "#020617",
};

export const metadata: Metadata = {
  title: 'BioGuesser - central de jogos',
  description: 'Sistema de Análise de Biomas Brasileiros',
  manifest: '/manifest.json',
  applicationName: "BioGuesser",
  icons: {
    icon: [
      { url: '/IconePlaneta2.png', sizes: '192x192', type: 'image/png' },
      { url: '/IconePlaneta2.png', sizes: '512x512', type: 'image/png' },
    ],
    shortcut: ['/IconePlaneta2.png'],
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
    <html lang="pt-br" className="dark" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased selection:bg-accent selection:text-accent-foreground" suppressHydrationWarning>
        {/* Conteúdo principal da aplicação */}
        {children}
        
        {/* ========================================== */}
        {/* SCRIPTS E WIDGETS GLOBAIS                   */}
        {/* ========================================== */}

        {/* 1. SERVICE WORKER (PWA - apenas em produção, pois em desenvolvimento o next-pwa fica desativado e não gera sw.js) */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').then(function(registration) {
                    console.log('ServiceWorker registrado com sucesso:', registration.scope);
                  }).catch(function(err) {
                    console.log('ServiceWorker falhou:', err);
                  });
                });
              }
            `,
          }}
        />

        {/* 2. USERWAY (Configurado com data-position="5" para o canto inferior esquerdo) */}
        <script 
          src="https://cdn.userway.org/widget.js" 
          data-account="N3n5QEOuAT" 
          data-position="5"
        ></script>

        {/* 3. VLIBRAS */}
        <div vw="true" className="enabled">
          <div vw-access-button="true" className="active"></div>
          <div vw-plugin-wrapper="true">
            <div className="vw-plugin-top-wrapper"></div>
          </div>
        </div>
        
        <script src="https://vlibras.gov.br/app/vlibras-plugin.js"></script>
        
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if (window.VLibras) {
                new window.VLibras.Widget('https://vlibras.gov.br/app');
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
