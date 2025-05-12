

export interface Labour {
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
  picturePreview?: string; // Base64 or URL for preview
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
  labourPhotoPreview?: string;
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
  documentName: string; // User-provided name for the document, e.g., "Office Lease Agreement" if type is "Other"
  fileName: string;
  fileDataUrl: string; // Store file as data URI for easy download
  uploadedAt: string; // ISO date string
  fileType?: string; // MIME type of the file
}
