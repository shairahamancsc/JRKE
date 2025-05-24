
"use client";

import React, { useState } from 'react';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Printer, Loader2, FileText, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { format } from 'date-fns';

const titleOptions = [
  { value: 'Mr.', label: 'Mr.' },
  { value: 'Mrs.', label: 'Mrs.' },
  { value: 'Ms.', label: 'Ms.' },
];

const relationOptions = [
  { value: 'S/o', label: 'Son of (S/o)' },
  { value: 'D/o', label: 'Daughter of (D/o)' },
  { value: 'W/o', label: 'Wife of (W/o)' },
  { value: 'H/o', label: 'Husband of (H/o)' },
];

const declarationFormSchema = z.object({
  deponentTitle: z.string().min(1, "Title is required"),
  deponentName: z.string().min(1, "Applicant name is required"),
  relation: z.string().min(1, "Relation is required"),
  relativeName: z.string().min(1, "Relative's name is required"),
  contactNo: z.string().min(10, "Contact number must be 10 digits").max(10, "Contact number must be 10 digits").regex(/^\d{10}$/, "Invalid contact number"),
});

type DeclarationFormData = z.infer<typeof declarationFormSchema>;

export default function SelfDeclarationFormPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPreviewTemplate, setShowPreviewTemplate] = useState(false);
  const { toast } = useToast();

  const { control, register, handleSubmit, watch, formState: { errors } } = useForm<DeclarationFormData>({
    resolver: zodResolver(declarationFormSchema),
    defaultValues: {
      deponentTitle: 'Mr.',
      relation: 'S/o',
      relativeName: '',
    }
  });

  const generatePdf = async (data: DeclarationFormData) => {
    setIsLoading(true);
    const pdfTemplateElement = document.getElementById('pdf-template');

    if (!pdfTemplateElement) {
      toast({
        title: 'Error',
        description: 'PDF template not found. Cannot generate PDF.',
        variant: 'destructive',
      });
      setIsLoading(false);
      return;
    }
    
    const wasInitiallyHidden = !showPreviewTemplate;

    if (wasInitiallyHidden) {
      // If it was hidden by the preview state, make it visible for capture
      pdfTemplateElement.style.display = 'block';
    }
    // Ensure content is rendered
    // By using currentData from watch, React should keep the hidden div populated.
    // We add a small delay to ensure the browser has painted the up-to-date content.
    await new Promise(resolve => setTimeout(resolve, 100));


    try {
      const canvas = await html2canvas(pdfTemplateElement, {
        scale: 2, 
        useCORS: true,
        logging: true, // Enable logging for html2canvas
      });
      const imgData = canvas.toDataURL('image/png');

      if (!imgData || imgData === 'data:,') {
        toast({
          title: 'PDF Generation Error',
          description: 'Failed to capture form content for PDF. The captured image was empty.',
          variant: 'destructive',
        });
        throw new Error("html2canvas captured an empty image.");
      }
      
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'pt', 
        format: 'a4',
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      
      const scaledWidth = imgWidth * ratio;
      const scaledHeight = imgHeight * ratio;

      const xOffset = (pdfWidth - scaledWidth) / 2;
      // Add a small top margin within the PDF
      const yOffset = Math.max(20, (pdfHeight - scaledHeight) / 2); // Ensure at least 20pt margin or centered

      pdf.addImage(imgData, 'PNG', xOffset, yOffset, scaledWidth, scaledHeight);
      pdf.output('dataurlnewwindow'); 

      toast({
        title: 'PDF Generated',
        description: 'The self-declaration PDF has been generated and opened in a new tab.',
      });

    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: 'PDF Generation Failed',
        description: 'An error occurred while generating the PDF. Please check console for details.',
        variant: 'destructive',
      });
    } finally {
       if (wasInitiallyHidden) {
        // If we made it visible only for capture, hide it again
        pdfTemplateElement.style.display = 'none';
       }
       // If it was already visible due to showPreviewTemplate, leave it as is.
      setIsLoading(false);
    }
  };

  const onSubmit: SubmitHandler<DeclarationFormData> = (data) => {
    generatePdf(data);
  };

  const togglePreview = () => {
    setShowPreviewTemplate(!showPreviewTemplate);
  };

  const currentData = watch(); 

  return (
    <div className="container mx-auto py-8">
      <Card className="max-w-2xl mx-auto shadow-xl">
        <CardHeader>
           <div className="flex items-center gap-3 mb-2">
            <FileText className="h-8 w-8 text-primary" />
            <CardTitle className="text-2xl font-bold">Self Declaration Form (TPSODL)</CardTitle>
          </div>
          <CardDescription>Fill in the details to generate the self-declaration document for a new electricity connection.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="deponentTitle">Applicant Title</Label>
                <Controller
                  name="deponentTitle"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <SelectTrigger id="deponentTitle" className={errors.deponentTitle ? 'border-destructive' : ''}>
                        <SelectValue placeholder="Select title" />
                      </SelectTrigger>
                      <SelectContent>
                        {titleOptions.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.deponentTitle && <p className="text-xs text-destructive mt-1">{errors.deponentTitle.message}</p>}
              </div>
              <div>
                <Label htmlFor="deponentName">Applicant Name</Label>
                <Input id="deponentName" {...register('deponentName')} className={errors.deponentName ? 'border-destructive' : ''} placeholder="Full name of applicant" />
                {errors.deponentName && <p className="text-xs text-destructive mt-1">{errors.deponentName.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-1">
                <Label htmlFor="relation">Relation</Label>
                <Controller
                  name="relation"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <SelectTrigger id="relation" className={errors.relation ? 'border-destructive' : ''}>
                        <SelectValue placeholder="Select relation" />
                      </SelectTrigger>
                      <SelectContent>
                        {relationOptions.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.relation && <p className="text-xs text-destructive mt-1">{errors.relation.message}</p>}
              </div>
              <div className="md:col-span-1">
                <Label htmlFor="relativeName">Relative's Name</Label>
                <Input id="relativeName" {...register('relativeName')} className={errors.relativeName ? 'border-destructive' : ''} placeholder="Full name of relative"/>
                {errors.relativeName && <p className="text-xs text-destructive mt-1">{errors.relativeName.message}</p>}
              </div>
            </div>
            <div>
              <Label htmlFor="contactNo">Contact No.</Label>
              <Input id="contactNo" type="tel" {...register('contactNo')} className={errors.contactNo ? 'border-destructive' : ''} placeholder="Applicant's 10-digit contact number"/>
              {errors.contactNo && <p className="text-xs text-destructive mt-1">{errors.contactNo.message}</p>}
            </div>

          </CardContent>
          <CardFooter className="flex flex-col sm:flex-row gap-2 justify-end">
            <Button type="button" variant="outline" onClick={togglePreview} className="w-full sm:w-auto">
              {showPreviewTemplate ? <EyeOff className="mr-2 h-4 w-4" /> : <Eye className="mr-2 h-4 w-4" />}
              {showPreviewTemplate ? 'Hide Preview' : 'Preview Form'}
            </Button>
            <Button type="submit" className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground" disabled={isLoading}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Printer className="mr-2 h-4 w-4" />}
              Generate & Print PDF
            </Button>
          </CardFooter>
        </form>
      </Card>

      {/* Template for PDF Generation - its visibility is now toggled by showPreviewTemplate state */}
      <div
        id="pdf-template"
        style={{ 
          display: showPreviewTemplate ? 'block' : 'none', // Controlled by state
          width: '210mm', 
          minHeight: '297mm', 
          padding: '20mm', 
          fontFamily: 'Arial, sans-serif', 
          fontSize: '11pt', 
          lineHeight: '1.5',
          color: '#000', 
          backgroundColor: '#fff',
          marginTop: '20px', // Add some space when previewing
          border: showPreviewTemplate ? '1px solid #ccc' : 'none', // Border when previewing
        }}
        className="bg-white text-black"
      >
        <div style={{ textAlign: 'center', marginBottom: '20px', fontWeight: 'bold', fontSize: '14pt' }}>
          SELF DECLARATION
        </div>
        <div style={{ textAlign: 'right', marginBottom: '20px', fontSize: '10pt' }}>
          Annexure-06
        </div>

        <p style={{ marginBottom: '15px', textIndent: '0px' }}>
          I, {currentData.deponentTitle || '[Title]'} {currentData.deponentName || '[Applicant Name]'} {currentData.relation || '[Relation]'}. {currentData.relativeName || '[Relative Name]'} have applied for a single-phase new electricity connection from the authority of TPSODL.
        </p>

        <ol style={{ listStyleType: 'decimal', paddingLeft: '20px', marginBottom: '15px' }}>
          <li style={{ marginBottom: '10px' }}>
            I confirm that there is no electricity dues in my name or in the name of my spouse, son, daughter, parent or other's in my family or on applied premises related to any connection of TPSODL or any other Discom in Odisha.
          </li>
          <li style={{ marginBottom: '10px' }}>
            If any electricity energy charges and/or any other non-energy charges and/or Enforcement penalty bill are found at a later date and are due and payable to TPSODL which remained unpaid by me or my family member or erstwhile owner/occupier of the premises/ land shall be recoverable from me. On failure/ inability to pay such claim of TPSODL towards the charges mentioned above, TPSODL shall within its right:
            <ol style={{ listStyleType: 'lower-alpha', paddingLeft: '20px', marginTop: '5px' }}>
              <li style={{ marginBottom: '5px' }}>To claim and collect such outstanding amount against my name, premise, building, land etc., and/or.</li>
              <li style={{ marginBottom: '5px' }}>To claim and collect such outstanding amount against my name, premise, building, land etc., and/or.</li>
              <li>To disconnect the electricity connection on non-payment of the said dues.</li>
            </ol>
          </li>
          <li style={{ marginBottom: '10px' }}>
            The originals of documents/certificates uploaded in portal are available with me and can be inspected by the Licensee at any time. In case of any failure to produce the same, the Licensee may disconnect the connection granted owing to such failure, reluctance on my part to produce/allow the inspection of said documents/certificates.
          </li>
          <li style={{ marginBottom: '10px' }}>
            All electrical works done within the premises are as per Central Electricity Authority (Measures relating to safety and Electricity Supply) Regulations, 2010, as amended from time to time and the internal wiring at the premises has been tested by a Licensed Electrical Contractor and the test certificate is available with me.
          </li>
          <li style={{ marginBottom: '10px' }}>
            The consumer has to obtain at his own expense necessary way-leave, if required licensee (TPSODL), sanction permission or other right or interest from the adjoining owner or co-owner. It shall not be incumbent upon the licensee / supplier to ascertain the validity or adequacy of the way-leave, licensee, sanction, or other right or interest obtained by the applicant. The consumer has to give right of way, if required for extending service connection/LT extension.
          </li>
        </ol>

        <p style={{ marginBottom: '20px' }}>
          I, the deponent/applicant do hereby solemnly verify that the contents of the above declaration are true and correct to the best of my knowledge and nothing has been concealed there from.
          Verified at Gopalpur, Odisha on {format(new Date(), "PPP")}.
        </p>

        <div style={{ marginTop: '40px' }}>
          <div style={{ fontWeight: 'bold', marginBottom: '10px' }}>DEPONENT/APPLICANT</div>
          <div style={{ marginBottom: '5px' }}>Name: {currentData.deponentName || '[Applicant Name]'}</div>
          <div style={{ marginBottom: '20px' }}>Contact No: {currentData.contactNo || '[Contact No.]'}</div>
          <div>Signature: _________________________</div>
        </div>
      </div>
    </div>
  );
}

