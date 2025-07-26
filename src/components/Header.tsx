import Link from "next/link";
import { LogIn, UserPlus, Heart } from "lucide-react";
import { Button } from "./ui/button";

export function Header() {
  return (
    <header className="border-b bg-card">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
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
            <Button asChild>
              <Link href="#">
                <Heart className="mr-2 h-4 w-4" />
                Donate
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
