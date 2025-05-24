
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
      style={{ animationDelay: '2s' }} // Start fading out after 2 seconds
    >
      <div className="text-center animate-scale-in-splash p-4">
        <div className="relative mx-auto mb-3 sm:mb-4 h-16 sm:h-20 md:h-24 w-auto overflow-hidden"> {/* Removed fixed aspect ratio, added w-auto */}
          <Image
            src="/jrk-logo.png"
            alt="JRK Enterprises Logo"
            fill
            priority
            className="object-contain"
          />
        </div>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary">JRK ENTERPRISES</h1>
        <p className="text-sm sm:text-base text-muted-foreground mt-2">Loading...</p>
      </div>
      <p className="absolute bottom-10 text-xs sm:text-sm text-muted-foreground animate-fade-in animation-delay-500">
        Developed By Shaik Anisul Rahaman
      </p>
    </div>
  );
}
