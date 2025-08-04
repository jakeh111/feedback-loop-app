import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { Header } from '@/components/Header';

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
            <footer className="w-full py-4 bg-background">
              <div className="container mx-auto text-center">
                <div className="bg-muted text-muted-foreground h-16 flex items-center justify-center rounded-lg">
                  <p>Google Ad Placeholder</p>
                </div>
              </div>
            </footer>
          </div>
          <Toaster />
      </body>
    </html>
  );
}
