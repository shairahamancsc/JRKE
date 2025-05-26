
"use server";

import { kv } from '@vercel/kv';
import type { Labour } from './types';

const LABOURS_KV_KEY = 'jrk_labours';

export async function getAllLabours(): Promise<Labour[]> {
  try {
    const labours = await kv.get<Labour[]>(LABOURS_KV_KEY);
    return labours || [];
  } catch (error) {
    console.error("Error fetching labours from KV:", error);
    // In a production app, you might want to throw the error or return a more specific error object.
    return [];
  }
}

export async function addLabour(
  labourDataFromClient: Omit<Labour, 'id'> // Type received from client might include File objects
): Promise<Labour> {
  try {
    const labours = await getAllLabours();

    // Destructure and explicitly exclude File objects.
    // Only store serializable data (like photoUrl, aadhaarPreview, etc.) in KV.
    const {
      photoFile,      // Exclude
      aadhaarFile,    // Exclude
      panFile,        // Exclude
      licenseFile,    // Exclude
      ...storableClientData // This contains photoUrl, aadhaarPreview etc. if they were set
    } = labourDataFromClient;

    const newLabourForKV: Labour = {
      ...storableClientData, // Spread the serializable fields
      id: crypto.randomUUID(),
      // Ensure all fields of Labour type are defined, even if undefined from client
      name: storableClientData.name,
      details: storableClientData.details,
      photoUrl: storableClientData.photoUrl,
      phoneNo: storableClientData.phoneNo,
      emergencyPhoneNo: storableClientData.emergencyPhoneNo,
      aadhaarNo: storableClientData.aadhaarNo,
      panNo: storableClientData.panNo,
      aadhaarPreview: storableClientData.aadhaarPreview,
      panPreview: storableClientData.panPreview,
      licensePreview: storableClientData.licensePreview,
      salaryRate: storableClientData.salaryRate,
    };

    const updatedLabours = [...labours, newLabourForKV];
    await kv.set(LABOURS_KV_KEY, updatedLabours);
    return newLabourForKV; // Return the data as it was stored in KV
  } catch (error) {
    console.error("Error adding labour to KV:", error);
    throw new Error("Failed to add labour.");
  }
}

export async function updateLabour(
  updatedLabourDataFromClient: Labour // Type received from client might include File objects
): Promise<Labour> {
  try {
    let labours = await getAllLabours();

    // Destructure and explicitly exclude File objects.
    const {
      photoFile,      // Exclude
      aadhaarFile,    // Exclude
      panFile,        // Exclude
      licenseFile,    // Exclude
      ...storableClientData
    } = updatedLabourDataFromClient;
    
    // Ensure all fields of Labour type are defined for the update
    const updatedLabourForKV: Labour = {
        id: storableClientData.id, // id must be present for update
        name: storableClientData.name,
        details: storableClientData.details,
        photoUrl: storableClientData.photoUrl,
        phoneNo: storableClientData.phoneNo,
        emergencyPhoneNo: storableClientData.emergencyPhoneNo,
        aadhaarNo: storableClientData.aadhaarNo,
        panNo: storableClientData.panNo,
        aadhaarPreview: storableClientData.aadhaarPreview,
        panPreview: storableClientData.panPreview,
        licensePreview: storableClientData.licensePreview,
        salaryRate: storableClientData.salaryRate,
    };


    labours = labours.map(labour =>
      labour.id === updatedLabourForKV.id ? updatedLabourForKV : labour
    );
    await kv.set(LABOURS_KV_KEY, labours);
    return updatedLabourForKV; // Return the data as it was stored in KV
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
