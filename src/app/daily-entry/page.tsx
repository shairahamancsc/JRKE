
"use client";

import React, { useState, useEffect, lazy, Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle, UserCircle2, Loader2 } from 'lucide-react';
// import { DailyEntryForm } from '@/components/daily-entry/daily-entry-form'; // Lazy loaded
import type { BulkDailyLogEntriesFormData } from '@/components/daily-entry/daily-entry-form';
import { DataTable } from '@/components/common/data-table';
import type { DailyLogEntry, Laborer } from '@/lib/types';
import { initialDailyLogEntries, initialLaborers } from '@/lib/data';
import { format, parseISO } from 'date-fns';
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { DAILY_ENTRIES_STORAGE_KEY, LABORERS_STORAGE_KEY } from '@/lib/storageKeys';

const DailyEntryForm = lazy(() => import('@/components/daily-entry/daily-entry-form').then(module => ({ default: module.DailyEntryForm })));

export default function DailyEntryPage() {
  const [dailyEntries, setDailyEntries] = useState<DailyLogEntry[]>([]);
  const [laborers, setLaborers] = useState<Laborer[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Load daily entries from LocalStorage
    try {
      const storedDailyEntries = localStorage.getItem(DAILY_ENTRIES_STORAGE_KEY);
      if (storedDailyEntries) {
        setDailyEntries(JSON.parse(storedDailyEntries));
      } else {
        setDailyEntries(initialDailyLogEntries); // Usually empty, but for consistency
      }
    } catch (error) {
      console.error("Error loading daily entries from localStorage:", error);
      setDailyEntries(initialDailyLogEntries);
    }

    // Load laborers from LocalStorage (read-only)
    try {
      const storedLaborers = localStorage.getItem(LABORERS_STORAGE_KEY);
      if (storedLaborers) {
        setLaborers(JSON.parse(storedLaborers));
      } else {
        setLaborers(initialLaborers);
      }
    } catch (error) {
      console.error("Error loading laborers from localStorage for daily entry page:", error);
      setLaborers(initialLaborers);
    }
    
    if (typeof window !== "undefined" && window.location.hash === "#add") {
      setIsFormOpen(true);
      window.location.hash = ""; 
    }
  }, []);

  // Save daily entries to LocalStorage whenever the state changes
  useEffect(() => {
    try {
      localStorage.setItem(DAILY_ENTRIES_STORAGE_KEY, JSON.stringify(dailyEntries));
    } catch (error) {
      console.error("Error saving daily entries to localStorage:", error);
      toast({
        title: "Storage Error",
        description: "Could not save daily log data. Your browser storage might be full or disabled.",
        variant: "destructive",
      });
    }
  }, [dailyEntries, toast]);

  const handleAddEntry = () => {
    if (laborers.length === 0) {
      toast({
        title: "No Laborers Found",
        description: "Please add laborers first before making daily entries.",
        variant: "destructive",
      });
      return;
    }
    setIsFormOpen(true);
  };

  const handleDeleteEntry = (entryToDelete: DailyLogEntry) => {
    setDailyEntries(currentEntries => currentEntries.filter(e => e.id !== entryToDelete.id));
    const laborerName = getLaborerInfo(entryToDelete.laborerId).name;
    toast({
      title: "Daily Log Deleted",
      description: `Log for ${laborerName} on ${format(parseISO(entryToDelete.date), 'PPP')} has been removed.`,
      variant: "destructive",
    });
  };

  const handleFormSubmit = (formData: BulkDailyLogEntriesFormData) => {
    const newEntries: DailyLogEntry[] = formData.entries.map(entryData => {
      const laborerInfo = getLaborerInfo(entryData.laborerId);
      return {
        id: crypto.randomUUID(),
        laborerId: entryData.laborerId,
        date: formData.date.toISOString(),
        attendanceStatus: entryData.attendanceStatus,
        advanceAmount: entryData.advanceAmount ? Number(entryData.advanceAmount) : undefined,
        workLocation: entryData.attendanceStatus === 'present' ? entryData.workLocation : undefined,
        laborerName: laborerInfo.name, // Storing for easier display in table
        laborerPhotoPreview: laborerInfo.photoPreview, // Storing for easier display
      };
    });

    setDailyEntries(currentEntries => [...newEntries, ...currentEntries].sort((a, b) => parseISO(b.date).getTime() - parseISO(a.date).getTime() || (a.laborerName || "").localeCompare(b.laborerName || "")));
    toast({ 
      title: "Daily Logs Added", 
      description: `${newEntries.length} log(s) for ${format(formData.date, 'PPP')} have been recorded.` 
    });
    setIsFormOpen(false);
  };
  
  const getLaborerInfo = (laborerId: string) => {
    const laborer = laborers.find(l => l.id === laborerId);
    return { 
      name: laborer?.name || 'Unknown Laborer', 
      photoPreview: laborer?.photoPreview 
    };
  };

  const columns = [
    { 
      accessorKey: (item: DailyLogEntry) => {
        // Use stored name/photo if available, otherwise lookup (though it should be stored by handleFormSubmit)
        const name = item.laborerName || getLaborerInfo(item.laborerId).name;
        const photoPreview = item.laborerPhotoPreview || getLaborerInfo(item.laborerId).photoPreview;
        return (
          <div className="flex items-center gap-2">
            <Avatar className="h-10 w-10">
              <AvatarImage src={photoPreview} alt={name} data-ai-hint="person" />
              <AvatarFallback>
                <UserCircle2 className="h-6 w-6 text-muted-foreground" />
              </AvatarFallback>
            </Avatar>
            <span>{name}</span>
          </div>
        );
      }, 
      header: 'Laborer' 
    },
    { 
      accessorKey: 'date' as keyof DailyLogEntry, 
      header: 'Date',
      cell: (item: DailyLogEntry) => format(parseISO(item.date), 'PPP')
    },
    {
      accessorKey: 'attendanceStatus' as keyof DailyLogEntry,
      header: 'Attendance',
      cell: (item: DailyLogEntry) => (
        <Badge variant={item.attendanceStatus === 'present' ? 'default' : 'secondary'}
               className={item.attendanceStatus === 'present' ? 
                            'bg-green-500/20 text-green-700 border-green-500/30 hover:bg-green-500/30 dark:bg-green-700/30 dark:text-green-300 dark:border-green-700/40 dark:hover:bg-green-700/40' : 
                            'bg-red-500/20 text-red-700 border-red-500/30 hover:bg-red-500/30 dark:bg-red-700/30 dark:text-red-300 dark:border-red-700/40 dark:hover:bg-red-700/40'}
        >
          {item.attendanceStatus.charAt(0).toUpperCase() + item.attendanceStatus.slice(1)}
        </Badge>
      )
    },
    { 
      accessorKey: 'advanceAmount' as keyof DailyLogEntry, 
      header: 'Advance (₹)',
      cell: (item: DailyLogEntry) => item.advanceAmount ? `₹${item.advanceAmount.toFixed(2)}` : '-'
    },
    { accessorKey: 'workLocation' as keyof DailyLogEntry, header: 'Work Location',
      cell: (item: DailyLogEntry) => item.workLocation || '-'
    },
  ];

  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-col items-start sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
        <h1 className="text-3xl font-bold text-foreground">Daily Labor Entries</h1>
        <Button 
          onClick={handleAddEntry} 
          className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground self-stretch sm:self-auto"
          disabled={laborers.length === 0}
        >
          <PlusCircle className="mr-2 h-5 w-5" /> Add Daily Logs
        </Button>
      </div>
      {laborers.length === 0 && (
        <p className="text-muted-foreground mb-4">Please add laborers in the 'Laborers' section to make daily entries.</p>
      )}

      <DataTable
        columns={columns}
        data={dailyEntries}
        onDelete={handleDeleteEntry}
      />

      {isFormOpen && (
        <Suspense fallback={
          <div className="fixed inset-0 bg-background/30 backdrop-blur-sm flex items-center justify-center z-[60]">
            <div className="bg-card p-6 rounded-lg shadow-xl flex items-center space-x-2">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              <span>Loading Form...</span>
            </div>
          </div>
        }>
          <DailyEntryForm
            isOpen={isFormOpen}
            onClose={() => {
              setIsFormOpen(false);
            }}
            onSubmit={handleFormSubmit}
            laborers={laborers} // Pass loaded laborers
          />
        </Suspense>
      )}
    </div>
  );
}
