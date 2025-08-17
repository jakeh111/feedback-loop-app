
'use client';

import Link from "next/link";
import { LogIn, UserPlus, Menu, LogOut, User } from "lucide-react";
import { Button } from "./ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "./ui/sheet";
import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut, type User as FirebaseUser } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";


export function Header() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out.",
      });
      router.push('/');
    } catch (error) {
      console.error("Logout error:", error);
      toast({
        variant: "destructive",
        title: "Logout Failed",
        description: "An error occurred while logging out. Please try again.",
      });
    }
  };

  return (
    <header className="w-full z-30 pt-4">
      <div className="container mx-auto">
        <div className="flex items-center justify-between h-16 bg-card border rounded-lg p-4">
          <Link href="/" className="flex items-center gap-2">
            <span className="font-bold text-lg font-headline">TrackPolish</span>
          </Link>
          
          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-2">
            {isLoading ? (
              <div className="h-8 w-24 bg-muted rounded-md animate-pulse" />
            ) : user ? (
              <>
                 <Button variant="ghost">
                    <User className="mr-2 h-4 w-4"/>
                    {user.displayName || user.email}
                 </Button>
                 <Button asChild variant="outline">
                    <Link href="/dashboard">{user.displayName ? `${user.displayName.split(' ')[0]}'s Dashboard` : 'Dashboard'}</Link>
                 </Button>
                <Button onClick={handleLogout} variant="ghost">
                  <LogOut />
                  Logout
                </Button>
              </>
            ) : (
              <>
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
              </>
            )}
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
                      {isLoading ? (
                         <div className="h-8 w-full bg-muted rounded-md animate-pulse" />
                      ) : user ? (
                        <>
                           <SheetClose asChild>
                             <Button variant="ghost" className="justify-start">
                                <User className="mr-2 h-4 w-4"/>
                                {user.displayName || user.email}
                             </Button>
                           </SheetClose>
                            <SheetClose asChild>
                               <Button variant="outline" className="justify-start" asChild>
                                    <Link href="/dashboard">{user.displayName ? `${user.displayName.split(' ')[0]}'s Dashboard` : 'Dashboard'}</Link>
                                </Button>
                            </SheetClose>
                           <SheetClose asChild>
                            <Button onClick={handleLogout} variant="ghost" className="justify-start">
                              <LogOut />
                              Logout
                            </Button>
                           </SheetClose>
                        </>
                      ) : (
                        <>
                           <SheetClose asChild>
                              <Button variant="ghost" className="justify-start" asChild>
                                  <Link href="/login">
                                      <LogIn />
                                      Login
                                  </Link>
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
                        </>
                      )}
                    </div>
                </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
