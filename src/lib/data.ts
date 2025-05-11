
import type { Labour, AdvancePayment, WorkLog, DailyLogEntry } from './types';

export const initialLabours: Labour[] = [
  { 
    id: '1', 
    name: 'John Doe', 
    details: 'Skilled Carpenter, 5 years experience', 
    photoPreview: 'https://picsum.photos/seed/labourer1/100/100',
    phoneNo: '9876543210',
    emergencyPhoneNo: '8765432109',
    aadhaarNo: '123456789012',
    panNo: 'ABCDE1234F',
    aadhaarPreview: 'https://picsum.photos/seed/aadhaar1/200/120',
    panPreview: 'https://picsum.photos/seed/pan1/200/120',
    licensePreview: undefined,
  },
  { 
    id: '2', 
    name: 'Jane Smith', 
    details: 'General Labourer, reliable', 
    photoPreview: 'https://picsum.photos/seed/labourer2/100/100',
    phoneNo: '9988776655',
    emergencyPhoneNo: undefined,
    aadhaarNo: '234567890123',
    panNo: undefined,
    aadhaarPreview: 'https://picsum.photos/seed/aadhaar2/200/120',
    panPreview: undefined,
    licensePreview: 'https://picsum.photos/seed/license2/200/120',
  },
  { 
    id: '3', 
    name: 'Mike Johnson', 
    details: 'Electrician, licensed', 
    photoPreview: 'https://picsum.photos/seed/labourer3/100/100',
    phoneNo: undefined,
    emergencyPhoneNo: '7654321098',
    aadhaarNo: undefined,
    panNo: 'FGHIJ5678K',
    aadhaarPreview: undefined,
    panPreview: 'https://picsum.photos/seed/pan3/200/120',
    licensePreview: undefined,
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
    picturePreview: 'https://picsum.photos/seed/picsum1/100/100'
  },
  { 
    id: 'wl2', 
    labourId: '2', 
    date: new Date().toISOString(), 
    location: 'Site B, Foundation', 
    workType: 'Concrete Pouring Support',
    picturePreview: 'https://picsum.photos/seed/picsum2/100/100'
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
