
"use server";

import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';

export async function uploadLabourPhoto(formData: FormData) {
  const file = formData.get('photoFile') as File;
  if (!file) {
    return { success: false, error: "No file provided." };
  }

  try {
    const blob = await put(file.name, file, {
      access: 'public',
      // Add content type if needed, though Vercel Blob often infers it
      // contentType: file.type, 
    });
    return { success: true, url: blob.url };
  } catch (error) {
    console.error("Error uploading labour photo to Vercel Blob:", error);
    return { success: false, error: error instanceof Error ? error.message : "An unknown error occurred during upload." };
  }
}


// It's okay for this file to be nearly empty if no other server actions exist yet.
// It can be populated with new actions in the future.
