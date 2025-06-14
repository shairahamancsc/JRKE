"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { LaborerSchema, type LaborerFormData } from "@/lib/schemas";
import { useToast } from "@/hooks/use-toast";
import { UserPlus, ImageUp, FileUp } from "lucide-react";
import type { Laborer } from "@/types";

interface LaborerFormProps {
  onSuccess?: (data: Laborer) => void;
  initialData?: Laborer | null;
}

export function LaborerForm({ onSuccess, initialData }: LaborerFormProps) {
  const { toast } = useToast();
  const form = useForm<LaborerFormData>({
    resolver: zodResolver(LaborerSchema),
    defaultValues: initialData 
      ? { name: initialData.name, phone: initialData.phone, address: initialData.address, profilePhoto: undefined, documents: undefined }
      : { name: "", phone: "", address: "", profilePhoto: undefined, documents: undefined },
  });

  function onSubmit(data: LaborerFormData) {
    // Simulate API call and file upload
    console.log("Laborer data:", data);
    if (data.profilePhoto) console.log("Profile Photo:", (data.profilePhoto as File).name);
    if (data.documents) console.log("Document:", (data.documents as File).name);
    
    const action = initialData ? "updated" : "added";

    const resultData: Laborer = {
      id: initialData?.id || String(Date.now()),
      ...data,
      createdAt: initialData?.createdAt || new Date().toISOString().split('T')[0],
      // In a real app, profilePhotoUrl and documentUrls would come from backend after upload
      profilePhotoUrl: data.profilePhoto ? URL.createObjectURL(data.profilePhoto as File) : initialData?.profilePhotoUrl,
      documentUrls: data.documents ? [URL.createObjectURL(data.documents as File)] : initialData?.documentUrls,
    };
    
    toast({
      title: `Laborer ${action}`,
      description: `Laborer ${data.name} has been successfully ${action}.`,
    });

    if (!initialData) {
      form.reset();
    }
    
    if (onSuccess) {
      onSuccess(resultData);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter laborer's full name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone Number</FormLabel>
              <FormControl>
                <Input type="tel" placeholder="+1 234 567 8900" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Address</FormLabel>
              <FormControl>
                <Textarea placeholder="Enter laborer's current address" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="profilePhoto"
          render={({ field: { onChange, value, ...rest } }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <ImageUp className="h-5 w-5" /> Profile Photo
              </FormLabel>
              <FormControl>
                 <Input 
                    type="file" 
                    accept="image/*" 
                    onChange={(e) => onChange(e.target.files ? e.target.files[0] : null)}
                    {...rest} 
                    className="file:text-primary file:font-medium"
                  />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="documents"
          render={({ field: { onChange, value, ...rest } }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <FileUp className="h-5 w-5" /> Documents (e.g., ID, Permit)
              </FormLabel>
              <FormControl>
                 <Input 
                    type="file" 
                    accept=".pdf,.doc,.docx,.jpg,.png"
                    onChange={(e) => onChange(e.target.files ? e.target.files[0] : null)}
                    {...rest}
                    className="file:text-primary file:font-medium"
                  />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full sm:w-auto" disabled={form.formState.isSubmitting}>
          <UserPlus className="mr-2 h-4 w-4" />
          {form.formState.isSubmitting ? (initialData ? "Updating..." : "Adding...") : (initialData ? "Update Laborer" : "Add Laborer")}
        </Button>
      </form>
    </Form>
  );
}
