"use client";

import React, { useState, useEffect } from "react";
import { AttendanceEntryForm } from "@/components/attendance/AttendanceEntryForm";
import type { Laborer } from "@/types";
import { ClipboardList } from "lucide-react";

// Mock data - in a real app, fetch this from your backend
const mockLaborers: Laborer[] = [
  { id: "L001", name: "Sunil Verma", phone: "9988776655", address: "A-12, Sector 5, Noida", createdAt: "2024-01-10", profilePhotoUrl: "https://placehold.co/40x40.png?text=SV" },
  { id: "L002", name: "Anita Desai", phone: "9123456789", address: "B-34, Green Park, Delhi", createdAt: "2024-02-15", profilePhotoUrl: "https://placehold.co/40x40.png?text=AD" },
  { id: "L003", name: "Rajesh Kumar", phone: "9765432100", address: "C-56, MG Road, Gurgaon", createdAt: "2024-03-20", profilePhotoUrl: "https://placehold.co/40x40.png?text=RK" },
];


export default function AttendancePage() {
  const [laborers, setLaborers] = useState<Laborer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching laborers
    setLaborers(mockLaborers);
    setLoading(false);
  }, []);

  if (loading) {
    return <p className="text-center py-10">Loading laborers list...</p>;
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
        <h1 className="text-3xl font-bold font-headline text-primary flex items-center">
          <ClipboardList className="mr-3 h-8 w-8" />
          Daily Attendance
        </h1>
        <p className="text-muted-foreground">Record and manage daily attendance for laborers.</p>
        </div>
      </div>
      
      <AttendanceEntryForm laborers={laborers} />
      
      {/* Optionally, add a section to display past attendance records or summaries here */}
    </div>
  );
}
