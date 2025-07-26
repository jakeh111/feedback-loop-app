import Link from "next/link";
import { LogIn, UserPlus } from "lucide-react";
import { Button } from "./ui/button";

const Logo = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="28"
    height="28"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="text-primary"
  >
    {/* Head outline */}
    <path d="M12,22 C17.5228475,22 22,17.5228475 22,12 C22,6.4771525 17.5228475,2 12,2 C6.4771525,2 2,6.4771525 2,12 C2,14.0759353 2.62319989,16.0076123 3.69660377,17.618034" />

    {/* Glasses */}
    <circle cx="8.5" cy="11.5" r="2.5" />
    <circle cx="15.5" cy="11.5" r="2.5" />
    <line x1="11" y1="11.5" x2="13" y2="11.5" />

    {/* Music Note in head */}
    <path d="M15 9.5 V7.5 a1,1 0 0 0 -1,-1 h-1 a1,1 0 0 0 -1,1 V 9 a2 2 0 0 0-2 2v0a2 2 0 0 0 2 2h2a1 1 0 0 0 1-1Z" />

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
