
export interface Labour {
  id: string;
  name: string;
  details: string; // e.g., contact, trade, skill level
  photoUrl?: string; // URL from Vercel Blob
  photoFile?: File; // To hold the actual file for upload in forms

  phoneNo?: string;
  emergencyPhoneNo?: string;

  aadhaarNo?: string;
  panNo?: string;

  aadhaarFile?: File;
  aadhaarPreview?: string; // Base64 or URL for preview (consider moving to Blob URL too)

  panFile?: File;
  panPreview?: string; // Base64 or URL for preview (consider moving to Blob URL too)

  licenseFile?: File;
  licensePreview?: string; // Base64 or URL for preview (consider moving to Blob URL too)

  salaryRate?: number; // New field for daily salary rate
}

export type PaymentMethod = 'phonepe' | 'account' | 'cash';

export interface AdvancePayment {
  id: string;
  labourId: string;
  date: string; // ISO string format for dates
  amount: number;
  paymentMethod?: PaymentMethod;
  remarks?: string;
}

export interface WorkLog {
  id:string;
  labourId: string;
  date: string; // ISO string format
  location: string;
  workType: string;
  picturePreview?: string; // Base64 or URL for preview (consider moving to Blob URL too)
  pictureFile?: File; // To hold the actual file for upload
}

export interface DailyLogEntry {
  id: string;
  labourId: string;
  date: string; // ISO string format
  attendanceStatus: 'present' | 'absent';
  advanceAmount?: number;
  advancePaymentMethod?: PaymentMethod;
  advanceRemarks?: string;
  workLocation?: string;
  // For convenience when displaying, not strictly part of the stored data model if derived
  labourName?: string;
  labourPhotoPreview?: string; // This would ideally become labourPhotoUrl if consistent
}

// Added Supervisor type
export interface Supervisor {
  id: string;
  username: string;
  // WARNING: Storing passwords directly is insecure. Use hashing in production.
  password: string;
}

// Document types for proprietor
export const proprietorDocumentTypes = [
  { value: 'gst_certificate', label: 'GST Certificate' },
  { value: 'aadhaar_card_proprietor', label: 'Aadhaar Card (Proprietor)' },
  { value: 'pan_card_proprietor', label: 'PAN Card (Proprietor)' },
  { value: 'business_registration', label: 'Business Registration' },
  { value: 'company_pan_card', label: 'PAN Card (Company)' },
  { value: 'bank_statement_company', label: 'Bank Statement (Company)' },
  { value: 'other', label: 'Other Document' },
] as const;

export type ProprietorDocumentTypeValue = typeof proprietorDocumentTypes[number]['value'];

export interface ProprietorDocument {
  id: string;
  documentType: ProprietorDocumentTypeValue;
  documentName: string;
  fileName: string;
  blobUrl: string; // Changed from fileDataUrl
  uploadedAt: string; // ISO date string
  fileType?: string; // MIME type of the file
  // fileDataUrl is removed, file content is now in Vercel Blob referenced by blobUrl
}

// Renamed PayrollRow to PaymentRow
export interface PaymentRow {
  id: string;
  labourName: string;
  salaryRate: number;
  presentDays: number;
  grossSalary: number;
  totalAdvances: number;
  netPayable: number;
}
