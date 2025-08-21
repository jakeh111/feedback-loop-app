

"use client";

import React from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { CheckCircle, Zap } from 'lucide-react';
import { UploadDialog } from '@/components/UploadDialog';
import { Button } from '@/components/ui/button';

const heroImages = [
  { src: "https://firebasestorage.googleapis.com/v0/b/audiomarker.firebasestorage.app/o/claudia-ramirez-jK47-bR5VnU-unsplash.jpg?alt=media&token=ca1d6125-e267-4316-9895-b809b867772a", hint: "music production" },
  { src: "https://firebasestorage.googleapis.com/v0/b/audiomarker.firebasestorage.app/o/filip-barna-SlIu4D_rTPo-unsplash.jpg?alt=media&token=a44a5796-5f93-4070-a210-d27ab60a1de7", hint: "audio mixing" },
  { src: "https://firebasestorage.googleapis.com/v0/b/audiomarker.firebasestorage.app/o/josh-sorenson-LVmyjS0hxYU-unsplash.jpg?alt=media&token=2ce7bc1b-4fde-8ec0-89804d66170c", hint: "sound engineering" },
];

export default function Home() {
  const [randomImage, setRandomImage] = React.useState(heroImages[0]);

  React.useEffect(() => {
    setRandomImage(heroImages[Math.floor(Math.random() * heroImages.length)]);
  }, []);

  return (
    <>
      <div className="relative h-[40vh] -mt-20 flex items-center justify-center overflow-hidden">
        <Image
          src={randomImage.src}
          alt="Abstract audio visualization"
          fill
          className="object-cover slow-zoom"
          data-ai-hint={randomImage.hint}
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent z-10"></div>
        <div className="relative z-20 text-center px-4">
           <h1 className="text-4xl md:text-6xl font-bold tracking-tighter font-headline text-transparent bg-clip-text bg-gradient-to-r from-primary via-white to-primary">
              Collaborative Audio Feedback, Simplified.
            </h1>
        </div>
      </div>
      <div className="container mx-auto px-4 py-12 md:py-20 -mt-24 relative z-20">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 items-start">
          <Card className="h-full drop-shadow-custom-md lg:col-span-2">
            <CardHeader>
              <CardTitle>Precise, Collaborative Feedback</CardTitle>
              <CardDescription>One central place for contextual audio feedback.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-lg text-muted-foreground">
                Stop juggling email chains and confusing notes. TrackPolish provides one central place for precise, contextual feedback on your audio files. Upload your mix, share a private link, and get frame-accurate comments directly on the waveform.
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
                  <span>Shareable private links for easy collaboration.</span>
                </li>
                 <li className="flex items-center gap-3">
                  <Zap className="text-primary" />
                  <span><span className="font-semibold text-primary">Pro:</span> AI-powered summaries to quickly digest feedback.</span>
                </li>
              </ul>
            </CardContent>
          </Card>
          <div className="space-y-8">
            <Card className="h-fit drop-shadow-custom-md">
               <CardHeader>
                <CardTitle>Get Started For Free</CardTitle>
                <CardDescription>Upload an MP3 to create your feedback session.</CardDescription>
              </CardHeader>
              <CardContent>
                  <UploadDialog>
                      <Button className="w-full">Upload Your First Track</Button>
                  </UploadDialog>
              </CardContent>
            </Card>
             <Card className="drop-shadow-custom-md bg-gradient-to-br from-primary/10 to-background">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Zap className="text-primary"/>
                        Go Pro
                    </CardTitle>
                    <CardDescription>Unlock powerful features to enhance your workflow.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <ul className="space-y-3 text-sm">
                        <li className="flex items-start gap-3">
                            <CheckCircle className="text-primary w-5 h-5 mt-0.5" />
                            <span><span className="font-semibold">AI-Powered Summaries:</span> Get instant summaries of all comments on your track.</span>
                        </li>
                         <li className="flex items-start gap-3">
                            <CheckCircle className="text-primary w-5 h-5 mt-0.5" />
                            <span><span className="font-semibold">WAV to MP3 Conversion:</span> Upload high-quality WAV files and we'll handle the conversion.</span>
                        </li>
                         <li className="flex items-start gap-3">
                            <CheckCircle className="text-primary w-5 h-5 mt-0.5" />
                           <span><span className="font-semibold">Ad-Free Experience:</span> Focus on the feedback without any interruptions.</span>
                        </li>
                         <li className="flex items-start gap-3">
                            <CheckCircle className="text-primary w-5 h-5 mt-0.5" />
                           <span><span className="font-semibold">Permanent Track Storage:</span> Never lose a track or comment again.</span>
                        </li>
                    </ul>
                    <Button className="w-full" disabled>Learn More (Coming Soon)</Button>
                </CardContent>
            </Card>
          </div>
        </div>
         <div className="mt-20 text-center">
            <h2 className="text-3xl font-bold tracking-tighter font-headline mb-4">How It Works</h2>
            <div className="grid md:grid-cols-3 gap-8 text-left">
              <Card className="drop-shadow-custom-md">
                <CardContent className="pt-6 text-center flex flex-col items-center">
                  <CardTitle>1. Upload Your Audio</CardTitle>
                  <p className="mt-2">Drag and drop your MP3 file. Pro users can upload WAV files for automatic conversion.</p>
                </CardContent>
              </Card>
              <Card className="drop-shadow-custom-md">
                <CardContent className="pt-6 text-center flex flex-col items-center">
                  <CardTitle>2. Share the Link</CardTitle>
                  <p className="mt-2">Grab the unique link and send it to your clients or team. No sign-up required for them to leave comments.</p>
                </CardContent>
              </Card>
              <Card className="drop-shadow-custom-md">
                <CardContent className="pt-6 text-center flex flex-col items-center">
                  <CardTitle>3. Get Precise Feedback</CardTitle>
                  <p className="mt-2">Collaborators can add comments to a specific timestamp, highlight a time range, or even reference a YouTube video.</p>
                </CardContent>
              </Card>
            </div>
          </div>
      </div>
    </>
  );
}
