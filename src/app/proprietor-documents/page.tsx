
"use client";

import React, { useState, useEffect, lazy, Suspense, useMemo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle, Download, Trash2, Eye, FileText, Loader2, AlertTriangle } from 'lucide-react';
import { DataTable } from '@/components/common/data-table';
import type { ProprietorDocument, ProprietorDocumentTypeValue } from '@/lib/types';
import { initialProprietorDocuments, proprietorDocumentTypesList } from '@/lib/data';
import { format, parseISO } from 'date-fns';
import { useToast } from "@/hooks/use-toast";
import { PROPRIETOR_DOCUMENTS_STORAGE_KEY } from '@/lib/storageKeys';
import useDebouncedLocalStorage from '@/hooks/useDebouncedLocalStorage';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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

const ProprietorDocumentForm = lazy(() => 
  import('@/components/proprietor-documents/proprietor-document-form').then(module => ({ default: module.ProprietorDocumentForm }))
);

// Utility function, can be outside the component
const getDocumentTypeLabelUtil = (value: string) => {
  return proprietorDocumentTypesList.find(dt => dt.value === value)?.label || value;
};


export default function ProprietorDocumentsPage() {
  const [documents, setDocuments] = useDebouncedLocalStorage<ProprietorDocument[]>(
    PROPRIETOR_DOCUMENTS_STORAGE_KEY,
    initialProprietorDocuments
  );
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { toast } = useToast();

  const handleAddDocument = useCallback(() => {
    setIsFormOpen(true);
  }, []);

  const handleDeleteDocument = useCallback((docToDelete: ProprietorDocument) => {
    setDocuments(prevDocs => prevDocs.filter(d => d.id !== docToDelete.id));
    toast({
      title: "Document Deleted",
      description: `${docToDelete.documentName} (${docToDelete.fileName}) has been removed.`,
      variant: "destructive",
    });
  }, [setDocuments, toast]);

  const handleFormSubmit = useCallback((docData: ProprietorDocument) => {
      setDocuments(prevDocs => [docData, ...prevDocs].sort((a, b) => parseISO(b.uploadedAt).getTime() - parseISO(a.uploadedAt).getTime()));
      toast({ title: "Document Uploaded", description: `${docData.documentName} (${docData.fileName}) has been uploaded.` });
    setIsFormOpen(false);
  }, [setDocuments, toast]);

  const handleDownload = useCallback((fileDataUrl: string, fileName: string) => {
    try {
      const link = document.createElement('a');
      link.href = fileDataUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast({ title: "Download Started", description: `${fileName} is downloading.` });
    } catch (error) {
      console.error("Error downloading file:", error);
      toast({ title: "Download Error", description: `Could not start download for ${fileName}.`, variant: "destructive" });
    }
  }, [toast]);

  const columns = useMemo(() => [
    { 
      accessorKey: (item: ProprietorDocument) => getDocumentTypeLabelUtil(item.documentType), 
      header: 'Document Type' 
    },
    { 
      accessorKey: 'documentName' as keyof ProprietorDocument, 
      header: 'Document Name',
    },
    { 
      accessorKey: 'fileName' as keyof ProprietorDocument, 
      header: 'File Name',
      cell: (item: ProprietorDocument) => (
        <span className="truncate" title={item.fileName}>{item.fileName}</span>
      )
    },
    { 
      accessorKey: 'uploadedAt' as keyof ProprietorDocument, 
      header: 'Uploaded At',
      cell: (item: ProprietorDocument) => format(parseISO(item.uploadedAt), 'PPP p')
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: (item: ProprietorDocument) => (
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => handleDownload(item.fileDataUrl, item.fileName)}
            aria-label="Download document"
          >
            <Download className="h-4 w-4" />
          </Button>
           <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="icon" aria-label="Delete document">
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the document
                  <span className="font-semibold"> {item.documentName} ({item.fileName})</span>.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => handleDeleteDocument(item)}>
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      ),
    },
  ], [handleDownload, handleDeleteDocument]);

  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-col items-start sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Proprietor Documents</h1>
          <p className="text-muted-foreground mt-1">Manage company GST, PAN, Aadhaar, and other important documents.</p>
        </div>
        <Button 
          onClick={handleAddDocument} 
          className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground self-stretch sm:self-auto"
        >
          <PlusCircle className="mr-2 h-5 w-5" /> Upload Document
        </Button>
      </div>
      
      <Card className="mb-6 bg-destructive/5 border-destructive/20 shadow-sm">
        <CardHeader className="flex flex-row items-start gap-3 space-y-0 pb-3">
          <AlertTriangle className="h-6 w-6 text-destructive mt-1 flex-shrink-0" />
          <div>
            <CardTitle className="text-lg text-destructive">Storage & Security Notice</CardTitle>
            <CardDescription className="text-destructive/80">
              Documents are stored in your browser's local storage. This is suitable for demo purposes only. 
              For production, use secure server-side storage. Do not upload highly sensitive personal data.
              Clearing browser data will remove these documents.
            </CardDescription>
          </div>
        </CardHeader>
      </Card>

      {documents.length === 0 && !isFormOpen ? (
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">
            No documents uploaded yet. Click "Upload Document" to get started.
          </CardContent>
        </Card>
      ) : (
        <DataTable
          columns={columns}
          data={documents}
        />
      )}


      {isFormOpen && (
        <Suspense fallback={
          <div className="fixed inset-0 bg-background/30 backdrop-blur-sm flex items-center justify-center z-[60]">
            <div className="bg-card p-6 rounded-lg shadow-xl flex items-center space-x-2">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              <span>Loading Form...</span>
            </div>
          </div>
        }>
          <ProprietorDocumentForm
            isOpen={isFormOpen}
            onClose={() => {
              setIsFormOpen(false);
            }}
            onSubmit={handleFormSubmit}
          />
        </Suspense>
      )}
    </div>
  );
}
