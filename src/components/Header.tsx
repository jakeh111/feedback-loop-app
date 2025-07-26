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
    {/* Head outline */}
    <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 14.3443 2.76654 16.4849 4.07437 18.1743" />

    {/* Glasses */}
    <circle cx="8.5" cy="11" r="2" />
    <circle cx="15.5" cy="11" r="2" />
    <line x1="10.5" y1="11" x2="13.5" y2="11" />

    {/* Music Note in head */}
    <path d="M12 9a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm0-2v4m2-2h-4" transform="translate(1, -0.5) scale(0.8)" />
    <path d="M14,10 L14,7 C14,6.44771525 13.5522847,6 13,6 L11,6 C10.4477153,6 10,6.44771525 10,7 L10,8.5 C10,9.88071187 11.1192881,11 12.5,11 L12.5,11 C13.8807119,11 15,9.88071187 15,8.5 Z" strokeWidth="1" />
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
