
import type { Laborer, AdvancePayment, WorkLog, DailyLogEntry } from './types';

export const initialLaborers: Laborer[] = [
  { 
    id: '1', 
    name: 'John Doe', 
    details: 'Skilled Carpenter, 5 years experience', 
    photoPreview: 'https://picsum.photos/seed/laborer1/100/100',
    aadhaarNo: '123456789012',
    panNo: 'ABCDE1234F',
    aadhaarPreview: 'https://picsum.photos/seed/aadhaar1/200/120',
    panPreview: 'https://picsum.photos/seed/pan1/200/120',
    licensePreview: undefined,
  },
  { 
    id: '2', 
    name: 'Jane Smith', 
    details: 'General Laborer, reliable', 
    photoPreview: 'https://picsum.photos/seed/laborer2/100/100',
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
    photoPreview: 'https://picsum.photos/seed/laborer3/100/100',
    aadhaarNo: undefined,
    panNo: 'FGHIJ5678K',
    aadhaarPreview: undefined,
    panPreview: 'https://picsum.photos/seed/pan3/200/120',
    licensePreview: undefined,
  },
];

export const initialAdvancePayments: AdvancePayment[] = [
  { id: 'adv1', laborerId: '1', date: new Date(2023, 0, 15).toISOString(), amount: 200 },
  { id: 'adv2', laborerId: '2', date: new Date(2023, 0, 20).toISOString(), amount: 150 },
];

export const initialWorkLogs: WorkLog[] = [
  { 
    id: 'wl1', 
    laborerId: '1', 
    date: new Date().toISOString(), 
    location: 'Site A, Building 1', 
    workType: 'Framing',
    picturePreview: 'https://picsum.photos/seed/picsum1/100/100'
  },
  { 
    id: 'wl2', 
    laborerId: '2', 
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
  //   laborerId: '1',
  //   date: new Date().toISOString(),
  //   attendanceStatus: 'present',
  //   advanceAmount: 50,
  //   workLocation: 'Main Courtyard, Phase 2',
  // },
];
