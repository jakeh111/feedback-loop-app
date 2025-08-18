
'use client';

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { EmailAuthProvider, reauthenticateWithCredential, updateEmail, updateProfile } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { FirebaseError } from "firebase/app";

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
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";


const formSchema = z.object({
  name: z.string().min(1, { message: "Name is required." }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  password: z.string().min(1, {
    message: "Password is required for verification.",
  }),
});

export default function ProfilePage() {
  const router = useRouter();
  const { toast } = useToast();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });
  
  const user = auth.currentUser;

  useEffect(() => {
    if (user) {
        form.reset({
            name: user.displayName || "",
            email: user.email || "",
            password: "",
        });
    }
  }, [user, form]);


  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user) {
        toast({
            variant: "destructive",
            title: "Not Authenticated",
            description: "You must be logged in to update your profile.",
        });
        return;
    }

    const credential = EmailAuthProvider.credential(user.email!, values.password);

    try {
        await reauthenticateWithCredential(user, credential);
        
        const updatePromises = [];

        // Check if name is different and update if needed
        if (values.name !== user.displayName) {
            updatePromises.push(updateProfile(user, { displayName: values.name }));
        }

        // Check if email is different and update if needed
        if (values.email !== user.email) {
            updatePromises.push(updateEmail(user, values.email));
        }

        if (updatePromises.length > 0) {
            await Promise.all(updatePromises);
            toast({
                title: "Profile Updated",
                description: "Your account details have been successfully updated.",
            });
            // Reset form with new values, clear password
            form.reset({
                name: values.name,
                email: values.email,
                password: "",
            });
        } else {
             toast({
                title: "No Changes",
                description: "You didn't make any changes to your profile.",
            });
        }


    } catch (error) {
      console.error("Profile update error:", error);
      let errorMessage = "An unexpected error occurred. Please try again.";
      if (error instanceof FirebaseError) {
         switch (error.code) {
          case 'auth/invalid-credential':
             errorMessage = "The password you entered is incorrect. Please try again.";
             break;
          case 'auth/email-already-in-use':
            errorMessage = "This email is already in use by another account.";
            break;
          case 'auth/requires-recent-login':
            errorMessage = "This is a sensitive operation. Please log out and log back in before changing your email.";
            break;
          default:
            errorMessage = `An error occurred: ${error.message}`;
        }
      }
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: errorMessage,
      });
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
        <div className="mb-4">
            <Button asChild variant="ghost">
                <Link href="/dashboard">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Dashboard
                </Link>
            </Button>
        </div>
      <Card className="mx-auto max-w-2xl drop-shadow-custom-md">
        <CardHeader>
          <CardTitle className="text-2xl">Edit Profile</CardTitle>
          <CardDescription>
            Update your name or email address. You must provide your current password to make changes.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Display Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Your Name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="your@email.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <hr className="my-4"/>
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                     <FormLabel>Current Password</FormLabel>
                     <FormDescription>For security, please confirm your password to save changes.</FormDescription>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                 {form.formState.isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
