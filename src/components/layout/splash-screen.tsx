
"use client";

import React from 'react';
// Image component is no longer needed here if we remove the GIF/logo entirely.
// import Image from 'next/image'; 

interface SplashScreenProps {
  isVisible: boolean;
}

export function SplashScreen({ isVisible }: SplashScreenProps) {
  if (!isVisible) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background animate-fade-out-splash animation-delay-2000"
    >
      {/* 
        The main content area of the splash screen (logo/GIF) is now removed.
        You can add a simple loading text or keep it blank for a cleaner fade.
        Example: 
        <div className="text-center p-4">
          <p className="text-lg text-muted-foreground animate-scale-in-splash">Loading...</p>
        </div> 
      */}
      
      <p className="absolute bottom-10 text-xs sm:text-sm text-muted-foreground animate-fade-in animation-delay-500">
        Developed By Shaik Anisul Rahaman
      </p>
    </div>
  );
}
