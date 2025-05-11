
export interface Laborer {
  id: string;
  name: string;
  details: string; // e.g., contact, trade, skill level
  photoPreview?: string; // Base64 or URL for preview
  photoFile?: File; // To hold the actual file for upload

  phoneNo?: string;
  emergencyPhoneNo?: string;

  aadhaarNo?: string;
  panNo?: string;

  aadhaarFile?: File;
  aadhaarPreview?: string; // Base64 or URL for preview

  panFile?: File;
  panPreview?: string; // Base64 or URL for preview

  licenseFile?: File;
  licensePreview?: string; // Base64 or URL for preview
}

export interface AdvancePayment {
  id: string;
  laborerId: string;
  date: string; // ISO string format for dates
  amount: number;
}

export interface WorkLog {
  id:string;
  laborerId: string;
  date: string; // ISO string format
  location: string;
  workType: string;
  picturePreview?: string; // Base64 or URL for preview
  pictureFile?: File; // To hold the actual file for upload
}

export interface DailyLogEntry {
  id: string;
  laborerId: string;
  date: string; // ISO string format
  attendanceStatus: 'present' | 'absent';
  advanceAmount?: number;
  workLocation?: string;
  // For convenience when displaying, not strictly part of the stored data model if derived
  laborerName?: string; 
  laborerPhotoPreview?: string;
}
