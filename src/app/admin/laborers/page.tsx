"use client";

import React, { useState } from "react";
import { LaborerForm } from "@/components/laborers/LaborerForm";
import { LaborersTable } from "@/components/laborers/LaborersTable";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, UserCog } from "lucide-react";
import type { Laborer } from "@/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

// Mock data - replace with actual data fetching and state management
const initialLaborers: Laborer[] = [
  { id: "1", name: "Ramesh Patel", phone: "9876543210", address: "123 Main St, Mumbai", profilePhotoUrl: "https://placehold.co/40x40.png?text=RP", createdAt: "2023-03-10" },
  { id: "2", name: "Sita Devi", phone: "8765432109", address: "456 Park Ave, Delhi", profilePhotoUrl: "https://placehold.co/40x40.png?text=SD", createdAt: "2023-04-05" },
];

export default function LaborersPage() {
  const [laborers, setLaborers] = useState<Laborer[]>(initialLaborers);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingLaborer, setEditingLaborer] = useState<Laborer | null>(null);
  const { toast } = useToast();

  const handleFormSuccess = (data: Laborer) => {
    if (editingLaborer) {
      setLaborers(prev => prev.map(l => l.id === data.id ? data : l));
    } else {
      setLaborers(prev => [data, ...prev]);
    }
    setDialogOpen(false);
    setEditingLaborer(null);
  };

  const openAddDialog = () => {
    setEditingLaborer(null);
    setDialogOpen(true);
  };
  
  const openEditDialog = (laborer: Laborer) => {
    setEditingLaborer(laborer);
    setDialogOpen(true);
  };

  const handleDeleteLaborer = (laborerId: string) => {
    const laborerToDelete = laborers.find(l => l.id === laborerId);
    if (laborerToDelete && window.confirm(`Are you sure you want to delete ${laborerToDelete.name}?`)) {
      setLaborers(prev => prev.filter(l => l.id !== laborerId));
      toast({ title: "Laborer Deleted", description: "Laborer has been removed.", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
        <h1 className="text-3xl font-bold font-headline text-primary flex items-center">
          <UserCog className="mr-3 h-8 w-8" />
          Laborer Management
        </h1>
        <p className="text-muted-foreground">Add, view, and manage laborer profiles.</p>
        </div>
        <Button onClick={openAddDialog}>
            <PlusCircle className="mr-2 h-4 w-4" /> Add Laborer
        </Button>
      </div>

      <Dialog open={dialogOpen} onOpenChange={(isOpen) => {
        setDialogOpen(isOpen);
        if (!isOpen) setEditingLaborer(null);
      }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-headline">{editingLaborer ? "Edit Laborer" : "Add New Laborer"}</DialogTitle>
            <DialogDescription>
              {editingLaborer ? "Update the laborer's details." : "Enter the details for the new laborer."}
            </DialogDescription>
          </DialogHeader>
          <LaborerForm onSuccess={handleFormSuccess} initialData={editingLaborer}/>
        </DialogContent>
      </Dialog>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline">Laborer List</CardTitle>
          <CardDescription>A list of all registered laborers.</CardDescription>
        </CardHeader>
        <CardContent>
          <LaborersTable
            laborers={laborers}
            onEdit={openEditDialog}
            onDelete={handleDeleteLaborer}
          />
        </CardContent>
      </Card>
    </div>
  );
}
