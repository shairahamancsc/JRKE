
"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/context/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, UserPlus, AlertTriangle } from 'lucide-react';

// Schema for supervisor registration form
const supervisorSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"], // Set the error path to confirmPassword
});

type SupervisorFormData = z.infer<typeof supervisorSchema>;

export default function RegisterSupervisorPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { registerSupervisor, currentUsername, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<SupervisorFormData>({
    resolver: zodResolver(supervisorSchema),
  });

  // Redirect if not Admin or auth is still loading
  useEffect(() => {
    if (!isAuthLoading && currentUsername !== 'Admin') {
      toast({
        variant: "destructive",
        title: "Unauthorized Access",
        description: "You do not have permission to access this page.",
      });
      router.replace('/'); // Redirect to dashboard
    }
  }, [currentUsername, isAuthLoading, router, toast]);

  const handleRegister: SubmitHandler<SupervisorFormData> = async (data) => {
    setIsLoading(true);
    setError(null);

    // WARNING: Storing plain passwords is insecure! Use hashing in production.
    const result = await registerSupervisor({
      username: data.username,
      password: data.password, // Storing plain password - insecure!
    });

    if (result.success) {
      toast({ title: "Supervisor Registered", description: `User ${data.username} created successfully.` });
      reset(); // Clear the form
    } else {
      setError(result.error || "Failed to register supervisor.");
      toast({
        variant: "destructive",
        title: "Registration Failed",
        description: result.error || "An unknown error occurred.",
      });
    }

    setIsLoading(false);
  };

  // Show loading if auth is still checking or if user is not Admin (while redirecting)
  if (isAuthLoading || currentUsername !== 'Admin') {
     return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 flex items-center justify-center min-h-[calc(100vh-150px)]">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <UserPlus className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold text-foreground">Register New Supervisor</CardTitle>
          <CardDescription>Create a new user account with supervisor privileges.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(handleRegister)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                {...register('username')}
                placeholder="Enter supervisor username"
                className={errors.username ? 'border-destructive' : ''}
                disabled={isLoading}
              />
              {errors.username && <p className="text-xs text-destructive mt-1">{errors.username.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                {...register('password')}
                placeholder="Enter password (min 8 characters)"
                className={errors.password ? 'border-destructive' : ''}
                disabled={isLoading}
              />
              {errors.password && <p className="text-xs text-destructive mt-1">{errors.password.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                {...register('confirmPassword')}
                placeholder="Re-enter password"
                className={errors.confirmPassword ? 'border-destructive' : ''}
                disabled={isLoading}
              />
              {errors.confirmPassword && <p className="text-xs text-destructive mt-1">{errors.confirmPassword.message}</p>}
            </div>

            {error && (
              <div className="flex items-center p-3 text-sm text-destructive bg-destructive/10 border border-destructive/30 rounded-md">
                <AlertTriangle className="h-4 w-4 mr-2 flex-shrink-0" />
                {error}
              </div>
            )}

            <p className="text-xs text-muted-foreground text-center flex items-start gap-1.5">
              <AlertTriangle className="h-5 w-5 mt-0.5 text-amber-500 flex-shrink-0" />
              <span className="text-amber-600 dark:text-amber-400">
                Note: Passwords are stored directly for this demo. Use proper hashing in a production environment.
              </span>
            </p>


            <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Registering...
                </>
              ) : (
                'Register Supervisor'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
