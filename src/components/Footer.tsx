
'use client';

import Link from "next/link";
import { Beer, Mail, MailOpen, Instagram, Sparkles } from "lucide-react";
import { Button } from "./ui/button";
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "./ui/tooltip";

export function Footer() {
  return (
    <footer className="w-full pb-4">
        <div className="container mx-auto">
            <div className="bg-card border rounded-lg p-6 text-card-foreground">
                <div className="grid md:grid-cols-2 gap-8 items-center">
                    <div>
                        <h3 className="text-lg font-headline font-bold mb-2">About FeedbackLoop</h3>
                        <p className="text-sm text-muted-foreground">
                            This is a placeholder for your about section. You can describe your project, your mission, or anything else you'd like to share with your visitors.
                        </p>
                    </div>
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
                                <Link href="#" aria-label="Instagram" className="group relative">
                                    <Instagram />
                                    <Sparkles className="absolute -top-1 -right-1 h-3 w-3 text-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                    <Sparkles className="absolute top-0 right-0 h-2 w-2 text-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100" />
                                     <Sparkles className="absolute -top-1 right-1 h-2 w-2 text-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-200" />
                                </Link>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Instagram</p>
                          </TooltipContent>
                        </Tooltip>
                         <Tooltip>
                          <TooltipTrigger asChild>
                            <Button asChild variant="ghost" size="icon">
                                <Link href="https://buymeacoffee.com/sidedoormedia" target="_blank" aria-label="Buy Me a Beer" className="group">
                                  <Beer className="transition-transform group-hover:rotate-12" />
                                </Link>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Buy Me a Beer</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                </div>
                 <div className="border-t border-border mt-6 pt-4 text-center text-xs text-muted-foreground">
                    <p>&copy; {new Date().getFullYear()} FeedbackLoop. All Rights Reserved.</p>
                    <p className="mt-1">Background images courtesy of <a href="https://unsplash.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-primary">Unsplash</a>.</p>
                 </div>
            </div>
        </div>
    </footer>
  );
}
