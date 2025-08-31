
'use client';

import { Beer, Mail, MailOpen, Instagram, MessageSquare } from "lucide-react";
import { Button } from "./ui/button";
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "./ui/tooltip";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="w-full pb-4">
        <div className="container mx-auto">
            <div className="bg-card border rounded-lg p-6 text-card-foreground">
                <div className="grid md:grid-cols-2 gap-8 items-center">
                    <div>
                        <h3 className="text-lg font-headline font-bold mb-2">About TrackPolish</h3>
                        <p className="text-sm text-muted-foreground">
                            TrackPolish is a collaborative audio feedback tool designed for musicians, producers, and audio engineers. Upload your tracks, share a private link, and get precise, timestamped feedback directly on the waveform to streamline your revision process.
                        </p>
                    </div>
                    <div className="flex flex-col items-start md:items-end gap-4">
                      <div className="flex justify-start md:justify-end items-center gap-2">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button asChild variant="ghost" size="icon">
                                  <a href="mailto:sidedoormedia.email@gmail.com" aria-label="Email" className="group">
                                      <Mail className="block group-hover:hidden" />
                                      <MailOpen className="hidden group-hover:block" />
                                  </a>
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Email</p>
                            </TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                               <Button asChild variant="ghost" size="icon">
                                  <a href="https://www.instagram.com/sidedoormedia/" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="group">
                                      <Instagram className="transition-transform group-hover:rotate-12" />
                                  </a>
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Instagram</p>
                            </TooltipContent>
                          </Tooltip>
                           <Tooltip>
                            <TooltipTrigger asChild>
                              <Button asChild variant="ghost" size="icon">
                                  <a href="https://buymeacoffee.com/sidedoormedia" target="_blank" aria-label="Buy Me a Beer" className="group">
                                    <Beer className="transition-transform group-hover:-rotate-12" />
                                  </a>
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Buy Me a Beer | Support</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                       <Button asChild variant="outline" size="sm">
                          <Link href="/feedback">
                            <MessageSquare className="mr-2 h-4 w-4"/>
                            Feedback
                          </Link>
                       </Button>
                    </div>
                </div>
                 <div className="border-t border-border mt-6 pt-4 text-center text-xs text-muted-foreground">
                    <p>&copy; {new Date().getFullYear()} TrackPolish. All Rights Reserved.</p>
                    <p className="mt-1">Background images courtesy of <a href="https://unsplash.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-primary">Unsplash</a>.</p>
                 </div>
            </div>
        </div>
    </footer>
  );
}
