'use client';

import Link from "next/link";
import { LogIn, UserPlus, Heart, Menu, Sun, Moon, Beer } from "lucide-react";
import { Button } from "./ui/button";
import { ThemeToggle, useTheme } from "./ThemeProvider";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "./ui/sheet";


export function Header() {
  const { theme, setTheme } = useTheme();
  const toggleTheme = () => {
      setTheme(theme === 'sunset' ? 'indigo' : 'sunset');
  }

  return (
    <header className="border-b bg-card">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
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
            <Button asChild>
              <Link href="https://www.buymeacoffee.com/your-username" target="_blank">
                <Beer className="mr-2 h-4 w-4" />
                Buy Me a Coffee
              </Link>
            </Button>
            <ThemeToggle />
          </div>

          {/* Mobile Menu */}
          <div className="md:hidden flex items-center">
            <Sheet>
                <SheetTrigger asChild>
                    <Button variant="ghost" size="icon">
                        <Menu />
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
                             <Button className="justify-start" asChild>
                                <Link href="https://www.buymeacoffee.com/your-username" target="_blank">
                                    <Beer className="mr-2 h-4 w-4" />
                                    Buy Me a Coffee
                                </Link>
                            </Button>
                        </SheetClose>
                        <Button variant="ghost" className="justify-start" onClick={toggleTheme}>
                            {theme === 'sunset' ? <Moon /> : <Sun />}
                            <span>Toggle Theme</span>
                        </Button>
                    </div>
                </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
