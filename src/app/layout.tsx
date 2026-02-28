import type { Metadata } from 'next';
import { Prompt } from 'next/font/google';
import './globals.css';

const prompt = Prompt({
  subsets: ['latin', 'thai'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-prompt',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Blossom Pixel — Document Generator',
  description: 'Professional Thai/English business document generator for Blossom Pixel',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th" suppressHydrationWarning>
      <body className={`${prompt.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
