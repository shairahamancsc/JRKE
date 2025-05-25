
import type { Labour, AdvancePayment, WorkLog, DailyLogEntry, ProprietorDocument, ProprietorDocumentTypeValue } from './types';
import { proprietorDocumentTypes } from './types';


export const initialLabours: Labour[] = [
  // Data is now initialized as empty. Sample data removed to prevent "reset" on new devices.
  // {
  //   id: '1',
  //   name: 'John Doe',
  //   details: 'Skilled Carpenter, 5 years experience',
  //   photoUrl: 'https://placehold.co/100x100.png',
  //   phoneNo: '9876543210',
  //   emergencyPhoneNo: '8765432109',
  //   aadhaarNo: '123456789012',
  //   panNo: 'ABCDE1234F',
  //   aadhaarPreview: 'https://placehold.co/200x120.png',
  //   panPreview: 'https://placehold.co/200x120.png',
  //   licensePreview: undefined,
  //   salaryRate: 700,
  // },
];

export const initialAdvancePayments: AdvancePayment[] = [
  // Data is now initialized as empty.
  // { id: 'adv1', labourId: '1', date: new Date(2023, 0, 15).toISOString(), amount: 200, paymentMethod: 'cash', remarks: 'Urgent medical need' },
  // { id: 'adv2', labourId: '2', date: new Date(2023, 0, 20).toISOString(), amount: 150, paymentMethod: 'phonepe', remarks: 'Family emergency' },
];

export const initialWorkLogs: WorkLog[] = [
  // Data is now initialized as empty.
  // {
  //   id: 'wl1',
  //   labourId: '1',
  //   date: new Date().toISOString(),
  //   location: 'Site A, Building 1',
  //   workType: 'Framing',
  //   picturePreview: 'https://placehold.co/100x100.png'
  // },
];

export const initialDailyLogEntries: DailyLogEntry[] = [
  // This was already empty, which is correct.
];

export const initialProprietorDocuments: ProprietorDocument[] = [
  // This was already empty, which is correct.
];

// Exporting the const array directly
export const proprietorDocumentTypesList: { value: ProprietorDocumentTypeValue; label: string }[] = proprietorDocumentTypes.map(dt => ({...dt}));

