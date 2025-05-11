
"use client";

import React, { useState, useEffect, lazy, Suspense } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { PlusCircle, Loader2 } from 'lucide-react';
// import { WorkLogForm } from '@/components/work-logs/work-log-form'; // Lazy loaded
import { DataTable } from '@/components/common/data-table';
import type { WorkLog, Labour } from '@/lib/types';
import { initialWorkLogs, initialLabours } from '@/lib/data';
import { format, parseISO } from 'date-fns';
import { useToast } from "@/hooks/use-toast";
import { WORK_LOGS_STORAGE_KEY, LABOURS_STORAGE_KEY } from '@/lib/storageKeys';

const WorkLogForm = lazy(() => import('@/components/work-logs/work-log-form').then(module => ({ default: module.WorkLogForm })));

export default function WorkLogsPage() {
  const [workLogs, setWorkLogs] = useState<WorkLog[]>([]);
  const [labours, setLabours] = useState<Labour[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingWorkLog, setEditingWorkLog] = useState<WorkLog | undefined>(undefined);
  const { toast } = useToast();

  useEffect(() => {
    // Load work logs from LocalStorage
    try {
      const storedWorkLogs = localStorage.getItem(WORK_LOGS_STORAGE_KEY);
      if (storedWorkLogs) {
        setWorkLogs(JSON.parse(storedWorkLogs));
      } else {
        setWorkLogs(initialWorkLogs);
      }
    } catch (error) {
      console.error("Error loading work logs from localStorage:", error);
      setWorkLogs(initialWorkLogs);
    }

    // Load labours from LocalStorage (read-only)
    try {
      const storedLabours = localStorage.getItem(LABOURS_STORAGE_KEY);
      if (storedLabours) {
        setLabours(JSON.parse(storedLabours));
      } else {
        setLabours(initialLabours);
      }
    } catch (error) {
      console.error("Error loading labours from localStorage for work logs page:", error);
      setLabours(initialLabours);
    }

    if (typeof window !== "undefined" && window.location.hash === "#add") {
      setIsFormOpen(true);
      window.location.hash = ""; // Clear hash
    }
  }, []);

  // Save work logs to LocalStorage whenever the state changes
  useEffect(() => {
    try {
      localStorage.setItem(WORK_LOGS_STORAGE_KEY, JSON.stringify(workLogs));
    } catch (error) {
      console.error("Error saving work logs to localStorage:", error);
      toast({
        title: "Storage Error",
        description: "Could not save work log data. Your browser storage might be full or disabled.",
        variant: "destructive",
      });
    }
  }, [workLogs, toast]);

  const handleAddWorkLog = () => {
    setEditingWorkLog(undefined);
    setIsFormOpen(true);
  };

  const handleEditWorkLog = (workLog: WorkLog) => {
    setEditingWorkLog(workLog);
    setIsFormOpen(true);
  };

  const handleDeleteWorkLog = (workLogToDelete: WorkLog) => {
    setWorkLogs(prevWorkLogs => prevWorkLogs.filter(wl => wl.id !== workLogToDelete.id));
    toast({
      title: "Work Log Deleted",
      description: `Work log for ${getLabourName(workLogToDelete.labourId)} on ${format(parseISO(workLogToDelete.date), 'PPP')} has been removed.`,
      variant: "destructive",
    });
  };

  const handleFormSubmit = async (workLogData: WorkLog) => { // Renamed workLog to workLogData
    // If pictureFile exists, it means a new file was selected or an existing one was kept.
    // The WorkLogForm already handles preview generation.
    // We just need to ensure the final object saved to state has the correct picturePreview.
    // If pictureFile is undefined, it means no new file was selected, and we should keep the existing preview if editing.
    
    let finalWorkLog = { ...workLogData }; // Use workLogData

    if (workLogData.pictureFile) { // Check workLogData.pictureFile
      // A new file was selected or an existing one was re-confirmed.
      // The preview is already set by the form's handleFileChange.
      // So, workLogData.picturePreview should be up-to-date.
    } else if (editingWorkLog && !workLogData.pictureFile) {
      // No new file selected during edit, retain the old preview
      finalWorkLog.picturePreview = editingWorkLog.picturePreview;
    }
    // If it's a new entry and no pictureFile, picturePreview will be undefined, which is correct.

    saveWorkLog(finalWorkLog);
  };
  
  const saveWorkLog = (workLogToSave: WorkLog) => {
    // Remove File object before saving to state, as it's not serializable for LocalStorage
    // and preview is already handled.
    const { pictureFile, ...restOfWorkLog } = workLogToSave;
    const serializableWorkLog = { ...restOfWorkLog };


    if (editingWorkLog) {
      setWorkLogs(prevWorkLogs => prevWorkLogs.map(wl => wl.id === serializableWorkLog.id ? serializableWorkLog : wl));
      toast({ title: "Work Log Updated", description: `Work log for ${getLabourName(serializableWorkLog.labourId)} has been updated.` });
    } else {
      setWorkLogs(prevWorkLogs => [serializableWorkLog, ...prevWorkLogs]);
      toast({ title: "Work Log Added", description: `New work log for ${getLabourName(serializableWorkLog.labourId)} has been added.` });
    }
    setIsFormOpen(false);
    setEditingWorkLog(undefined);
  }
  
  const getLabourName = (labourId: string) => {
    return labours.find(l => l.id === labourId)?.name || 'Unknown Labour';
  };

  const columns = [
    { 
      accessorKey: (item: WorkLog) => getLabourName(item.labourId), 
      header: 'Labour' 
    },
    { 
      accessorKey: 'date' as keyof WorkLog, 
      header: 'Date',
      cell: (item: WorkLog) => format(parseISO(item.date), 'PPP')
    },
    { accessorKey: 'location' as keyof WorkLog, header: 'Location' },
    { accessorKey: 'workType' as keyof WorkLog, header: 'Work Type' },
    {
      accessorKey: 'picturePreview' as keyof WorkLog,
      header: 'Picture',
      cell: (item: WorkLog) => item.picturePreview ? (
        <Image src={item.picturePreview} alt="Work log proof" width={60} height={60} className="rounded object-cover" data-ai-hint="work site" />
      ) : (
        <span className="text-xs text-muted-foreground">No image</span>
      )
    }
  ];

  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-col items-start sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
        <h1 className="text-3xl font-bold text-foreground">Daily Work Logs</h1>
        <Button 
          onClick={handleAddWorkLog} 
          className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground self-stretch sm:self-auto"
        >
          <PlusCircle className="mr-2 h-5 w-5" /> Add Work Log
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={workLogs}
        onEdit={handleEditWorkLog}
        onDelete={handleDeleteWorkLog}
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
          <WorkLogForm
            isOpen={isFormOpen}
            onClose={() => {
              setIsFormOpen(false);
              setEditingWorkLog(undefined);
            }}
            onSubmit={handleFormSubmit}
            labours={labours} // Pass loaded labours
            defaultValues={editingWorkLog}
          />
        </Suspense>
      )}
    </div>
  );
}
