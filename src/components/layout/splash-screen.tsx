
"use client";

import React from 'react';
import Image from 'next/image'; // Make sure next/image is imported

interface SplashScreenProps {
  isVisible: boolean;
}

export function SplashScreen({ isVisible }: SplashScreenProps) {
  if (!isVisible) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background animate-fade-out-splash animation-delay-2000"
    >
      <div className="text-center animate-scale-in-splash p-4">
        {/* JRK Enterprises Logo */}
        <div className="relative mx-auto mb-3 sm:mb-4 h-16 sm:h-20 md:h-24 w-auto overflow-hidden">
          <Image
            src="/jrk-logo.png" // Path to your logo in the public folder
            alt="JRK Enterprises Logo"
            fill // Use fill to make the image responsive within the container
            className="object-contain" // Ensures the image scales correctly without cropping
          />
        </div>
        {/* Optional: Title Text if needed
        <h1 className="text-2xl sm:text-3xl font-bold text-primary mb-2">
          JRK ENTERPRISES
        </h1>
        */}
        {/* Optional: Loading Text
        <p className="text-sm sm:text-md text-muted-foreground">Loading...</p>
        */}
      </div>
      <p className="absolute bottom-10 text-xs sm:text-sm text-muted-foreground animate-fade-in animation-delay-500">
        Developed By Shaik Anisul Rahaman
      </p>
    </div>
  );
}
