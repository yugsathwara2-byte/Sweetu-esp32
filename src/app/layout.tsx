import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { SweetuProvider } from '@/context/SweetuContext';
import AppShell from '@/components/v2/AppShell';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Sweetu v2 | Personal AI Home OS',
  description: 'Sweetu web interface — shared Gemini brain with ESP32, AWS Home Assistant, WLED control.',
  authors: [{ name: 'Yug Sathwara' }],
};

export const viewport: Viewport = {
  themeColor: '#09090b',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`} data-theme="warm">
      <body className="min-h-full">
        <SweetuProvider>
          <AppShell>{children}</AppShell>
        </SweetuProvider>
      </body>
    </html>
  );
}
