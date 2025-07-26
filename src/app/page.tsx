import Image from 'next/image';
import { UploadForm } from '@/components/UploadForm';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { CheckCircle } from 'lucide-react';

export default function Home() {
  return (
    <>
      <div className="relative h-[50vh] flex items-center justify-center overflow-hidden">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute z-0 w-auto min-w-full min-h-full max-w-none"
        >
          {/* In a real app, you'd replace this with a URL to your video file */}
          <source src="https://storage.googleapis.com/static.a-and-a.com/assets/waveforms.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        <div className="absolute inset-0 bg-background/80 z-10" />
        <div className="relative z-20 text-center px-4">
           <h1 className="text-4xl md:text-6xl font-bold tracking-tighter font-headline text-transparent bg-clip-text bg-gradient-to-r from-primary via-white to-primary">
              Collaborative Audio Feedback, Simplified.
            </h1>
        </div>
      </div>
      <div className="container mx-auto px-4 py-12 md:py-20 -mt-24 relative z-20">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6 bg-background/80 p-6 rounded-lg">
            <p className="text-lg text-muted-foreground">
              Stop juggling email chains and confusing notes. AudioMarker provides one central place for precise, contextual feedback on your audio files. Upload your mix, share a private link, and get frame-accurate comments directly on the waveform.
            </p>
            <ul className="space-y-3">
              <li className="flex items-center gap-3">
                <CheckCircle className="text-primary" />
                <span>Timestamped comments on specific points or time ranges.</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle className="text-primary" />
                <span>Add YouTube links as references for musical ideas.</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle className="text-primary" />
                <span>AI-powered summaries to quickly digest feedback.</span>
              </li>
               <li className="flex items-center gap-3">
                <CheckCircle className="text-primary" />
                <span>Shareable private links for easy collaboration.</span>
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
                  <CardTitle>1. Upload Your Audio</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Drag and drop your MP3 file. Your private, collaborative workspace is created instantly.</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>2. Share the Link</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Grab the unique link and send it to your clients or team. No sign-up required for them to leave comments.</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>3. Get Precise Feedback</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Collaborators can add comments to a specific timestamp, highlight a time range, or even reference a YouTube video.</p>
                </CardContent>
              </Card>
            </div>
          </div>
      </div>
    </>
  );
}
