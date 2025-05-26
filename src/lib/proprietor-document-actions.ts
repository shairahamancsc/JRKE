
"use server";

import { kv } from '@vercel/kv';
import { put, del } from '@vercel/blob';
import type { ProprietorDocument } from './types';
import { PROPRIETOR_DOCUMENTS_KV_KEY } from './storageKeys';

export async function uploadProprietorDocumentFile(formData: FormData): Promise<{ success: boolean; url?: string; error?: string }> {
  const file = formData.get('file') as File;
  if (!file) {
    return { success: false, error: "No file provided." };
  }

  try {
    // Sanitize filename to prevent issues, e.g., replace spaces with underscores
    const sanitizedFileName = file.name.replace(/\s+/g, '_');
    const blob = await put(`proprietor_documents/${sanitizedFileName}`, file, {
      access: 'public',
      // Optionally, set a cache control header if appropriate
      // cacheControl: 'public, max-age=31536000, immutable', 
    });
    return { success: true, url: blob.url };
  } catch (error) {
    console.error("Error uploading proprietor document to Vercel Blob:", error);
    return { success: false, error: error instanceof Error ? error.message : "An unknown error occurred during file upload." };
  }
}

export async function getAllProprietorDocuments(): Promise<ProprietorDocument[]> {
  try {
    const documents = await kv.get<ProprietorDocument[]>(PROPRIETOR_DOCUMENTS_KV_KEY);
    return (documents || []).sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
  } catch (error) {
    console.error("Error fetching proprietor documents from KV:", error);
    return [];
  }
}

export async function addProprietorDocument(documentData: Omit<ProprietorDocument, 'id'>): Promise<ProprietorDocument> {
  try {
    const documents = await getAllProprietorDocuments();
    const newDocument: ProprietorDocument = {
      ...documentData,
      id: crypto.randomUUID(),
      uploadedAt: new Date().toISOString(), // Ensure uploadedAt is set here
    };
    const updatedDocuments = [newDocument, ...documents]; // Add to the beginning to keep sorted by new
    await kv.set(PROPRIETOR_DOCUMENTS_KV_KEY, updatedDocuments);
    return newDocument;
  } catch (error) {
    console.error("Error adding proprietor document to KV:", error);
    throw new Error("Failed to add proprietor document.");
  }
}

export async function deleteProprietorDocument(documentId: string, blobUrl: string): Promise<void> {
  try {
    // First, delete the file from Vercel Blob
    if (blobUrl) {
      await del(blobUrl); // del function from @vercel/blob takes the URL
    }

    // Then, delete the metadata from Vercel KV
    let documents = await getAllProprietorDocuments();
    documents = documents.filter(doc => doc.id !== documentId);
    await kv.set(PROPRIETOR_DOCUMENTS_KV_KEY, documents);
  } catch (error) {
    console.error("Error deleting proprietor document:", error);
    throw new Error("Failed to delete proprietor document.");
  }
}
