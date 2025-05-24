
"use client";

import React from 'react';
import Image from 'next/image'; // Import next/image

interface SplashScreenProps {
  isVisible: boolean;
}

export function SplashScreen({ isVisible }: SplashScreenProps) {
  if (!isVisible) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background animate-fade-out-splash animation-delay-2000"
      // Removed inline style={{ animationDelay: '2s' }} as animation-delay-2000 class handles it
    >
      <div className="text-center animate-scale-in-splash p-4">
        <div className="relative mx-auto mb-3 sm:mb-4 h-48 w-48 sm:h-64 sm:w-64 md:h-80 md:w-80 overflow-hidden">
          {/*
              Ensure splash-animation.gif is in the /public folder.
          */}
          <Image
            src="/splash-animation.gif"
            alt="JRK Enterprises Loading Animation"
            fill
            priority // Good for LCP elements, which this effectively is during splash
            className="object-contain"
            unoptimized // GIFs are often better unoptimized by next/image
          />
        </div>
        {/* Optional: You can add back title or loading text if desired, or leave it clean with just the GIF */}
        {/* <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary">JRK ENTERPRISES</h1> */}
        {/* <p className="text-sm sm:text-base text-muted-foreground mt-2">Loading...</p> */}
      </div>
      <p className="absolute bottom-10 text-xs sm:text-sm text-muted-foreground animate-fade-in animation-delay-500">
        Developed By Shaik Anisul Rahaman
      </p>
    </div>
  );
}
