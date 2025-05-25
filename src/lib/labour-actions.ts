
"use server";

import { kv } from '@vercel/kv';
import type { Labour } from './types';

const LABOURS_KV_KEY = 'jrk-labours';

export async function getAllLabours(): Promise<Labour[]> {
  try {
    const labours = await kv.get<Labour[]>(LABOURS_KV_KEY);
    return labours || [];
  } catch (error) {
    console.error("Error fetching labours from KV:", error);
    return [];
  }
}

export async function addLabour(labourData: Omit<Labour, 'id' | 'photoFile' | 'aadhaarFile' | 'panFile' | 'licenseFile'>): Promise<Labour> {
  try {
    const labours = await getAllLabours();
    const newLabour: Labour = {
      ...labourData,
      id: crypto.randomUUID(),
      // File related fields (photoFile, etc.) are handled client-side for upload then URL is stored
    };
    const updatedLabours = [...labours, newLabour];
    await kv.set(LABOURS_KV_KEY, updatedLabours);
    return newLabour;
  } catch (error) {
    console.error("Error adding labour to KV:", error);
    throw new Error("Failed to add labour.");
  }
}

export async function updateLabour(updatedLabourData: Labour): Promise<Labour> {
  try {
    let labours = await getAllLabours();
    // Remove file fields as they are not part of the stored Labour model in KV directly
    const { photoFile, aadhaarFile, panFile, licenseFile, ...storableLabourData } = updatedLabourData;

    labours = labours.map(labour =>
      labour.id === storableLabourData.id ? storableLabourData : labour
    );
    await kv.set(LABOURS_KV_KEY, labours);
    return storableLabourData;
  } catch (error) {
    console.error("Error updating labour in KV:", error);
    throw new Error("Failed to update labour.");
  }
}

export async function deleteLabourById(labourId: string): Promise<void> {
  try {
    let labours = await getAllLabours();
    labours = labours.filter(labour => labour.id !== labourId);
    await kv.set(LABOURS_KV_KEY, labours);
  } catch (error) {
    console.error("Error deleting labour from KV:", error);
    throw new Error("Failed to delete labour.");
  }
}
