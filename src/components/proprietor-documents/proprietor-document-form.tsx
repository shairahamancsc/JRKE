
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { useForm, SubmitHandler, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileUp, Eye, FileText, AlertCircle, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import type { ProprietorDocument, ProprietorDocumentTypeValue } from '@/lib/types';
import { proprietorDocumentTypesList } from '@/lib/data';
import { uploadProprietorDocumentFile, addProprietorDocument } from '@/lib/proprietor-document-actions';
import { useToast } from '@/hooks/use-toast';

const MAX_FILE_SIZE_MB = 5;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

const proprietorDocumentSchema = z.object({
  documentType: z.custom<ProprietorDocumentTypeValue>(
    (val) => proprietorDocumentTypesList.some(type => type.value === val),
    { message: "Document type is required" }
  ),
  documentName: z.string().min(1, "Document name is required"),
  file: z.instanceof(File, { message: "File is required." })
    .refine(file => file.size > 0, "File cannot be empty.")
    .refine(file => file.size <= MAX_FILE_SIZE_BYTES, `File size must be less than ${MAX_FILE_SIZE_MB}MB.`),
});

type ProprietorDocumentFormData = z.infer<typeof proprietorDocumentSchema>;

interface ProprietorDocumentFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitSuccess: (newDocument: ProprietorDocument) => void;
}

export function ProprietorDocumentForm({ isOpen, onClose, onSubmitSuccess }: ProprietorDocumentFormProps) {
  const [localFilePreview, setLocalFilePreview] = useState<string | undefined>(undefined);
  const [currentFileType, setCurrentFileType] = useState<string | undefined>(undefined);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const { control, register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<ProprietorDocumentFormData>({
    resolver: zodResolver(proprietorDocumentSchema),
    defaultValues: {
      documentType: proprietorDocumentTypesList[0]?.value,
      documentName: proprietorDocumentTypesList[0]?.label,
      file: undefined,
    },
  });

  const selectedDocumentType = watch('documentType');
  const currentFile = watch('file'); // Watch the file field

  useEffect(() => {
    if (isOpen) {
      const initialType = proprietorDocumentTypesList[0]?.value;
      const initialName = proprietorDocumentTypesList.find(dt => dt.value === initialType)?.label || '';
      reset({
        documentType: initialType,
        documentName: initialName,
        file: undefined,
      });
      setLocalFilePreview(undefined);
      setCurrentFileType(undefined);
    }
  }, [reset, isOpen]);

  useEffect(() => {
    if (selectedDocumentType && selectedDocumentType !== 'other') {
      const typeLabel = proprietorDocumentTypesList.find(dt => dt.value === selectedDocumentType)?.label;
      if (typeLabel) {
        setValue('documentName', typeLabel, { shouldValidate: true });
      }
    } else if (selectedDocumentType === 'other') {
       setValue('documentName', '', { shouldValidate: true });
    }
  }, [selectedDocumentType, setValue]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setValue('file', file, { shouldValidate: true });
      setCurrentFileType(file.type);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLocalFilePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setValue('file', undefined, { shouldValidate: true });
      setLocalFilePreview(undefined);
      setCurrentFileType(undefined);
    }
  };

  const handleFormSubmitInternal: SubmitHandler<ProprietorDocumentFormData> = async (data) => {
    if (!data.file) {
      toast({ title: "Error", description: "No file selected.", variant: "destructive" });
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', data.file);

    try {
      const uploadResult = await uploadProprietorDocumentFile(formData);
      if (!uploadResult.success || !uploadResult.url) {
        toast({ title: "File Upload Failed", description: uploadResult.error || "Could not upload file.", variant: "destructive" });
        setIsUploading(false);
        return;
      }

      const documentMetadata: Omit<ProprietorDocument, 'id' | 'uploadedAt'> = {
        documentType: data.documentType,
        documentName: data.documentName,
        fileName: data.file.name,
        blobUrl: uploadResult.url,
        fileType: data.file.type,
      };
      
      const newDocument = await addProprietorDocument(documentMetadata as Omit<ProprietorDocument, 'id'>); 

      onSubmitSuccess(newDocument); 
      toast({ title: "Document Uploaded", description: `${newDocument.documentName} has been successfully uploaded.` });
      onClose();

    } catch (error) {
      console.error("Error in form submission:", error);
      toast({ title: "Submission Error", description: "An error occurred. Please try again.", variant: "destructive" });
    } finally {
      setIsUploading(false);
    }
  };

  const renderPreview = () => {
    if (!localFilePreview) return null;
    if (currentFileType?.startsWith('image/')) {
      return <Image src={localFilePreview} alt="File preview" width={120} height={80} className="rounded-md object-contain border" data-ai-hint="document scan" />;
    }
    if (currentFileType === 'application/pdf') {
      return <a href={localFilePreview} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-1 p-2 border rounded-md bg-muted/50"><FileText className="h-5 w-5" /> View PDF Preview</a>;
    }
    return <div className="text-sm text-muted-foreground p-2 border rounded-md bg-muted/50 flex items-center gap-1"><FileText className="h-5 w-5" />{watch('file')?.name || 'File Selected'}</div>;
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Upload Proprietor Document</DialogTitle>
          <DialogDescription>
            Select document type, provide a name, and upload the file. Max file size: {MAX_FILE_SIZE_MB}MB.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleFormSubmitInternal)} className="space-y-4 py-4 overflow-y-auto max-h-[70vh] pr-3">
          <div>
            <Label htmlFor="documentType">Document Type</Label>
            <Controller
              name="documentType"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger id="documentType" className={errors.documentType ? 'border-destructive' : ''}>
                    <SelectValue placeholder="Select document type" />
                  </SelectTrigger>
                  <SelectContent>
                    {proprietorDocumentTypesList.map(docType => (
                      <SelectItem key={docType.value} value={docType.value}>
                        {docType.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.documentType && <p className="text-xs text-destructive mt-1">{errors.documentType.message}</p>}
          </div>

          <div>
            <Label htmlFor="documentName">Document Name</Label>
            <Input
              id="documentName"
              {...register('documentName')}
              className={errors.documentName ? 'border-destructive' : ''}
              readOnly={selectedDocumentType !== 'other'}
              placeholder={selectedDocumentType === 'other' ? "Enter a name for this document" : "Pre-filled based on type"}
            />
            {errors.documentName && <p className="text-xs text-destructive mt-1">{errors.documentName.message}</p>}
          </div>

          <div>
            <Label htmlFor="file-upload-proprietor" className="flex items-center gap-1 cursor-pointer text-primary hover:underline">
              <FileUp className="h-4 w-4" />
              {localFilePreview ? "Change File" : "Upload File"}
            </Label>
            <Input
              id="file-upload-proprietor" 
              type="file"
              accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx,.txt"
              {...register('file')} 
              onChange={handleFileChange}
              className="hidden"
            />
            {currentFile && (
              <p className="text-sm text-muted-foreground mt-1">
                Selected file: {currentFile.name}
              </p>
            )}
            {localFilePreview && <div className="mt-2">{renderPreview()}</div>}
            {errors.file && <p className="text-xs text-destructive mt-1">{errors.file.message}</p>}
          </div>

          {watch('file') && watch('file')!.size > MAX_FILE_SIZE_BYTES && (
            <p className="text-xs text-destructive flex items-center gap-1">
              <AlertCircle className="h-4 w-4"/> File size exceeds {MAX_FILE_SIZE_MB}MB limit.
            </p>
          )}

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={isUploading}>Cancel</Button>
            </DialogClose>
            <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground" disabled={isUploading}>
              {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Upload Document'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
