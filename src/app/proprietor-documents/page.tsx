
"use client";

import React, { useState, useEffect, lazy, Suspense, useMemo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle, Download, Trash2, Loader2, FileText } from 'lucide-react';
import { DataTable } from '@/components/common/data-table';
import type { ProprietorDocument } from '@/lib/types';
import { proprietorDocumentTypesList } from '@/lib/data';
import { format, parseISO } from 'date-fns';
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { getAllProprietorDocuments, deleteProprietorDocument } from '@/lib/proprietor-document-actions';

const ProprietorDocumentForm = lazy(() =>
  import('@/components/proprietor-documents/proprietor-document-form').then(module => ({ default: module.ProprietorDocumentForm }))
);

const getDocumentTypeLabelUtil = (value: string) => {
  return proprietorDocumentTypesList.find(dt => dt.value === value)?.label || value;
};

export default function ProprietorDocumentsPage() {
  const [documents, setDocuments] = useState<ProprietorDocument[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const { toast } = useToast();

  const fetchDocuments = useCallback(async () => {
    setIsLoadingData(true);
    try {
      const serverDocuments = await getAllProprietorDocuments();
      setDocuments(serverDocuments);
    } catch (error) {
      console.error("Failed to fetch documents:", error);
      toast({
        title: "Error Loading Documents",
        description: "Could not load documents from the server.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingData(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const handleAddDocument = useCallback(() => {
    setIsFormOpen(true);
  }, []);

  const handleDeleteDocument = useCallback(async (docToDelete: ProprietorDocument) => {
    try {
      await deleteProprietorDocument(docToDelete.id, docToDelete.blobUrl);
      setDocuments(prevDocs => prevDocs.filter(d => d.id !== docToDelete.id));
      toast({
        title: "Document Deleted",
        description: `${docToDelete.documentName} (${docToDelete.fileName}) has been removed.`,
        variant: "destructive",
      });
    } catch (error) {
      console.error("Failed to delete document:", error);
      toast({
        title: "Error Deleting Document",
        description: "Could not delete document. Please try again.",
        variant: "destructive",
      });
    }
  }, [toast]);

  const handleFormSubmitSuccess = useCallback((newDocument: ProprietorDocument) => {
    setDocuments(prevDocs => [newDocument, ...prevDocs].sort((a, b) => parseISO(b.uploadedAt).getTime() - parseISO(a.uploadedAt).getTime()));
    // Toast is handled within the form on successful addProprietorDocument call
  }, []);


  const handleDownload = useCallback((blobUrl: string, fileName: string) => {
    // For public Vercel Blob URLs, a direct link is often enough.
    // If blobs were private, you'd need a server action to generate a signed URL.
    try {
      const link = document.createElement('a');
      link.href = blobUrl;
      link.target = "_blank"; // Open in new tab to let browser handle download/display
      link.download = fileName; // Suggest filename
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast({ title: "Download Started", description: `${fileName} is downloading.` });
    } catch (error) {
      console.error("Error initiating download:", error);
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
            onClick={() => handleDownload(item.blobUrl, item.fileName)}
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
                  <span className="font-semibold"> {item.documentName} ({item.fileName})</span> and its associated file.
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

  if (isLoadingData) {
    return (
      <div className="container mx-auto py-8 flex justify-center items-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <span className="ml-2">Loading documents...</span>
      </div>
    );
  }

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

      {/* Removed the localStorage warning card */}

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
          // Edit functionality is not implemented in this scope for proprietor documents
          // onDelete is handled by the AlertDialog within the cell
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
            onClose={() => setIsFormOpen(false)}
            onSubmitSuccess={handleFormSubmitSuccess}
          />
        </Suspense>
      )}
    </div>
  );
}
