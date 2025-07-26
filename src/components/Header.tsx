import Link from "next/link";
import { LogIn, UserPlus } from "lucide-react";
import { Button } from "./ui/button";

const Logo = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="32"
    height="32"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="text-primary"
  >
    {/* Oval Head */}
    <ellipse cx="12" cy="12" rx="9" ry="11" />
    
    {/* Circle Glasses */}
    <circle cx="8.5" cy="12" r="2.5" />
    <circle cx="15.5" cy="12" r="2.5" />
    <line x1="11" y1="12" x2="13" y2="12" />

    {/* Single Music Note */}
    <path d="M12 10.5a2 2 0 1 0 -4 0v3.5h4" />
    <path d="M12 8a2 2 0 1 1 4 0v3.5h-4" />
  </svg>
);


export function Header() {
  return (
    <header className="border-b bg-card">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <Logo />
            <span className="font-bold text-lg font-headline">FeedbackLoop</span>
          </Link>
          <div className="flex items-center gap-2">
            <Button variant="ghost" asChild>
              <Link href="/login">
                <LogIn />
                Login
              </Link>
            </Button>
            <Button asChild>
              <Link href="/signup">
                <UserPlus/>
                Sign Up
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/dashboard">Dashboard</Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
