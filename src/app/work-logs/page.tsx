
"use client";

import React, { useState, useEffect, lazy, Suspense } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { PlusCircle, Loader2 } from 'lucide-react';
// import { WorkLogForm } from '@/components/work-logs/work-log-form'; // Lazy loaded
import { DataTable } from '@/components/common/data-table';
import type { WorkLog, Laborer } from '@/lib/types';
import { initialWorkLogs, initialLaborers } from '@/lib/data';
import { format, parseISO } from 'date-fns';
import { useToast } from "@/hooks/use-toast";

const WorkLogForm = lazy(() => import('@/components/work-logs/work-log-form').then(module => ({ default: module.WorkLogForm })));

export default function WorkLogsPage() {
  const [workLogs, setWorkLogs] = useState<WorkLog[]>([]);
  const [laborers, setLaborers] = useState<Laborer[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingWorkLog, setEditingWorkLog] = useState<WorkLog | undefined>(undefined);
  const { toast } = useToast();

  useEffect(() => {
    setWorkLogs(initialWorkLogs);
    setLaborers(initialLaborers);
     if (typeof window !== "undefined" && window.location.hash === "#add") {
      setIsFormOpen(true);
      window.location.hash = ""; // Clear hash
    }
  }, []);

  const handleAddWorkLog = () => {
    setEditingWorkLog(undefined);
    setIsFormOpen(true);
  };

  const handleEditWorkLog = (workLog: WorkLog) => {
    setEditingWorkLog(workLog);
    setIsFormOpen(true);
  };

  const handleDeleteWorkLog = (workLogToDelete: WorkLog) => {
    setWorkLogs(workLogs.filter(wl => wl.id !== workLogToDelete.id));
     toast({
      title: "Work Log Deleted",
      description: `Work log for ${getLaborerName(workLogToDelete.laborerId)} on ${format(parseISO(workLogToDelete.date), 'PPP')} has been removed.`,
      variant: "destructive",
    });
  };

  const handleFormSubmit = async (workLog: WorkLog) => {
    if (workLog.pictureFile) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newWorkLog = { ...workLog, picturePreview: reader.result as string };
        saveWorkLog(newWorkLog);
      };
      reader.readAsDataURL(workLog.pictureFile);
    } else {
      saveWorkLog(workLog);
    }
  };
  
  const saveWorkLog = (workLogToSave: WorkLog) => {
    if (editingWorkLog) {
      setWorkLogs(workLogs.map(wl => wl.id === workLogToSave.id ? workLogToSave : wl));
      toast({ title: "Work Log Updated", description: `Work log for ${getLaborerName(workLogToSave.laborerId)} has been updated.` });
    } else {
      setWorkLogs([workLogToSave, ...workLogs]);
      toast({ title: "Work Log Added", description: `New work log for ${getLaborerName(workLogToSave.laborerId)} has been added.` });
    }
    setIsFormOpen(false);
    setEditingWorkLog(undefined);
  }
  
  const getLaborerName = (laborerId: string) => {
    return laborers.find(l => l.id === laborerId)?.name || 'Unknown Laborer';
  };

  const columns = [
    { 
      accessorKey: (item: WorkLog) => getLaborerName(item.laborerId), 
      header: 'Laborer' 
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
            laborers={laborers}
            defaultValues={editingWorkLog}
          />
        </Suspense>
      )}
    </div>
  );
}
