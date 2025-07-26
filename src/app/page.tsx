import Image from 'next/image';
import { UploadForm } from '@/components/UploadForm';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { CheckCircle } from 'lucide-react';

const Logo = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="48"
    height="48"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="text-primary shrink-0"
  >
    {/* Oval Head */}
    <ellipse cx="12" cy="12" rx="9" ry="11" />
    
    {/* Circle Glasses */}
    <circle cx="8.5" cy="12" r="2.5" />
    <circle cx="15.5" cy="12" r="2.5" />
    <line x1="11" y1="12" x2="13" y2="12" />

    {/* Single Music Note */}
    <path d="M12 10.5a2 2 0 1 0 -4 0v3.5h4" />
    <path d="M12 8a2 2 0 1 1 4 0v3.5h-4" />
  </svg>
);


export default function Home() {
  return (
    <div className="container mx-auto px-4 py-12 md:py-20">
      <div className="grid md:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Logo />
            <h1 className="text-4xl md:text-5xl font-bold tracking-tighter font-headline">
              Collaborative Audio Feedback, Simplified.
            </h1>
          </div>
          <p className="text-lg text-muted-foreground">
            AudioMarker is the easiest way for audio engineers and their clients to share and discuss feedback on audio tracks. Upload your mix, share a link, and get timestamped comments right on the waveform.
          </p>
          <ul className="space-y-3">
            <li className="flex items-center gap-3">
              <CheckCircle className="text-primary" />
              <span>Shareable links for easy collaboration.</span>
            </li>
            <li className="flex items-center gap-3">
              <CheckCircle className="text-primary" />
              <span>Interactive waveform with timestamped comments.</span>
            </li>
            <li className="flex items-center gap-3">
              <CheckCircle className="text-primary" />
              <span>AI-powered feedback summary.</span>
            </li>
          </ul>
        </div>
        <Card className="shadow-2xl">
          <CardHeader>
            <CardTitle>Get Started</CardTitle>
            <CardDescription>Upload an MP3 to create your feedback session.</CardDescription>
          </CardHeader>
          <CardContent>
            <UploadForm />
          </CardContent>
        </Card>
      </div>
       <div className="mt-20 text-center">
          <h2 className="text-3xl font-bold tracking-tighter font-headline mb-4">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8 text-left">
            <Card>
              <CardHeader>
                <CardTitle>1. Upload</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Drag and drop your MP3 file or click to select it. Your collaborative workspace is created instantly.</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>2. Share</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Grab the unique, private link and share it with your clients or collaborators.</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>3. Comment</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Listen to the track and leave comments at precise timestamps. Discuss changes and ideas in context.</p>
              </CardContent>
            </Card>
          </div>
        </div>
    </div>
  );
}
