import './globals.css';
import { Analytics } from '@vercel/analytics/react';
import { Inter, Montserrat } from 'next/font/google';
import { Header } from '@/components/header';
import { Metadata } from 'next';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const montserrat = Montserrat({
  subsets: ['latin'],
  variable: '--font-montserrat',
});

export const metadata: Metadata = {
  title: 'Nametica - Fresh Ideas, Every Time',
  description: 'AI-driven name and slogan generator for various categories',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${montserrat.variable} font-sans`}>
        <Header />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
