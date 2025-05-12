
"use client";

import React from 'react';
import { Building } from 'lucide-react'; // Using Building icon as a placeholder

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
      <div className="text-center animate-scale-in-splash">
        {/* Placeholder for 3D JRK Logo */}
        <Building className="h-24 w-24 text-primary mb-4" />
        <h1 className="text-4xl font-bold text-primary">JRK ENTERPRISES</h1>
        <p className="text-muted-foreground mt-2">Loading...</p>
      </div>
    </div>
  );
}
