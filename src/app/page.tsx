import Image from 'next/image';
import { UploadForm } from '@/components/UploadForm';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { CheckCircle } from 'lucide-react';

const Logo = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="80"
    height="80"
    viewBox="0 0 100 100"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="text-primary shrink-0"
  >
    <path d="M72.5,85 C95,65 95,35 72.5,15 C50,-5 30,-5 27.5,15 C25,35 25,65 47.5,85 C70,105 72.5,85 72.5,85Z" />
    <path d="M35,30 C40,20 60,20 65,30" />
    <circle cx="40" cy="50" r="8" />
    <circle cx="60" cy="50" r="8" />
    <path d="M48,50 h4" />
    <path d="M40,70 a5,5 0 1,0 0,-0.01" />
    <path d="M60,70 v-5 h-20" />
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
