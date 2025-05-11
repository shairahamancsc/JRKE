
"use client";

import React, { useState, useEffect, lazy, Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle, UserCircle2, Loader2 } from 'lucide-react';
import type { BulkDailyLogEntriesFormData } from '@/components/daily-entry/daily-entry-form';
import { DataTable } from '@/components/common/data-table';
import type { DailyLogEntry, Labour, PaymentMethod } from '@/lib/types';
import { initialDailyLogEntries, initialLabours } from '@/lib/data';
import { format, parseISO } from 'date-fns';
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { DAILY_ENTRIES_STORAGE_KEY, LABOURS_STORAGE_KEY } from '@/lib/storageKeys';
import useDebouncedLocalStorage from '@/hooks/useDebouncedLocalStorage';

const DailyEntryForm = lazy(() => import('@/components/daily-entry/daily-entry-form').then(module => ({ default: module.DailyEntryForm })));

const paymentMethodLabels: Record<PaymentMethod, string> = {
  cash: 'Cash',
  phonepe: 'PhonePe',
  account: 'Account Pay',
};

export default function DailyEntryPage() {
  const [dailyEntries, setDailyEntries] = useDebouncedLocalStorage<DailyLogEntry[]>(
    DAILY_ENTRIES_STORAGE_KEY,
    initialDailyLogEntries
  );
  const [labours, setLabours] = useState<Labour[]>([]); // Labours are read, not managed by this page's debounced hook
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Load labours from localStorage
    try {
      const storedLabours = localStorage.getItem(LABOURS_STORAGE_KEY);
      if (storedLabours) {
        setLabours(JSON.parse(storedLabours));
      } else {
        localStorage.setItem(LABOURS_STORAGE_KEY, JSON.stringify(initialLabours));
        setLabours(initialLabours);
      }
    } catch (error) {
      console.error("Error loading labours from localStorage for daily entry page:", error);
      localStorage.setItem(LABOURS_STORAGE_KEY, JSON.stringify(initialLabours));
      setLabours(initialLabours);
    }
    
    if (typeof window !== "undefined" && window.location.hash === "#add") {
      setIsFormOpen(true);
      window.location.hash = ""; 
    }
  }, []);

  const handleAddEntry = () => {
    if (labours.length === 0) {
      toast({
        title: "No Labours Found",
        description: "Please add labours first before making daily entries.",
        variant: "destructive",
      });
      return;
    }
    setIsFormOpen(true);
  };

  const handleDeleteEntry = (entryToDelete: DailyLogEntry) => {
    setDailyEntries(currentEntries => currentEntries.filter(e => e.id !== entryToDelete.id));
    const labourName = getLabourInfo(entryToDelete.labourId).name;
    toast({
      title: "Daily Log Deleted",
      description: `Log for ${labourName} on ${format(parseISO(entryToDelete.date), 'PPP')} has been removed.`,
      variant: "destructive",
    });
  };

  const handleFormSubmit = (formData: BulkDailyLogEntriesFormData) => {
    const newEntries: DailyLogEntry[] = formData.entries.map(entryData => {
      const labourInfo = getLabourInfo(entryData.labourId);
      const advanceAmount = entryData.advanceAmount ? Number(entryData.advanceAmount) : undefined;
      return {
        id: crypto.randomUUID(),
        labourId: entryData.labourId,
        date: formData.date.toISOString(),
        attendanceStatus: entryData.attendanceStatus,
        advanceAmount: advanceAmount,
        advancePaymentMethod: advanceAmount && advanceAmount > 0 ? entryData.advancePaymentMethod : undefined,
        advanceRemarks: advanceAmount && advanceAmount > 0 ? entryData.advanceRemarks : undefined,
        workLocation: entryData.attendanceStatus === 'present' ? formData.workLocation : undefined,
        labourName: labourInfo.name, 
        labourPhotoPreview: labourInfo.photoPreview, 
      };
    });

    setDailyEntries(currentEntries => [...newEntries, ...currentEntries].sort((a, b) => parseISO(b.date).getTime() - parseISO(a.date).getTime() || (a.labourName || "").localeCompare(b.labourName || "")));
    toast({ 
      title: "Daily Logs Added", 
      description: `${newEntries.length} log(s) for ${format(formData.date, 'PPP')} have been recorded.` 
    });
    setIsFormOpen(false);
  };
  
  const getLabourInfo = (labourId: string) => {
    const labour = labours.find(l => l.id === labourId);
    return { 
      name: labour?.name || 'Unknown Labour', 
      photoPreview: labour?.photoPreview 
    };
  };

  const columns = React.useMemo(() => [
    { 
      accessorKey: (item: DailyLogEntry) => {
        const name = item.labourName || getLabourInfo(item.labourId).name;
        const photoPreview = item.labourPhotoPreview || getLabourInfo(item.labourId).photoPreview;
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
      header: 'Labour' 
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
    {
      accessorKey: 'advancePaymentMethod' as keyof DailyLogEntry,
      header: 'Adv. Method',
      cell: (item: DailyLogEntry) => item.advancePaymentMethod ? (
        <Badge variant="outline" className="whitespace-nowrap">
          {paymentMethodLabels[item.advancePaymentMethod] || item.advancePaymentMethod}
        </Badge>
      ) : '-'
    },
    { 
      accessorKey: 'advanceRemarks' as keyof DailyLogEntry, 
      header: 'Adv. Remarks',
      cell: (item: DailyLogEntry) => item.advanceRemarks || '-'
    },
    { accessorKey: 'workLocation' as keyof DailyLogEntry, header: 'Work Location',
      cell: (item: DailyLogEntry) => item.workLocation || '-'
    },
  // eslint-disable-next-line react-hooks/exhaustive-deps
  ], [labours]); // Dependency on labours as getLabourInfo uses it

  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-col items-start sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
        <h1 className="text-3xl font-bold text-foreground">Daily Labour Entries</h1>
        <Button 
          onClick={handleAddEntry} 
          className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground self-stretch sm:self-auto"
          disabled={labours.length === 0}
        >
          <PlusCircle className="mr-2 h-5 w-5" /> Add Daily Logs
        </Button>
      </div>
      {labours.length === 0 && (
        <p className="text-muted-foreground mb-4">Please add labours in the 'Labours' section to make daily entries.</p>
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
            labours={labours} 
          />
        </Suspense>
      )}
    </div>
  );
}
