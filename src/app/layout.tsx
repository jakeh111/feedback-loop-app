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
            <main className="flex-grow bg-background">
              {children}
            </main>
            <footer className="w-full py-4 bg-background border-t">
              <div className="container mx-auto text-center">
                <div className="flex items-center justify-center gap-6">
                  <Link href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                    <Instagram className="h-6 w-6" />
                    <span className="sr-only">Instagram</span>
                  </Link>
                  <Link href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                    <Youtube className="h-6 w-6" />
                    <span className="sr-only">YouTube</span>
                  </Link>
                  <Link href="mailto:sidedoormedia.email@gmail.com" className="text-muted-foreground hover:text-primary transition-colors">
                    <Mail className="h-6 w-6" />
                    <span className="sr-only">Email</span>
                  </Link>
                </div>
              </div>
            </footer>
          </div>
          <Toaster />
      </body>
    </html>
  );
}
