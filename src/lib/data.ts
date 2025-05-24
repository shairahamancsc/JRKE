
import type { Labour, AdvancePayment, WorkLog, DailyLogEntry, ProprietorDocument, ProprietorDocumentTypeValue } from './types';
import { proprietorDocumentTypes } from './types';


export const initialLabours: Labour[] = [
  { 
    id: '1', 
    name: 'John Doe', 
    details: 'Skilled Carpenter, 5 years experience', 
    photoUrl: 'https://placehold.co/100x100.png', // Changed from photoPreview
    phoneNo: '9876543210',
    emergencyPhoneNo: '8765432109',
    aadhaarNo: '123456789012',
    panNo: 'ABCDE1234F',
    aadhaarPreview: 'https://placehold.co/200x120.png',
    panPreview: 'https://placehold.co/200x120.png',
    licensePreview: undefined,
    salaryRate: 700, 
  },
  { 
    id: '2', 
    name: 'Jane Smith', 
    details: 'General Labourer, reliable', 
    photoUrl: 'https://placehold.co/100x100.png', // Changed from photoPreview
    phoneNo: '9988776655',
    emergencyPhoneNo: undefined,
    aadhaarNo: '234567890123',
    panNo: undefined,
    aadhaarPreview: 'https://placehold.co/200x120.png',
    panPreview: undefined,
    licensePreview: 'https://placehold.co/200x120.png',
    salaryRate: 550, 
  },
  { 
    id: '3', 
    name: 'Mike Johnson', 
    details: 'Electrician, licensed', 
    photoUrl: 'https://placehold.co/100x100.png', // Changed from photoPreview
    phoneNo: undefined,
    emergencyPhoneNo: '7654321098',
    aadhaarNo: undefined,
    panNo: 'FGHIJ5678K',
    aadhaarPreview: undefined,
    panPreview: 'https://placehold.co/200x120.png',
    licensePreview: undefined,
    salaryRate: 800, 
  },
];

export const initialAdvancePayments: AdvancePayment[] = [
  { id: 'adv1', labourId: '1', date: new Date(2023, 0, 15).toISOString(), amount: 200, paymentMethod: 'cash', remarks: 'Urgent medical need' },
  { id: 'adv2', labourId: '2', date: new Date(2023, 0, 20).toISOString(), amount: 150, paymentMethod: 'phonepe', remarks: 'Family emergency' },
];

export const initialWorkLogs: WorkLog[] = [
  { 
    id: 'wl1', 
    labourId: '1', 
    date: new Date().toISOString(), 
    location: 'Site A, Building 1', 
    workType: 'Framing',
    picturePreview: 'https://placehold.co/100x100.png'
  },
  { 
    id: 'wl2', 
    labourId: '2', 
    date: new Date().toISOString(), 
    location: 'Site B, Foundation', 
    workType: 'Concrete Pouring Support',
    picturePreview: 'https://placehold.co/100x100.png'
  },
];

export const initialDailyLogEntries: DailyLogEntry[] = [
  // Example Entry:
  // {
  //   id: 'dle1',
  //   labourId: '1',
  //   date: new Date().toISOString(),
  //   attendanceStatus: 'present',
  //   advanceAmount: 50,
  //   advancePaymentMethod: 'cash',
  //   advanceRemarks: 'For lunch',
  //   workLocation: 'Main Courtyard, Phase 2',
  // },
];

export const initialProprietorDocuments: ProprietorDocument[] = [
  // Example:
  // {
  //   id: 'doc1',
  //   documentType: 'gst_certificate',
  //   documentName: 'Company GST Reg 2023',
  //   fileName: 'gst_cert_2023.pdf',
  //   fileDataUrl: 'data:application/pdf;base64,...', // Example data URI
  //   uploadedAt: new Date().toISOString(),
  //   fileType: 'application/pdf',
  // }
];

// Exporting the const array directly
export const proprietorDocumentTypesList: { value: ProprietorDocumentTypeValue; label: string }[] = proprietorDocumentTypes.map(dt => ({...dt}));
