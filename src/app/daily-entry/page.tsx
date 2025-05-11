
"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle, UserCircle2 } from 'lucide-react';
import { DailyEntryForm } from '@/components/daily-entry/daily-entry-form';
import { DataTable } from '@/components/common/data-table';
import type { DailyLogEntry, Laborer } from '@/lib/types';
import { initialDailyLogEntries, initialLaborers } from '@/lib/data';
import { format, parseISO } from 'date-fns';
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export default function DailyEntryPage() {
  const [dailyEntries, setDailyEntries] = useState<DailyLogEntry[]>([]);
  const [laborers, setLaborers] = useState<Laborer[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<DailyLogEntry | undefined>(undefined);
  const { toast } = useToast();

  useEffect(() => {
    setDailyEntries(initialDailyLogEntries);
    setLaborers(initialLaborers);
     if (typeof window !== "undefined" && window.location.hash === "#add") {
      setIsFormOpen(true);
      window.location.hash = ""; 
    }
  }, []);

  const handleAddEntry = () => {
    setEditingEntry(undefined);
    setIsFormOpen(true);
  };

  const handleEditEntry = (entry: DailyLogEntry) => {
    setEditingEntry(entry);
    setIsFormOpen(true);
  };

  const handleDeleteEntry = (entryToDelete: DailyLogEntry) => {
    setDailyEntries(dailyEntries.filter(e => e.id !== entryToDelete.id));
    const laborerName = getLaborerInfo(entryToDelete.laborerId).name;
    toast({
      title: "Daily Log Deleted",
      description: `Log for ${laborerName} on ${format(parseISO(entryToDelete.date), 'PPP')} has been removed.`,
      variant: "destructive",
    });
  };

  const handleFormSubmit = (entry: DailyLogEntry) => {
    if (editingEntry) {
      setDailyEntries(dailyEntries.map(e => e.id === entry.id ? entry : e));
      toast({ title: "Daily Log Updated", description: `Log for ${getLaborerInfo(entry.laborerId).name} has been updated.` });
    } else {
      // Add laborer name and photo to the entry for immediate display if not already present from form
      const laborerInfo = getLaborerInfo(entry.laborerId);
      const newEntry = {
        ...entry,
        laborerName: laborerInfo.name,
        laborerPhotoPreview: laborerInfo.photoPreview,
      };
      setDailyEntries([newEntry, ...dailyEntries]);
      toast({ title: "Daily Log Added", description: `New log for ${laborerInfo.name} has been recorded.` });
    }
    setIsFormOpen(false);
    setEditingEntry(undefined);
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
        const { name, photoPreview } = getLaborerInfo(item.laborerId);
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
               className={item.attendanceStatus === 'present' ? 'bg-green-500/20 text-green-700 border-green-500/30 hover:bg-green-500/30' : 'bg-red-500/20 text-red-700 border-red-500/30 hover:bg-red-500/30'}
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
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-foreground">Daily Labor Entries</h1>
        <Button onClick={handleAddEntry} className="bg-primary hover:bg-primary/90 text-primary-foreground">
          <PlusCircle className="mr-2 h-5 w-5" /> Add Daily Log
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={dailyEntries}
        onEdit={handleEditEntry}
        onDelete={handleDeleteEntry}
      />

      <DailyEntryForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingEntry(undefined);
        }}
        onSubmit={handleFormSubmit}
        laborers={laborers}
        defaultValues={editingEntry}
      />
    </div>
  );
}
