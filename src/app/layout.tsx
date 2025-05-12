
"use client"; // Add 'use client' because we need state and effects for the splash screen

import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import React, { useState, useEffect } from 'react'; // Import useState and useEffect
import './globals.css';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { MainSidebar } from '@/components/layout/main-sidebar';
import { Toaster } from "@/components/ui/toaster";
import { Button } from '@/components/ui/button';
import { PanelLeft } from 'lucide-react';
import { ThemeProvider } from "@/components/layout/theme-provider";
import { BottomToolbar } from '@/components/layout/bottom-toolbar';
import { SplashScreen } from '@/components/layout/splash-screen'; // Import the splash screen

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

// Metadata is still defined here, but might not be strictly necessary if the component is client-side
// export const metadata: Metadata = {
//   title: 'JRK ENTERPRISES',
//   description: 'Manage labor, track advances, and log daily work.',
// };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [showSplash, setShowSplash] = useState(true);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    // Start fading out splash after 2 seconds
    const fadeTimer = setTimeout(() => {
       // This timeout ensures the fade-out animation has time to run before removing splash
       const removeTimer = setTimeout(() => {
         setShowSplash(false);
         setShowContent(true); // Start showing content after splash is removed
       }, 500); // Match animation duration

       // Clean up removeTimer if component unmounts
       return () => clearTimeout(removeTimer);

    }, 2000); // Initial delay before starting fade-out

    // Clean up fadeTimer if component unmounts
    return () => clearTimeout(fadeTimer);
  }, []);

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Metadata tags can be placed directly in head for client components */}
        <title>JRK ENTERPRISES</title>
        <meta name="description" content="Manage labour, track advances, and log daily work." />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning // Add this to ignore extension-injected attributes
      >
        <SplashScreen isVisible={showSplash} />
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {/* Conditionally render content after splash screen timeout */}
          <div className={showContent ? 'animate-slide-in-up-main' : 'opacity-0'}>
            <SidebarProvider defaultOpen>
              <MainSidebar />
              <SidebarInset>
                <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6 md:hidden">
                  <SidebarTrigger variant="outline" size="icon" />
                  {/* The SidebarTrigger component already includes PanelLeft and sr-only text.
                      Passing variant and size directly is preferred over asChild here to avoid issues
                      with React.Children.only if the internal structure changes.
                      The default sr-only text in SidebarTrigger is "Toggle Sidebar".
                  */}
                </header>
                <main className="flex-1 p-4 sm:p-6 min-w-0 pb-20 md:pb-6"> {/* Added padding-bottom for mobile */}
                  {children}
                </main>
              </SidebarInset>
            </SidebarProvider>
            <Toaster />
            <BottomToolbar />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
