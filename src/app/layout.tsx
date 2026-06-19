import type { Metadata } from 'next';
import './globals.css';

// Configuração de metadados atualizada com o suporte ao PWA
export const metadata: Metadata = {
  title: 'GeoAnalyst Demo - Fase 1',
  description: 'Sistema de Análise de Biomas Brasileiros',
  manifest: '/manifest.json', // <-- Esta linha liga o PWA ao seu projeto!
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
      </body>
    </html>
  );
}