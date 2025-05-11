
export interface Laborer {
  id: string;
  name: string;
  details: string; // e.g., contact, trade, skill level
  photoPreview?: string; // Base64 or URL for preview
  photoFile?: File; // To hold the actual file for upload
}

export interface AdvancePayment {
  id: string;
  laborerId: string;
  date: string; // ISO string format for dates
  amount: number;
}

export interface WorkLog {
  id: string;
  laborerId: string;
  date: string; // ISO string format
  location: string;
  workType: string;
  picturePreview?: string; // Base64 or URL for preview
  pictureFile?: File; // To hold the actual file for upload
}
