import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

export const metadata: Metadata = {
  title: {
    template: '%s | FeedbackLoop',
    default: 'FeedbackLoop',
  },
  description: 'Collaborative audio feedback for engineers and clients. Upload your mix, share a private link, and get frame-accurate comments directly on the waveform.',
  openGraph: {
    title: 'FeedbackLoop',
    description: 'Collaborative audio feedback for engineers and clients.',
    url: 'https://audiomarker-nfgw.web.app',
    siteName: 'FeedbackLoop',
    images: [
      {
        url: 'https://audiomarker-nfgw.web.app/og-image.png',
        width: 1200,
        height: 630,
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FeedbackLoop',
    description: 'Collaborative audio feedback for engineers and clients.',
    images: ['https://audiomarker-nfgw.web.app/og-image.png'],
  },
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
          <div className="relative flex flex-col min-h-screen">
            <Header />
            <main className="flex-grow">
              {children}
            </main>
            <Footer />
          </div>
          <Toaster />
      </body>
    </html>
  );
}
