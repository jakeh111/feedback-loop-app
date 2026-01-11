'use client';

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { EmailAuthProvider, reauthenticateWithCredential, updateEmail, updateProfile } from "firebase/auth";
import { auth, firestore } from "@/lib/firebase";
import { FirebaseError } from "firebase/app";
import { doc, getDoc, setDoc } from 'firebase/firestore';

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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Bell } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";


const formSchema = z.object({
  name: z.string().min(1, { message: "Name is required." }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  password: z.string().optional(),
});

export default function ProfilePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
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

        const userSettingsRef = doc(firestore, "users", user.uid);
        getDoc(userSettingsRef).then(docSnap => {
            if (docSnap.exists()) {
                setNotificationsEnabled(docSnap.data().notificationsEnabled ?? true);
            }
        })
    }
  }, [user, form]);


  const handleNotificationChange = async (enabled: boolean) => {
    if (!user) return;
    setNotificationsEnabled(enabled);
    try {
        const userSettingsRef = doc(firestore, "users", user.uid);
        await setDoc(userSettingsRef, { notificationsEnabled: enabled }, { merge: true });
        toast({
            title: "Settings Updated",
            description: `Email notifications have been ${enabled ? 'enabled' : 'disabled'}.`
        })
    } catch(error) {
        console.error("Error updating notification settings:", error);
        toast({ variant: 'destructive', title: 'Error', description: 'Could not update notification settings.'});
        setNotificationsEnabled(!enabled); // revert on failure
    }
  }


  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user) {
        toast({
            variant: "destructive",
            title: "Not Authenticated",
            description: "You must be logged in to update your profile.",
        });
        return;
    }

    const hasNameChanged = values.name !== user.displayName;
    const hasEmailChanged = values.email !== user.email;

    if (!hasNameChanged && !hasEmailChanged) {
        toast({
            title: "No Changes",
            description: "You didn't make any changes to your profile.",
        });
        return;
    }

    if (!values.password) {
        form.setError("password", { type: "manual", message: "Password is required to make changes." });
        return;
    }


    const credential = EmailAuthProvider.credential(user.email!, values.password);

    try {
        await reauthenticateWithCredential(user, credential);
        
        const updatePromises = [];

        if (hasNameChanged) {
            updatePromises.push(updateProfile(user, { displayName: values.name }));
        }
        if (hasEmailChanged) {
            updatePromises.push(updateEmail(user, values.email));
        }

        if (updatePromises.length > 0) {
            await Promise.all(updatePromises);
            toast({
                title: "Profile Updated",
                description: "Your account details have been successfully updated.",
            });
            form.reset({
                name: values.name,
                email: values.email,
                password: "",
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
            Update your account details and notification preferences.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
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
               <hr className="my-2"/>
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

           <div className="space-y-4">
            <hr />
            <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                    <Label className="text-base flex items-center gap-2"><Bell /> Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive email notifications for new comments.</p>
                </div>
                <Switch
                    checked={notificationsEnabled}
                    onCheckedChange={handleNotificationChange}
                    aria-readonly
                />
            </div>
           </div>

        </CardContent>
      </Card>
    </div>
  );
}
