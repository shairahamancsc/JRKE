
"use client";

import React, { useState, useEffect, lazy, Suspense } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, AlertTriangle } from 'lucide-react';
// import { MarkdownDisplay } from '@/components/reports/markdown-display'; // Lazy loaded
import { generateAttendanceReportAction } from '@/lib/actions';
import { useToast } from "@/hooks/use-toast";

const MarkdownDisplay = lazy(() => import('@/components/reports/markdown-display').then(module => ({ default: module.MarkdownDisplay })));

const attendanceReportSchema = z.object({
  workLogs: z.string().min(10, "Work logs are required and should be detailed."),
  timestampedPictureFile: z.instanceof(File, { message: "Timestamped picture is required." })
    .refine(file => file.size > 0, "Timestamped picture is required.")
    .refine(file => file.type.startsWith("image/"), "File must be an image."),
});

type AttendanceReportFormData = z.infer<typeof attendanceReportSchema>;

export default function AttendanceReportPage() {
  const [report, setReport] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<AttendanceReportFormData>({
    resolver: zodResolver(attendanceReportSchema),
  });

  const handleFormSubmit: SubmitHandler<AttendanceReportFormData> = async (data) => {
    setIsLoading(true);
    setError(null);
    setReport(null);

    try {
      const reader = new FileReader();
      reader.readAsDataURL(data.timestampedPictureFile);
      reader.onload = async () => {
        const pictureDataUrl = reader.result as string;
        const result = await generateAttendanceReportAction({
          workLogs: data.workLogs,
          timestampedPictures: pictureDataUrl,
        });

        if (result.success && result.report) {
          setReport(result.report);
          toast({ title: "Report Generated", description: "Attendance report successfully generated." });
          reset(); 
        } else {
          setError(result.error || "Failed to generate report.");
          toast({ title: "Error", description: result.error || "Failed to generate report.", variant: "destructive" });
        }
        setIsLoading(false); // Moved here from useEffect
      };
      reader.onerror = () => {
        setError("Failed to read the image file.");
        toast({ title: "Error", description: "Failed to read the image file.", variant: "destructive" });
        setIsLoading(false); // Moved here from useEffect
      };
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : "An unexpected error occurred.";
      setError(errorMessage);
      toast({ title: "Error", description: errorMessage, variant: "destructive" });
      setIsLoading(false); // Ensure loading stops on synchronous error
    }
  };
  
  // useEffect for setIsLoading can be removed as it's handled in onload/onerror and finally for other errors.
  // useEffect(() => {
  //   if (report !== null || error !== null) {
  //     setIsLoading(false);
  //   }
  // }, [report, error]);


  return (
    <div className="container mx-auto py-8">
      <Card className="max-w-2xl mx-auto shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-foreground">Generate Attendance Report</CardTitle>
          <CardDescription>
            Provide work logs and a timestamped picture to automatically generate a daily attendance report.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
            <div>
              <Label htmlFor="workLogs" className="font-semibold">Work Logs</Label>
              <Textarea
                id="workLogs"
                {...register('workLogs')}
                rows={8}
                placeholder="Enter detailed work logs including laborer names, work descriptions, and locations..."
                className={`mt-1 ${errors.workLogs ? 'border-destructive' : ''}`}
              />
              {errors.workLogs && <p className="text-xs text-destructive mt-1">{errors.workLogs.message}</p>}
            </div>

            <div>
              <Label htmlFor="timestampedPictureFile" className="font-semibold">Timestamped Picture</Label>
              <Input
                id="timestampedPictureFile"
                type="file"
                accept="image/*"
                {...register('timestampedPictureFile')}
                className={`mt-1 file:text-primary file:font-semibold ${errors.timestampedPictureFile ? 'border-destructive' : ''}`}
              />
              {errors.timestampedPictureFile && <p className="text-xs text-destructive mt-1">{errors.timestampedPictureFile.message}</p>}
            </div>
            
            <Button type="submit" disabled={isLoading} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...
                </>
              ) : (
                'Generate Report'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {error && (
        <Card className="mt-6 max-w-2xl mx-auto bg-destructive/10 border-destructive shadow-lg">
          <CardHeader className="flex flex-row items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <CardTitle className="text-destructive">Error Generating Report</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-destructive">{error}</p>
          </CardContent>
        </Card>
      )}

      {report && (
        <Suspense fallback={
          <div className="mt-6 max-w-2xl mx-auto p-6 flex items-center justify-center bg-card rounded-lg shadow-lg">
            <Loader2 className="h-5 w-5 animate-spin text-primary mr-2" />
            <span>Loading Report...</span>
          </div>
        }>
          <MarkdownDisplay markdownContent={report} />
        </Suspense>
      )}
    </div>
  );
}
