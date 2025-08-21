

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
                <CardHeader>
                    <div className="flex items-center gap-4">
                        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="hsl(var(--primary))" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
                            <path d="M14 16h-4a2 2 0 0 0-2 2v2H6v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2h-2v-2a2 2 0 0 0-2-2z"/>
                            <circle cx="12" cy="11" r="1"/>
                            <path d="M18 14h-2a4 4 0 0 0-4-4h0a4 4 0 0 0-4 4H6"/>
                            <rect x="2" y="3" width="20" height="14" rx="2"/>
                        </svg>
                        <CardTitle>1. Upload Your Audio</CardTitle>
                    </div>
                </CardHeader>
                <CardContent>
                  <p>Drag and drop your MP3 file. Pro users can upload WAV files for automatic conversion.</p>
                </CardContent>
              </Card>
              <Card className="drop-shadow-custom-md">
                <CardHeader>
                    <div className="flex items-center gap-4">
                         <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="hsl(var(--primary))" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
                            <circle cx="7" cy="6" r="2"/>
                            <path d="M7 8v6"/>
                            <path d="M9 14h2"/>
                            <path d="M12 14v-4"/>
                            <path d="M11 6h1.5a1.5 1.5 0 0 1 0 3H11"/>
                            <circle cx="17" cy="6" r="2"/>
                            <path d="M17 8v6"/>
                            <path d="M15 14h4"/>
                         </svg>
                         <CardTitle>2. Share the Link</CardTitle>
                    </div>
                </CardHeader>
                <CardContent>
                  <p>Grab the unique link and send it to your clients or team. No sign-up required for them to leave comments.</p>
                </CardContent>
              </Card>
              <Card className="drop-shadow-custom-md">
                <CardHeader>
                    <div className="flex items-center gap-4">
                        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="hsl(var(--primary))" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
                            <path d="M7.9 20A9 9 0 0 0 12 21a9 9 0 0 0 4.1-1"/>
                            <path d="M12 12a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/>
                            <path d="M16 18H8a4 4 0 0 0-4 4h16a4 4 0 0 0-4-4z"/>
                            <path d="M18 10h2.5a2 2 0 0 1 2 1.5v1a2 2 0 0 1-2 2.5H18"/>
                            <path d="M20.5 13H21a1 1 0 0 1 1 1v2"/>
                            <path d="M20 9.5V8a1 1 0 0 0-1-1h-1"/>
                            <path d="M19 6.5v-1a1 1 0 0 0-1-1h-1.5"/>
                            <path d="M19 12h.01"/>
                        </svg>
                        <CardTitle>3. Get Precise Feedback</CardTitle>
                    </div>
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
