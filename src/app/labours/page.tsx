
"use client";

import React, { useState, useEffect, lazy, Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle, UserCircle2, Loader2, FileText, Phone, Smartphone, IndianRupee } from 'lucide-react';
import { DataTable } from '@/components/common/data-table';
import type { Labour } from '@/lib/types';
import { initialLabours } from '@/lib/data';
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { LABOURS_STORAGE_KEY } from '@/lib/storageKeys';
import useDebouncedLocalStorage from '@/hooks/useDebouncedLocalStorage';

const LabourForm = lazy(() => import('@/components/labours/labour-form').then(module => ({ default: module.LabourForm })));

export default function LaboursPage() {
  const [labours, setLabours] = useDebouncedLocalStorage<Labour[]>(
    LABOURS_STORAGE_KEY,
    initialLabours
  );
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingLabour, setEditingLabour] = useState<Labour | undefined>(undefined);
  const { toast } = useToast();

  useEffect(() => {
    if (typeof window !== "undefined" && window.location.hash === "#add") {
      setIsFormOpen(true);
      window.location.hash = ""; 
    }
  }, []);


  const handleAddLabour = () => {
    setEditingLabour(undefined);
    setIsFormOpen(true);
  };

  const handleEditLabour = (labour: Labour) => {
    setEditingLabour(labour);
    setIsFormOpen(true);
  };

  const handleDeleteLabour = (labourToDelete: Labour) => {
    setLabours(prevLabours => prevLabours.filter(l => l.id !== labourToDelete.id));
    toast({
      title: "Labour Deleted",
      description: `${labourToDelete.name} has been removed.`,
      variant: "destructive",
    });
  };

  const handleFormSubmit = (labourData: Labour) => {
    saveLabour(labourData);
  };

  const saveLabour = (labourToSave: Labour) => {
    const { photoFile, aadhaarFile, panFile, licenseFile, ...restOfLabour } = labourToSave;
    const finalLabourData: Labour = {
        ...restOfLabour,
        photoPreview: photoFile ? labourToSave.photoPreview : (editingLabour && labourToSave.id === editingLabour.id ? editingLabour.photoPreview : labourToSave.photoPreview),
        aadhaarPreview: aadhaarFile ? labourToSave.aadhaarPreview : (editingLabour && labourToSave.id === editingLabour.id ? editingLabour.aadhaarPreview : labourToSave.aadhaarPreview),
        panPreview: panFile ? labourToSave.panPreview : (editingLabour && labourToSave.id === editingLabour.id ? editingLabour.panPreview : labourToSave.panPreview),
        licensePreview: licenseFile ? labourToSave.licensePreview : (editingLabour && labourToSave.id === editingLabour.id ? editingLabour.licensePreview : labourToSave.licensePreview),
        salaryRate: labourToSave.salaryRate, // Ensure salaryRate is saved
    };

    if (editingLabour) {
      setLabours(prevLabours => prevLabours.map(l => l.id === finalLabourData.id ? finalLabourData : l));
      toast({ title: "Labour Updated", description: `${finalLabourData.name}'s details have been updated.` });
    } else {
      setLabours(prevLabours => [finalLabourData, ...prevLabours]);
      toast({ title: "Labour Added", description: `${finalLabourData.name} has been added.` });
    }
    setIsFormOpen(false);
    setEditingLabour(undefined);
  };

  const columns = React.useMemo(() => [
    { 
      accessorKey: 'photoPreview' as keyof Labour, 
      header: 'Photo',
      cell: (item: Labour) => (
        <Avatar className="h-10 w-10">
          <AvatarImage src={item.photoPreview} alt={item.name} data-ai-hint="person" />
          <AvatarFallback>
            <UserCircle2 className="h-6 w-6 text-muted-foreground" />
          </AvatarFallback>
        </Avatar>
      )
    },
    { accessorKey: 'name' as keyof Labour, header: 'Name' },
    { accessorKey: 'details' as keyof Labour, header: 'Details' },
    { 
      accessorKey: 'salaryRate' as keyof Labour, 
      header: 'Daily Rate (₹)', 
      cell: (item: Labour) => item.salaryRate ? `₹${item.salaryRate.toFixed(2)}` : '-' 
    },
    { 
      accessorKey: 'phoneNo' as keyof Labour, 
      header: 'Phone No.', 
      cell: (item: Labour) => item.phoneNo || '-' 
    },
    { 
      accessorKey: 'emergencyPhoneNo' as keyof Labour, 
      header: 'Emergency No.', 
      cell: (item: Labour) => item.emergencyPhoneNo || '-' 
    },
    { accessorKey: 'aadhaarNo' as keyof Labour, header: 'Aadhaar No.', cell: (item: Labour) => item.aadhaarNo || '-' },
    { accessorKey: 'panNo' as keyof Labour, header: 'PAN No.', cell: (item: Labour) => item.panNo || '-' },
    {
      header: 'Docs',
      cell: (item: Labour) => (
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
  ], []);

  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-col items-start sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
        <h1 className="text-3xl font-bold text-foreground">Labour Management</h1>
        <Button 
          onClick={handleAddLabour} 
          className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground self-stretch sm:self-auto"
        >
          <PlusCircle className="mr-2 h-5 w-5" /> Add Labour
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={labours}
        onEdit={handleEditLabour}
        onDelete={handleDeleteLabour}
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
          <LabourForm
            isOpen={isFormOpen}
            onClose={() => {
              setIsFormOpen(false);
              setEditingLabour(undefined);
            }}
            onSubmit={handleFormSubmit}
            defaultValues={editingLabour}
          />
        </Suspense>
      )}
    </div>
  );
}
