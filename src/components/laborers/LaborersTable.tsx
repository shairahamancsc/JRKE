"use client";

import type { Laborer } from "@/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Eye } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface LaborersTableProps {
  laborers: Laborer[];
  onEdit: (laborer: Laborer) => void;
  onDelete: (laborerId: string) => void;
  onViewDetails?: (laborer: Laborer) => void; // Optional: for viewing full details
}

export function LaborersTable({ laborers, onEdit, onDelete, onViewDetails }: LaborersTableProps) {
  if (laborers.length === 0) {
    return <p className="text-muted-foreground text-center py-8">No laborers found.</p>;
  }
  
  return (
    <div className="rounded-md border shadow-sm">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[80px]">Photo</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Address</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {laborers.map((laborer) => (
            <TableRow key={laborer.id}>
              <TableCell>
                <Avatar className="h-10 w-10">
                  <AvatarImage 
                    src={laborer.profilePhotoUrl || `https://placehold.co/40x40.png?text=${laborer.name.charAt(0)}`} 
                    alt={laborer.name}
                    data-ai-hint="person portrait" 
                  />
                  <AvatarFallback>{laborer.name.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
              </TableCell>
              <TableCell className="font-medium">{laborer.name}</TableCell>
              <TableCell>{laborer.phone}</TableCell>
              <TableCell className="max-w-[200px] truncate">{laborer.address}</TableCell>
              <TableCell className="text-right space-x-2">
                {onViewDetails && (
                  <Button variant="ghost" size="icon" onClick={() => onViewDetails(laborer)} aria-label={`View details for ${laborer.name}`}>
                    <Eye className="h-4 w-4" />
                  </Button>
                )}
                <Button variant="outline" size="icon" onClick={() => onEdit(laborer)} aria-label={`Edit ${laborer.name}`}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="destructive" size="icon" onClick={() => onDelete(laborer.id)} aria-label={`Delete ${laborer.name}`}>
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
