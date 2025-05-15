
"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserCircle2, FileUp, Eye, Phone, Smartphone, IndianRupee } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import type { Labour } from '@/lib/types';

const phoneRegex = /^[6-9]\d{9}$/; // Indian mobile number regex

const labourSchema = z.object({
  name: z.string().min(1, "Name is required"),
  details: z.string().min(1, "Details are required"),
  photoFile: z.instanceof(File).optional(),
  phoneNo: z.string().optional().or(z.literal('')).refine(val => !val || phoneRegex.test(val), {
    message: "Invalid phone number format (must be 10 digits starting with 6-9).",
  }),
  emergencyPhoneNo: z.string().optional().or(z.literal('')).refine(val => !val || phoneRegex.test(val), {
    message: "Invalid emergency phone number format (must be 10 digits starting with 6-9).",
  }),
  aadhaarNo: z.string().optional().or(z.literal('')),
  panNo: z.string().optional().or(z.literal('')),
  aadhaarFile: z.instanceof(File).optional(),
  panFile: z.instanceof(File).optional(),
  licenseFile: z.instanceof(File).optional(),
  salaryRate: z.coerce.number().min(0, "Salary rate must be a positive number.").optional(),
});

type LabourFormData = z.infer<typeof labourSchema>;

interface LabourFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Labour) => void;
  defaultValues?: Labour;
}

export function LabourForm({ isOpen, onClose, onSubmit, defaultValues }: LabourFormProps) {
  const [photoPreview, setPhotoPreview] = useState<string | undefined>(defaultValues?.photoPreview);
  const [aadhaarPreview, setAadhaarPreview] = useState<string | undefined>(defaultValues?.aadhaarPreview);
  const [panPreview, setPanPreview] = useState<string | undefined>(defaultValues?.panPreview);
  const [licensePreview, setLicensePreview] = useState<string | undefined>(defaultValues?.licensePreview);
  
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<LabourFormData>({
    resolver: zodResolver(labourSchema),
    defaultValues: {
      name: defaultValues?.name || '',
      details: defaultValues?.details || '',
      photoFile: undefined,
      phoneNo: defaultValues?.phoneNo || '',
      emergencyPhoneNo: defaultValues?.emergencyPhoneNo || '',
      aadhaarNo: defaultValues?.aadhaarNo || '',
      panNo: defaultValues?.panNo || '',
      aadhaarFile: undefined,
      panFile: undefined,
      licenseFile: undefined,
      salaryRate: defaultValues?.salaryRate,
    },
  });

  React.useEffect(() => {
    if (isOpen) { 
      reset({ 
        name: defaultValues?.name || '', 
        details: defaultValues?.details || '',
        photoFile: undefined,
        phoneNo: defaultValues?.phoneNo || '',
        emergencyPhoneNo: defaultValues?.emergencyPhoneNo || '',
        aadhaarNo: defaultValues?.aadhaarNo || '',
        panNo: defaultValues?.panNo || '',
        aadhaarFile: undefined,
        panFile: undefined,
        licenseFile: undefined,
        salaryRate: defaultValues?.salaryRate,
      });
      setPhotoPreview(defaultValues?.photoPreview);
      setAadhaarPreview(defaultValues?.aadhaarPreview);
      setPanPreview(defaultValues?.panPreview);
      setLicensePreview(defaultValues?.licensePreview);
    }
  }, [defaultValues, reset, isOpen]);

  const handleFileChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    setPreview: React.Dispatch<React.SetStateAction<string | undefined>>,
    fileField: keyof LabourFormData,
    defaultPreview?: string
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      setValue(fileField, file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setValue(fileField, undefined);
      setPreview(defaultPreview); 
    }
  };

  const handleFormSubmitInternal: SubmitHandler<LabourFormData> = (data) => {
    onSubmit({
      id: defaultValues?.id || crypto.randomUUID(),
      name: data.name,
      details: data.details,
      photoFile: data.photoFile,
      photoPreview: data.photoFile ? photoPreview : defaultValues?.photoPreview,
      phoneNo: data.phoneNo,
      emergencyPhoneNo: data.emergencyPhoneNo,
      aadhaarNo: data.aadhaarNo,
      panNo: data.panNo,
      aadhaarFile: data.aadhaarFile,
      aadhaarPreview: data.aadhaarFile ? aadhaarPreview : defaultValues?.aadhaarPreview,
      panFile: data.panFile,
      panPreview: data.panFile ? panPreview : defaultValues?.panPreview,
      licenseFile: data.licenseFile,
      licensePreview: data.licenseFile ? licensePreview : defaultValues?.licensePreview,
      salaryRate: data.salaryRate,
    });
    onClose();
  };
  
  const renderPreview = (previewUrl: string | undefined, altText: string, dataAiHint: string) => {
    if (!previewUrl) return null;
    if (previewUrl.startsWith('data:application/pdf')) {
      return <a href={previewUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center"><Eye className="mr-1 h-4 w-4" /> View PDF</a>;
    }
    return <Image src={previewUrl} alt={altText} width={100} height={60} className="rounded-md object-contain border" data-ai-hint={dataAiHint} />;
  };


  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        onClose();
      }
    }}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{defaultValues ? 'Edit Labour' : 'Add New Labour'}</DialogTitle>
          <DialogDescription>
            Please fill in the labour&apos;s information below. All required fields are marked.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleFormSubmitInternal)} className="space-y-4 py-4 overflow-y-auto max-h-[75vh] pr-3">
          <div className="flex flex-col items-center space-y-2">
            <Avatar className="h-24 w-24">
              <AvatarImage src={photoPreview} alt={defaultValues?.name || "Labour photo"} data-ai-hint="person portrait" />
              <AvatarFallback>
                <UserCircle2 className="h-16 w-16 text-muted-foreground" />
              </AvatarFallback>
            </Avatar>
            <Label htmlFor="photoFile" className="text-sm font-medium text-primary hover:underline cursor-pointer flex items-center gap-1">
              <FileUp className="h-4 w-4" /> {photoPreview ? "Change Photo" : "Upload Photo"}
            </Label>
            <Input 
              id="photoFile" 
              type="file" 
              accept="image/*" 
              onChange={(e) => handleFileChange(e, setPhotoPreview, 'photoFile', defaultValues?.photoPreview)} 
              className="hidden"
            />
             {errors.photoFile && <p className="text-xs text-destructive mt-1">{errors.photoFile.message}</p>}
          </div>

          <div>
            <Label htmlFor="name">Name</Label>
            <Input id="name" {...register('name')} className={errors.name ? 'border-destructive' : ''} />
            {errors.name && <p className="text-xs text-destructive mt-1">{errors.name.message}</p>}
          </div>
          <div>
            <Label htmlFor="details">Details</Label>
            <Textarea id="details" {...register('details')} className={errors.details ? 'border-destructive' : ''} />
            {errors.details && <p className="text-xs text-destructive mt-1">{errors.details.message}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="phoneNo" className="flex items-center"><Phone className="mr-2 h-4 w-4 text-muted-foreground" />Phone No.</Label>
              <Input id="phoneNo" {...register('phoneNo')} className={errors.phoneNo ? 'border-destructive' : ''} placeholder="Enter 10-digit mobile no."/>
              {errors.phoneNo && <p className="text-xs text-destructive mt-1">{errors.phoneNo.message}</p>}
            </div>
            <div>
              <Label htmlFor="emergencyPhoneNo" className="flex items-center"><Smartphone className="mr-2 h-4 w-4 text-muted-foreground" />Emergency Phone No.</Label>
              <Input id="emergencyPhoneNo" {...register('emergencyPhoneNo')} className={errors.emergencyPhoneNo ? 'border-destructive' : ''} placeholder="Enter 10-digit mobile no."/>
              {errors.emergencyPhoneNo && <p className="text-xs text-destructive mt-1">{errors.emergencyPhoneNo.message}</p>}
            </div>
          </div>

          <div>
            <Label htmlFor="salaryRate" className="flex items-center"><IndianRupee className="mr-1 h-4 w-4 text-muted-foreground" />Daily Salary Rate (₹)</Label>
            <Input 
              id="salaryRate" 
              type="number" 
              step="0.01" 
              {...register('salaryRate')} 
              className={errors.salaryRate ? 'border-destructive' : ''} 
              placeholder="Enter daily salary rate"
            />
            {errors.salaryRate && <p className="text-xs text-destructive mt-1">{errors.salaryRate.message}</p>}
          </div>


          <div>
            <Label htmlFor="aadhaarNo">Aadhaar No.</Label>
            <Input id="aadhaarNo" {...register('aadhaarNo')} className={errors.aadhaarNo ? 'border-destructive' : ''} placeholder="Enter 12-digit Aadhaar number"/>
            {errors.aadhaarNo && <p className="text-xs text-destructive mt-1">{errors.aadhaarNo.message}</p>}
          </div>
          <div>
            <Label htmlFor="panNo">PAN No.</Label>
            <Input id="panNo" {...register('panNo')} className={errors.panNo ? 'border-destructive' : ''} placeholder="Enter 10-character PAN number"/>
            {errors.panNo && <p className="text-xs text-destructive mt-1">{errors.panNo.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="aadhaarFile">Aadhaar Card</Label>
            {aadhaarPreview && <div className="mt-1 mb-2">{renderPreview(aadhaarPreview, "Aadhaar Card Preview", "document id")}</div>}
            <Input 
              id="aadhaarFile" 
              type="file" 
              accept="image/*,application/pdf" 
              onChange={(e) => handleFileChange(e, setAadhaarPreview, 'aadhaarFile', defaultValues?.aadhaarPreview)}
              className="file:text-primary file:font-semibold"
            />
            {errors.aadhaarFile && <p className="text-xs text-destructive mt-1">{errors.aadhaarFile.message}</p>}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="panFile">PAN Card</Label>
             {panPreview && <div className="mt-1 mb-2">{renderPreview(panPreview, "PAN Card Preview", "document id")}</div>}
            <Input 
              id="panFile" 
              type="file" 
              accept="image/*,application/pdf" 
              onChange={(e) => handleFileChange(e, setPanPreview, 'panFile', defaultValues?.panPreview)}
              className="file:text-primary file:font-semibold"
            />
            {errors.panFile && <p className="text-xs text-destructive mt-1">{errors.panFile.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="licenseFile">Driving License (Optional)</Label>
            {licensePreview && <div className="mt-1 mb-2">{renderPreview(licensePreview, "Driving License Preview", "document id")}</div>}
            <Input 
              id="licenseFile" 
              type="file" 
              accept="image/*,application/pdf" 
              onChange={(e) => handleFileChange(e, setLicensePreview, 'licenseFile', defaultValues?.licensePreview)}
              className="file:text-primary file:font-semibold"
            />
            {errors.licenseFile && <p className="text-xs text-destructive mt-1">{errors.licenseFile.message}</p>}
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground">
              {defaultValues ? 'Save Changes' : 'Add Labour'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
