import { z } from 'zod';

export const LoginSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(1, { message: "Password is required." }),
});

export type LoginFormData = z.infer<typeof LoginSchema>;

export const SupervisorSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
});

export type SupervisorFormData = z.infer<typeof SupervisorSchema>;

export const LaborerSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  phone: z.string().min(10, { message: "Phone number must be at least 10 digits." }).regex(/^\+?[0-9\s-()]*$/, { message: "Invalid phone number format."}),
  address: z.string().min(5, { message: "Address must be at least 5 characters." }),
  profilePhoto: z.any().optional(), // For file uploads, refine based on actual upload handling
  documents: z.any().optional(), // For file uploads
});

export type LaborerFormData = z.infer<typeof LaborerSchema>;

export const AttendanceSchema = z.object({
  date: z.date(),
  attendance: z.array(z.object({
    laborerId: z.string(),
    status: z.enum(['present', 'absent', 'leave']),
  })),
});

export type AttendanceFormData = z.infer<typeof AttendanceSchema>;
