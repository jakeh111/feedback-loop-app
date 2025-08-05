

'use client';

import Link from "next/link";
import { LogIn, UserPlus, Beer, Menu } from "lucide-react";
import { Button } from "./ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "./ui/sheet";


export function Header() {

  return (
    <header className="container mx-auto px-4 mt-4">
      <div className="flex items-center justify-between h-16 bg-card border rounded-lg p-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="font-bold text-lg font-headline">FeedbackLoop</span>
        </Link>
        
        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-2">
          <Button variant="ghost" asChild>
            <Link href="/login">
              <LogIn />
              Login
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/dashboard">Dashboard</Link>
          </Button>
          <Button asChild>
            <Link href="/signup">
              <UserPlus/>
              Sign Up
            </Link>
          </Button>
          <Button asChild className="group">
            <Link href="https://buymeacoffee.com/sidedoormedia" target="_blank">
              <Beer className="mr-2 h-4 w-4 transition-transform group-hover:-rotate-12" />
              Buy Me a Beer
            </Link>
          </Button>
        </div>

        {/* Mobile Menu */}
        <div className="md:hidden flex items-center">
          <Sheet>
              <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="w-auto h-auto p-2">
                      <Menu className="h-10 w-10" strokeWidth={2.5} />
                      <span className="sr-only">Open menu</span>
                  </Button>
              </SheetTrigger>
              <SheetContent>
                  <div className="flex flex-col gap-4 py-8">
                      <SheetClose asChild>
                          <Button variant="ghost" className="justify-start" asChild>
                              <Link href="/login">
                                  <LogIn />
                                  Login
                              </Link>
                          </Button>
                      </SheetClose>
                      <SheetClose asChild>
                          <Button variant="outline" className="justify-start" asChild>
                              <Link href="/dashboard">Dashboard</Link>
                          </Button>
                      </SheetClose>
                      <SheetClose asChild>
                           <Button className="justify-start" asChild>
                              <Link href="/signup">
                                  <UserPlus/>
                                  Sign Up
                              </Link>
                          </Button>
                      </SheetClose>
                      <SheetClose asChild>
                           <Button className="justify-start group" asChild>
                              <Link href="https://buymeacoffee.com/sidedoormedia" target="_blank">
                                  <Beer className="mr-2 h-4 w-4 transition-transform group-hover:-rotate-12" />
                                  Buy Me a Beer
                              </Link>
                          </Button>
                      </SheetClose>
                  </div>
              </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
