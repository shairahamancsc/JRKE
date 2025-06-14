export interface Supervisor {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface Laborer {
  id: string;
  name: string;
  phone: string;
  address: string;
  profilePhotoUrl?: string;
  documentUrls?: string[];
  createdAt: string;
  // The form data might include File objects which are not part of stored Laborer data
  profilePhoto?: File; 
  documents?: File;
}

export interface AttendanceRecord {
  id: string;
  laborerId: string;
  laborerName: string; // For display convenience
  date: string;
  status: 'present' | 'absent' | 'leave';
}

export interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
  disabled?: boolean;
}
