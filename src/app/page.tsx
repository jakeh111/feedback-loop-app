
"use client";

import React from 'react';
import Image from 'next/image';
import { UploadForm } from '@/components/UploadForm';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { CheckCircle } from 'lucide-react';

const heroImages = [
  { src: "https://firebasestorage.googleapis.com/v0/b/audiomarker.firebasestorage.app/o/claudia-ramirez-jK47-bR5VnU-unsplash.jpg?alt=media&token=ca1d6125-e267-4316-9895-b809b867772a", hint: "music production" },
  { src: "https://firebasestorage.googleapis.com/v0/b/audiomarker.firebasestorage.app/o/filip-barna-SlIu4D_rTPo-unsplash.jpg?alt=media&token=a44a5796-5f93-4070-a210-d27ab60a1de7", hint: "audio mixing" },
  { src: "https://firebasestorage.googleapis.com/v0/b/audiomarker.firebasestorage.app/o/josh-sorenson-LVmyjS0hxYU-unsplash.jpg?alt=media&token=2ce7bc1b-461b-4fde-8ec0-89804d66170c", hint: "sound engineering" },
];

export default function Home() {
  const [randomImage, setRandomImage] = React.useState(heroImages[0]);

  React.useEffect(() => {
    setRandomImage(heroImages[Math.floor(Math.random() * heroImages.length)]);
  }, []);

  return (
    <>
      <div className="relative h-[40vh] flex items-center justify-center overflow-hidden">
        <Image
          src={randomImage.src}
          alt="Abstract audio visualization"
          fill
          className="object-cover"
          data-ai-hint={randomImage.hint}
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/60 z-10"></div>
        <div className="relative z-20 text-center px-4">
           <h1 className="text-4xl md:text-6xl font-bold tracking-tighter font-headline text-transparent bg-clip-text bg-gradient-to-r from-primary via-white to-primary">
              Collaborative Audio Feedback, Simplified.
            </h1>
        </div>
      </div>
      <div className="container mx-auto px-4 py-12 md:py-20 -mt-24 relative z-20">
        <div className="grid md:grid-cols-2 gap-12 items-start">
          <Card className="h-full drop-shadow-custom-md">
            <CardHeader>
              <CardTitle>Precise, Collaborative Feedback</CardTitle>
              <CardDescription>One central place for contextual audio feedback.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-lg text-muted-foreground">
                Stop juggling email chains and confusing notes. FeedbackLoop provides one central place for precise, contextual feedback on your audio files. Upload your mix, share a private link, and get frame-accurate comments directly on the waveform.
              </p>
              <ul className="space-y-3 mt-6">
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
            </CardContent>
          </Card>
          <Card className="h-fit drop-shadow-custom-md">
            <CardHeader>
              <CardTitle>Get Started</CardTitle>
              <CardDescription>Upload an MP3 or WAV to create your feedback session.</CardDescription>
            </CardHeader>
            <CardContent className="px-6 pb-6">
              <UploadForm />
            </CardContent>
          </Card>
        </div>
         <div className="mt-20 text-center">
            <h2 className="text-3xl font-bold tracking-tighter font-headline mb-4">How It Works</h2>
            <div className="grid md:grid-cols-3 gap-8 text-left">
              <Card className="drop-shadow-custom-md">
                <CardHeader>
                  <CardTitle>1. Upload Your Audio</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Drag and drop your MP3 file. Your private, collaborative workspace is created instantly.</p>
                </CardContent>
              </Card>
              <Card className="drop-shadow-custom-md">
                <CardHeader>
                  <CardTitle>2. Share the Link</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Grab the unique link and send it to your clients or team. No sign-up required for them to leave comments.</p>
                </CardContent>
              </Card>
              <Card className="drop-shadow-custom-md">
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
