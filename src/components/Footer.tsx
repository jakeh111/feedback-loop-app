
'use client';

import Link from "next/link";
import { Beer, Mail, Instagram } from "lucide-react";
import { Button } from "./ui/button";

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
                    <div className="flex flex-col items-start md:items-end gap-2">
                        <div className="flex items-center gap-2">
                            <Button asChild variant="ghost" size="icon">
                                <a href="mailto:sidedoormedia.email@gmail.com" aria-label="Email">
                                    <Mail />
                                </a>
                            </Button>
                            <Button asChild variant="ghost" size="icon">
                                <Link href="#" aria-label="Instagram">
                                    <Instagram />
                                </Link>
                            </Button>
                             <Button asChild variant="ghost" size="icon">
                                <Link href="#" aria-label="Website">
                                    <span className="font-bold text-xs">www</span>
                                </Link>
                            </Button>
                        </div>
                         <Button asChild>
                            <Link href="https://buymeacoffee.com/sidedoormedia" target="_blank" className="group">
                              <Beer className="transition-transform group-hover:-rotate-12" />
                              <span className="max-w-0 overflow-hidden transition-all duration-300 ease-in-out group-hover:max-w-[150px] group-hover:ml-2">
                                Buy Me a Beer
                              </span>
                            </Link>
                        </Button>
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
