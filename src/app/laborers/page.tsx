
"use client";

import React, { useState, useEffect, lazy, Suspense } from 'react';
// import Image from 'next/image'; // Not directly used, AvatarImage handles it
import { Button } from '@/components/ui/button';
import { PlusCircle, UserCircle2, Loader2, FileText, Phone, Smartphone } from 'lucide-react';
// import { LaborerForm } from '@/components/laborers/laborer-form'; // Lazy loaded
import { DataTable } from '@/components/common/data-table';
import type { Laborer } from '@/lib/types';
import { initialLaborers } from '@/lib/data';
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { LABORERS_STORAGE_KEY } from '@/lib/storageKeys';

const LaborerForm = lazy(() => import('@/components/laborers/laborer-form').then(module => ({ default: module.LaborerForm })));

export default function LaborersPage() {
  const [laborers, setLaborers] = useState<Laborer[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingLaborer, setEditingLaborer] = useState<Laborer | undefined>(undefined);
  const { toast } = useToast();

  useEffect(() => {
    // Load laborers from LocalStorage or use initialLaborers
    try {
      const storedLaborers = localStorage.getItem(LABORERS_STORAGE_KEY);
      if (storedLaborers) {
        setLaborers(JSON.parse(storedLaborers));
      } else {
        setLaborers(initialLaborers.map(l => ({
          ...l,
          phoneNo: l.phoneNo ?? undefined,
          emergencyPhoneNo: l.emergencyPhoneNo ?? undefined,
          aadhaarNo: l.aadhaarNo ?? undefined,
          panNo: l.panNo ?? undefined,
          aadhaarPreview: l.aadhaarPreview ?? undefined,
          panPreview: l.panPreview ?? undefined,
          licensePreview: l.licensePreview ?? undefined,
        })));
      }
    } catch (error) {
      console.error("Error loading laborers from localStorage:", error);
      // Fallback to initial data in case of error
       setLaborers(initialLaborers.map(l => ({
        ...l,
        phoneNo: l.phoneNo ?? undefined,
        emergencyPhoneNo: l.emergencyPhoneNo ?? undefined,
        aadhaarNo: l.aadhaarNo ?? undefined,
        panNo: l.panNo ?? undefined,
        aadhaarPreview: l.aadhaarPreview ?? undefined,
        panPreview: l.panPreview ?? undefined,
        licensePreview: l.licensePreview ?? undefined,
      })));
    }
    
    if (typeof window !== "undefined" && window.location.hash === "#add") {
      setIsFormOpen(true);
      window.location.hash = ""; 
    }
  }, []);

  // Save laborers to LocalStorage whenever the state changes
  useEffect(() => {
    try {
      localStorage.setItem(LABORERS_STORAGE_KEY, JSON.stringify(laborers));
    } catch (error) {
      console.error("Error saving laborers to localStorage:", error);
      toast({
        title: "Storage Error",
        description: "Could not save laborer data. Your browser storage might be full or disabled.",
        variant: "destructive",
      });
    }
  }, [laborers, toast]);

  const handleAddLaborer = () => {
    setEditingLaborer(undefined);
    setIsFormOpen(true);
  };

  const handleEditLaborer = (laborer: Laborer) => {
    setEditingLaborer(laborer);
    setIsFormOpen(true);
  };

  const handleDeleteLaborer = (laborerToDelete: Laborer) => {
    setLaborers(prevLaborers => prevLaborers.filter(l => l.id !== laborerToDelete.id));
    toast({
      title: "Laborer Deleted",
      description: `${laborerToDelete.name} has been removed.`,
      variant: "destructive",
    });
  };

  const handleFormSubmit = (laborerData: Laborer) => {
    saveLaborer(laborerData);
  };

  const saveLaborer = (laborerToSave: Laborer) => {
    const { photoFile, aadhaarFile, panFile, licenseFile, ...restOfLaborer } = laborerToSave;
    const finalLaborerData: Laborer = {
        ...restOfLaborer,
        photoPreview: photoFile ? laborerToSave.photoPreview : (editingLaborer && laborerToSave.id === editingLaborer.id ? editingLaborer.photoPreview : laborerToSave.photoPreview),
        aadhaarPreview: aadhaarFile ? laborerToSave.aadhaarPreview : (editingLaborer && laborerToSave.id === editingLaborer.id ? editingLaborer.aadhaarPreview : laborerToSave.aadhaarPreview),
        panPreview: panFile ? laborerToSave.panPreview : (editingLaborer && laborerToSave.id === editingLaborer.id ? editingLaborer.panPreview : laborerToSave.panPreview),
        licensePreview: licenseFile ? laborerToSave.licensePreview : (editingLaborer && laborerToSave.id === editingLaborer.id ? editingLaborer.licensePreview : laborerToSave.licensePreview),
    };

    if (editingLaborer) {
      setLaborers(prevLaborers => prevLaborers.map(l => l.id === finalLaborerData.id ? finalLaborerData : l));
      toast({ title: "Laborer Updated", description: `${finalLaborerData.name}'s details have been updated.` });
    } else {
      setLaborers(prevLaborers => [finalLaborerData, ...prevLaborers]);
      toast({ title: "Laborer Added", description: `${finalLaborerData.name} has been added.` });
    }
    setIsFormOpen(false);
    setEditingLaborer(undefined);
  };

  const columns = [
    { 
      accessorKey: 'photoPreview' as keyof Laborer, 
      header: 'Photo',
      cell: (item: Laborer) => (
        <Avatar className="h-10 w-10">
          <AvatarImage src={item.photoPreview} alt={item.name} data-ai-hint="person" />
          <AvatarFallback>
            <UserCircle2 className="h-6 w-6 text-muted-foreground" />
          </AvatarFallback>
        </Avatar>
      )
    },
    { accessorKey: 'name' as keyof Laborer, header: 'Name' },
    { accessorKey: 'details' as keyof Laborer, header: 'Details' },
    { 
      accessorKey: 'phoneNo' as keyof Laborer, 
      header: 'Phone No.', 
      cell: (item: Laborer) => item.phoneNo || '-' 
    },
    { 
      accessorKey: 'emergencyPhoneNo' as keyof Laborer, 
      header: 'Emergency No.', 
      cell: (item: Laborer) => item.emergencyPhoneNo || '-' 
    },
    { accessorKey: 'aadhaarNo' as keyof Laborer, header: 'Aadhaar No.', cell: (item: Laborer) => item.aadhaarNo || '-' },
    { accessorKey: 'panNo' as keyof Laborer, header: 'PAN No.', cell: (item: Laborer) => item.panNo || '-' },
    {
      header: 'Docs',
      cell: (item: Laborer) => (
        <div className="flex space-x-1">
          {[
            { preview: item.aadhaarPreview, name: "Aadhaar" },
            { preview: item.panPreview, name: "PAN" },
            { preview: item.licensePreview, name: "License" },
          ].map(doc => doc.preview && (
            <TooltipProvider key={doc.name} delayDuration={100}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="cursor-default">
                    <FileText className="h-4 w-4 text-muted-foreground hover:text-primary" />
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{doc.name} uploaded</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}
        </div>
      )
    }
  ];

  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-col items-start sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
        <h1 className="text-3xl font-bold text-foreground">Laborer Management</h1>
        <Button 
          onClick={handleAddLaborer} 
          className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground self-stretch sm:self-auto"
        >
          <PlusCircle className="mr-2 h-5 w-5" /> Add Laborer
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={laborers}
        onEdit={handleEditLaborer}
        onDelete={handleDeleteLaborer}
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
          <LaborerForm
            isOpen={isFormOpen}
            onClose={() => {
              setIsFormOpen(false);
              setEditingLaborer(undefined);
            }}
            onSubmit={handleFormSubmit}
            defaultValues={editingLaborer}
          />
        </Suspense>
      )}
    </div>
  );
}
