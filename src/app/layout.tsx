import type { Metadata } from 'next';
import { Prompt } from 'next/font/google';
import { Navbar } from '@/components/navbar';
import { PwaUpdateBanner } from '@/components/pwa-update-banner';
import './globals.css';

const prompt = Prompt({
  subsets: ['latin', 'thai'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-prompt',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Blossom Pixel — Document Generator',
  description: 'Professional Thai/English business document generator for Blossom Pixel',
  manifest: '/manifest.json',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th" suppressHydrationWarning>
      <body className={`${prompt.variable} font-sans antialiased`}>
        <Navbar />
        <div className="pt-14 print:pt-0">
          {children}
        </div>
        <PwaUpdateBanner />
      </body>
    </html>
  );
}
