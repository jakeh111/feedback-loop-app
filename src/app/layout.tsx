import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { Header } from '@/components/Header';
import { Instagram, Youtube, Mail } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'FeedbackLoop',
  description: 'Collaborative audio feedback for engineers and clients.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="indigo">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Intel+One+Mono:wght@400;500;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
          <div className="flex flex-col min-h-screen">
            <Header />
          </div>
          <Toaster />
      </body>
    </html>
  );
}
