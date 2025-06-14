"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { SupervisorSchema, type SupervisorFormData } from "@/lib/schemas";
import { useToast } from "@/hooks/use-toast";
import { UserPlus } from "lucide-react";
import type { Supervisor } from "@/types";


interface SupervisorFormProps {
  onSuccess?: (data: Supervisor) => void; // Changed to Supervisor to include ID and CreatedAt for optimistic updates
  initialData?: Supervisor | null; // For editing
}

export function SupervisorForm({ onSuccess, initialData }: SupervisorFormProps) {
  const { toast } = useToast();
  const form = useForm<SupervisorFormData>({
    resolver: zodResolver(SupervisorSchema),
    defaultValues: initialData 
      ? { name: initialData.name, email: initialData.email, password: "" } // Password not pre-filled for edit
      : { name: "", email: "", password: "" },
  });

  function onSubmit(data: SupervisorFormData) {
    // Simulate API call
    console.log("Supervisor data:", data);
    const action = initialData ? "updated" : "created";
    
    // For optimistic update, create a Supervisor-like object
    const resultData: Supervisor = {
      id: initialData?.id || String(Date.now()), // Use existing ID or generate new one
      ...data,
      createdAt: initialData?.createdAt || new Date().toISOString().split('T')[0], // Use existing or new date
    };
    
    toast({
      title: `Supervisor ${action}`,
      description: `Supervisor ${data.name} has been successfully ${action}.`,
    });
    
    if (!initialData) { // Reset form only if it's not an edit form (or handle edit completion logic)
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
                <Input placeholder="Enter supervisor's full name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="supervisor@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{initialData ? "New Password (optional)" : "Password"}</FormLabel>
              <FormControl>
                <Input type="password" placeholder={initialData ? "Leave blank to keep current" : "Create a strong password"} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full sm:w-auto" disabled={form.formState.isSubmitting}>
          <UserPlus className="mr-2 h-4 w-4" />
          {form.formState.isSubmitting ? (initialData ? "Updating..." : "Creating...") : (initialData ? "Update Supervisor" : "Create Supervisor")}
        </Button>
      </form>
    </Form>
  );
}
