
'use client';

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { FirebaseError } from "firebase/app";
import { useState }from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

const formSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  password: z.string().min(1, {
    message: "Password is required.",
  }),
});

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [resetEmail, setResetEmail] = useState("");
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      await signInWithEmailAndPassword(auth, values.email, values.password);
      toast({
        title: "Login Successful",
        description: "Welcome back!",
      });
      router.push('/dashboard');
    } catch (error) {
      console.error("Login error:", error);
      let errorMessage = "An unexpected error occurred. Please try again.";
      if (error instanceof FirebaseError) {
         switch (error.code) {
          case 'auth/invalid-email':
            errorMessage = "The email address is not valid.";
            break;
          case 'auth/user-disabled':
            errorMessage = "This account has been disabled.";
            break;
          case 'auth/user-not-found':
          case 'auth/wrong-password':
          case 'auth/invalid-credential':
             errorMessage = "Invalid email or password. Please try again.";
             break;
          default:
            errorMessage = `An error occurred: ${error.message}`;
        }
      }
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: errorMessage,
      });
    }
  }

  const handlePasswordReset = async () => {
    if (!resetEmail) {
        toast({ variant: 'destructive', title: 'Email required', description: 'Please enter your email address.' });
        return;
    }
    try {
        await sendPasswordResetEmail(auth, resetEmail);
        toast({
            title: 'Password Reset Email Sent',
            description: 'If an account exists for this email, you will receive a link to reset your password shortly.',
        });
        setIsResetDialogOpen(false);
        setResetEmail("");
    } catch (error) {
        console.error("Password reset error:", error);
        let errorMessage = "An unexpected error occurred.";
        if (error instanceof FirebaseError) {
            if (error.code === 'auth/invalid-email') {
                errorMessage = "The email address you entered is not valid.";
            }
        }
        toast({
            variant: 'destructive',
            title: 'Failed to Send',
            description: errorMessage,
        });
    }
  }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-10rem)] py-12">
      <Card className="mx-auto max-w-sm w-full drop-shadow-custom-md">
        <CardHeader>
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription>
            Enter your email below to login to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="your@email.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                     <div className="flex items-center">
                        <FormLabel>Password</FormLabel>
                        <AlertDialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
                          <AlertDialogTrigger asChild>
                             <Button type="button" variant="link" className="ml-auto inline-block text-sm p-0 h-auto">Forgot your password?</Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Reset Password</AlertDialogTitle>
                              <AlertDialogDescription>
                                Enter your email address below and we'll send you a link to reset your password.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                             <div className="grid gap-2">
                                <Label htmlFor="reset-email">Email</Label>
                                <Input
                                  id="reset-email"
                                  type="email"
                                  placeholder="your@email.com"
                                  value={resetEmail}
                                  onChange={(e) => setResetEmail(e.target.value)}
                                  required
                                />
                              </div>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={handlePasswordReset}>Send Reset Link</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                 {form.formState.isSubmitting ? "Logging in..." : "Login"}
              </Button>
            </form>
          </Form>
          <div className="mt-4 text-center text-sm">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="underline">
              Sign up
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
