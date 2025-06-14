"use client";

import React, { useState } from "react";
import { SupervisorForm } from "@/components/supervisors/SupervisorForm";
import { SupervisorsTable } from "@/components/supervisors/SupervisorsTable";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Users, Edit2 } from "lucide-react";
import type { Supervisor } from "@/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";


// Mock data - replace with actual data fetching and state management
const initialSupervisors: Supervisor[] = [
  { id: "1", name: "Amit Singh", email: "amit@example.com", createdAt: "2023-01-15" },
  { id: "2", name: "Priya Sharma", email: "priya@example.com", createdAt: "2023-02-20" },
];

export default function SupervisorsPage() {
  const [supervisors, setSupervisors] = useState<Supervisor[]>(initialSupervisors);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSupervisor, setEditingSupervisor] = useState<Supervisor | null>(null);
  const { toast } = useToast();

  const handleFormSuccess = (data: Supervisor) => {
    if (editingSupervisor) {
      // Update existing supervisor
      setSupervisors(prev => prev.map(s => s.id === data.id ? data : s));
    } else {
      // Add new supervisor
      setSupervisors(prev => [data, ...prev]);
    }
    setDialogOpen(false);
    setEditingSupervisor(null);
  };

  const openAddDialog = () => {
    setEditingSupervisor(null);
    setDialogOpen(true);
  };

  const openEditDialog = (supervisor: Supervisor) => {
    setEditingSupervisor(supervisor);
    setDialogOpen(true);
  };

  const handleDeleteSupervisor = (supervisorId: string) => {
    setSupervisors(prev => prev.filter(s => s.id !== supervisorId));
    toast({ title: "Supervisor Deleted", description: "Supervisor has been removed.", variant: "destructive" });
  };


  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold font-headline text-primary flex items-center">
            <Users className="mr-3 h-8 w-8" />
            Supervisor Management
          </h1>
          <p className="text-muted-foreground">Add, view, and manage supervisor accounts.</p>
        </div>
        <Button onClick={openAddDialog}>
          <PlusCircle className="mr-2 h-4 w-4" /> Add Supervisor
        </Button>
      </div>

      <Dialog open={dialogOpen} onOpenChange={(isOpen) => {
        setDialogOpen(isOpen);
        if (!isOpen) setEditingSupervisor(null); // Reset editing state when dialog closes
      }}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="font-headline">{editingSupervisor ? "Edit Supervisor" : "Add New Supervisor"}</DialogTitle>
            <DialogDescription>
              {editingSupervisor ? "Update the supervisor's details." : "Fill in the details to create a new supervisor account."}
            </DialogDescription>
          </DialogHeader>
          <SupervisorForm onSuccess={handleFormSuccess} initialData={editingSupervisor} />
        </DialogContent>
      </Dialog>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline">Supervisor List</CardTitle>
          <CardDescription>A list of all registered supervisors.</CardDescription>
        </CardHeader>
        <CardContent>
          <SupervisorsTable
            supervisors={supervisors}
            onEdit={openEditDialog}
            onDelete={(id) => {
              // It's good practice to wrap delete in a confirmation dialog
              // For simplicity, directly deleting here after confirmation
              const supervisorToDelete = supervisors.find(s => s.id === id);
              if (supervisorToDelete) {
                // Trigger AlertDialog for confirmation
                // This part requires integrating AlertDialogTrigger inside the table or managing state differently
                // For now, a simple confirm then delete
                 if (window.confirm(`Are you sure you want to delete ${supervisorToDelete.name}?`)) {
                   handleDeleteSupervisor(id);
                 }
              }
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
