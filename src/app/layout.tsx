
"use client";

import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import React, { useState, useEffect } from 'react';
import './globals.css';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { MainSidebar } from '@/components/layout/main-sidebar';
import { Toaster } from "@/components/ui/toaster";
import { Button } from '@/components/ui/button';
import { PanelLeft } from 'lucide-react';
import { ThemeProvider } from "@/components/layout/theme-provider";
import { BottomToolbar } from '@/components/layout/bottom-toolbar';
import { SplashScreen } from '@/components/layout/splash-screen';
import { AuthProvider } from '@/context/auth-context';
import { AuthGuard } from '@/components/layout/auth-guard';
import FloatingShapesBackground from '@/components/layout/floating-shapes-background';
// Removed Vercel Speed Insights for Netlify compatibility

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [showSplash, setShowSplash] = useState(true);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    const fadeTimer = setTimeout(() => {
       const removeTimer = setTimeout(() => {
         setShowSplash(false);
         setShowContent(true);
       }, 500);
       return () => clearTimeout(removeTimer);
    }, 2000);

    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => console.log('Service Worker registered with scope:', registration.scope))
        .catch((error) => console.error('Service Worker registration failed:', error));
    }

    return () => clearTimeout(fadeTimer);
  }, []);

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>JRK ENTERPRISES</title>
        <meta name="description" content="Manage labour, track advances, and log daily work." />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#228B22" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="JRK App" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <AuthProvider>
          <SplashScreen isVisible={showSplash} />
          <AuthGuard>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              <FloatingShapesBackground />
              <div className={showContent ? 'animate-slide-in-up-main' : 'opacity-0'}>
                  <SidebarProvider defaultOpen>
                    <MainSidebar />
                    <SidebarInset>
                      <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6 md:hidden">
                        <SidebarTrigger variant="outline" size="icon" />
                      </header>
                      <main className="flex-1 p-4 sm:p-6 min-w-0 pb-20 md:pb-6">
                        {children}
                      </main>
                    </SidebarInset>
                  </SidebarProvider>
                  <Toaster />
                  <BottomToolbar />
              </div>
              {/* <SpeedInsights /> Removed for Netlify compatibility */}
            </ThemeProvider>
          </AuthGuard>
        </AuthProvider>
      </body>
    </html>
  );
}
