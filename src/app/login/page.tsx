
"use client";

import React, { useState } from 'react';
import Image from 'next/image'; // Import next/image
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null); // Clear previous errors

    try {
      const loggedIn = await login(username, password);
      if (loggedIn) {
        toast({ title: "Login Successful", description: "Welcome back!" });
        router.push('/'); // Redirect to dashboard on successful login
      } else {
        setError("Invalid username or password.");
        toast({
          variant: "destructive",
          title: "Login Failed",
          description: "Invalid username or password.",
        });
      }
    } catch (err) {
        const message = err instanceof Error ? err.message : "An unexpected error occurred during login.";
        setError(message);
        toast({
          variant: "destructive",
          title: "Login Error",
          description: message,
        });
    } finally {
      setIsLoading(false);
    }
  };

  const [error, setError] = useState<string | null>(null);


  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-sm shadow-xl">
        <CardHeader className="text-center">
           <div className="flex justify-center mb-4">
            <div className="relative h-12 w-auto"> {/* Removed fixed aspect ratio */}
              <Image
                src="/jrk-logo.png"
                alt="JRK Enterprises Logo"
                fill
                className="object-contain"
              />
            </div>
           </div>
          <CardTitle className="text-2xl font-bold text-foreground">JRK ENTERPRISES</CardTitle>
          <CardDescription>Please log in to continue</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                disabled={isLoading}
              />
            </div>
             {error && <p className="text-xs text-destructive text-center">{error}</p>}
            <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Logging in...
                </>
              ) : (
                'Login'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
