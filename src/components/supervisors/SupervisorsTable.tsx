"use client";

import type { Supervisor } from "@/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface SupervisorsTableProps {
  supervisors: Supervisor[];
  onEdit: (supervisor: Supervisor) => void;
  onDelete: (supervisorId: string) => void;
}

export function SupervisorsTable({ supervisors, onEdit, onDelete }: SupervisorsTableProps) {
  if (supervisors.length === 0) {
    return <p className="text-muted-foreground text-center py-8">No supervisors found.</p>;
  }

  return (
    <div className="rounded-md border shadow-sm">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[80px]">Avatar</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Created At</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {supervisors.map((supervisor) => (
            <TableRow key={supervisor.id}>
              <TableCell>
                <Avatar>
                  <AvatarImage src={`https://placehold.co/40x40.png?text=${supervisor.name.charAt(0)}`} alt={supervisor.name} data-ai-hint="person initial" />
                  <AvatarFallback>{supervisor.name.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
              </TableCell>
              <TableCell className="font-medium">{supervisor.name}</TableCell>
              <TableCell>{supervisor.email}</TableCell>
              <TableCell>{new Date(supervisor.createdAt).toLocaleDateString()}</TableCell>
              <TableCell className="text-right space-x-2">
                <Button variant="outline" size="icon" onClick={() => onEdit(supervisor)} aria-label={`Edit ${supervisor.name}`}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="destructive" size="icon" onClick={() => onDelete(supervisor.id)} aria-label={`Delete ${supervisor.name}`}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
