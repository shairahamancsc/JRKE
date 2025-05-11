
"use client";

import React from 'react';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";

interface Column<T> {
  accessorKey: keyof T | ((item: T) => React.ReactNode);
  header: string;
  cell?: (item: T) => React.ReactNode;
}

interface DataTableProps<T extends { id: string }> {
  columns: Column<T>[];
  data: T[];
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
}

export function DataTable<T extends { id: string }>({
  columns,
  data,
  onEdit,
  onDelete,
}: DataTableProps<T>) {
  return (
    <div className="rounded-md border shadow-sm">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column, index) => (
              <TableHead key={index}>{column.header}</TableHead>
            ))}
            {(onEdit || onDelete) && <TableHead>Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length + ((onEdit || onDelete) ? 1 : 0)} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          ) : (
            data.map((item) => (
              <TableRow key={item.id}>
                {columns.map((column, index) => (
                  <TableCell key={index} className="whitespace-normal break-words">
                    {column.cell
                      ? column.cell(item)
                      : typeof column.accessorKey === 'function'
                      ? column.accessorKey(item)
                      : String(item[column.accessorKey as keyof T] ?? '')}
                  </TableCell>
                ))}
                {(onEdit || onDelete) && (
                  <TableCell className="space-x-2 whitespace-nowrap"> {/* Added whitespace-nowrap for action buttons container */}
                    {onEdit && (
                      <Button variant="outline" size="icon" onClick={() => onEdit(item)} aria-label="Edit">
                        <Edit className="h-4 w-4" />
                      </Button>
                    )}
                    {onDelete && (
                      <Button variant="destructive" size="icon" onClick={() => onDelete(item)} aria-label="Delete">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </TableCell>
                )}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}

