
"use client";

import React, { useState } from 'react';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Download, Loader2, Award, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const ownerTitleOptions = [
  { value: 'Mr.', label: 'Mr.' },
  { value: 'Mrs.', label: 'Mrs.' },
  { value: 'Ms.', label: 'Ms.' },
];

const installationCategoryOptions = [
  { value: 'Domestic', label: 'Domestic' },
  { value: 'Commercial', label: 'Commercial' },
  { value: 'Agricultural', label: 'Agricultural' },
  { value: 'Industrial', label: 'Industrial' },
  { value: 'Other', label: 'Other' },
];

const completionCertificateSchema = z.object({
  ownerTitle: z.string().min(1, "Title is required"),
  ownerName: z.string().min(1, "Owner name is required"),
  village: z.string().min(1, "Village is required"),
  district: z.string().min(1, "District is required"),
  state: z.string().min(1, "State is required"),
  installationCategory: z.string().min(1, "Category is required"),
  installationPurposeDetails: z.string().min(1, "Purpose details are required"),
  equipment: z.string().min(1, "Equipment details are required"),
  totalLoad: z.coerce.number().positive("Total load must be a positive number"),
  typeOfSystemWiring: z.string().optional(),
  conductorSizeDetails: z.string().optional(),
  overheadLineSpec: z.string().optional(),
  lengthOfLine: z.string().optional(),
  averageSpanLength: z.string().optional(),
});

type CompletionCertificateFormData = z.infer<typeof completionCertificateSchema>;

export default function CompletionCertificatePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPreviewTemplate, setShowPreviewTemplate] = useState(false);
  const { toast } = useToast();

  const { control, register, handleSubmit, watch, formState: { errors } } = useForm<CompletionCertificateFormData>({
    resolver: zodResolver(completionCertificateSchema),
    defaultValues: {
      ownerTitle: 'Mr.',
      state: 'Odisha', // Default state
      installationCategory: 'Domestic',
      // Optional fields are undefined by default
    }
  });

  const currentData = watch();

  const generatePdf = async () => {
    setIsLoading(true);
    const pdfTemplateElement = document.getElementById('completion-pdf-template');

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
      pdfTemplateElement.style.display = 'block';
    }
    await new Promise(resolve => setTimeout(resolve, 100)); // Allow time for render

    try {
      const canvas = await html2canvas(pdfTemplateElement, { scale: 2, useCORS: true, logging: true });
      const imgData = canvas.toDataURL('image/png');

      if (!imgData || imgData === 'data:,') {
        toast({
          title: 'PDF Generation Error',
          description: 'Failed to capture form content for PDF. The captured image was empty.',
          variant: 'destructive',
        });
        throw new Error("html2canvas captured an empty image.");
      }

      const pdf = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const scaledWidth = imgWidth * ratio;
      const scaledHeight = imgHeight * ratio;
      const xOffset = (pdfWidth - scaledWidth) / 2;
      const yOffset = Math.max(20, (pdfHeight - scaledHeight) / 2);

      pdf.addImage(imgData, 'PNG', xOffset, yOffset, scaledWidth, scaledHeight);
      pdf.save('completion-certificate.pdf');

      toast({
        title: 'PDF Downloaded',
        description: 'The completion certificate PDF has been generated and downloaded.',
      });

    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: 'PDF Generation Failed',
        description: 'An error occurred while generating the PDF.',
        variant: 'destructive',
      });
    } finally {
      if (wasInitiallyHidden) {
        pdfTemplateElement.style.display = 'none';
      }
      setIsLoading(false);
    }
  };

  const onSubmit: SubmitHandler<CompletionCertificateFormData> = () => {
    generatePdf();
  };

  const togglePreview = () => {
    setShowPreviewTemplate(!showPreviewTemplate);
  };
  
  const pdfTemplateStyle: React.CSSProperties = {
      display: showPreviewTemplate ? 'block' : 'none',
      width: '210mm',
      minHeight: '297mm',
      padding: '15mm', // Adjusted padding slightly
      fontFamily: 'Times New Roman, serif', // Common for certificates
      fontSize: '12pt',
      lineHeight: '1.6',
      color: '#000',
      backgroundColor: '#fff',
      marginTop: '20px',
      border: showPreviewTemplate ? '1px solid #ccc' : 'none',
      boxSizing: 'border-box',
  };


  return (
    <div className="container mx-auto py-8">
      <Card className="max-w-3xl mx-auto shadow-xl">
        <CardHeader>
          <div className="flex items-center gap-3 mb-2">
            <Award className="h-8 w-8 text-primary" />
            <CardTitle className="text-2xl font-bold">Completion Certificate</CardTitle>
          </div>
          <CardDescription>Fill in the details to generate the Completion Certificate.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label className="font-semibold text-md">Owner Information</Label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-md bg-muted/20">
                <div>
                  <Label htmlFor="ownerTitle">Title</Label>
                  <Controller
                    name="ownerTitle"
                    control={control}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <SelectTrigger id="ownerTitle" className={errors.ownerTitle ? 'border-destructive' : ''}>
                          <SelectValue placeholder="Select title" />
                        </SelectTrigger>
                        <SelectContent>
                          {ownerTitleOptions.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.ownerTitle && <p className="text-xs text-destructive mt-1">{errors.ownerTitle.message}</p>}
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="ownerName">Owner Name</Label>
                  <Input id="ownerName" {...register('ownerName')} className={errors.ownerName ? 'border-destructive' : ''} placeholder="Full name of owner" />
                  {errors.ownerName && <p className="text-xs text-destructive mt-1">{errors.ownerName.message}</p>}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="font-semibold text-md">Installation Address</Label>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-md bg-muted/20">
                <div>
                  <Label htmlFor="village">Village/Town</Label>
                  <Input id="village" {...register('village')} className={errors.village ? 'border-destructive' : ''} placeholder="Village or Town name"/>
                  {errors.village && <p className="text-xs text-destructive mt-1">{errors.village.message}</p>}
                </div>
                <div>
                  <Label htmlFor="district">District</Label>
                  <Input id="district" {...register('district')} className={errors.district ? 'border-destructive' : ''} placeholder="District name"/>
                  {errors.district && <p className="text-xs text-destructive mt-1">{errors.district.message}</p>}
                </div>
                <div>
                  <Label htmlFor="state">State</Label>
                  <Input id="state" {...register('state')} className={errors.state ? 'border-destructive' : ''} placeholder="State name"/>
                  {errors.state && <p className="text-xs text-destructive mt-1">{errors.state.message}</p>}
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label className="font-semibold text-md">Installation Details</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-md bg-muted/20">
                <div>
                  <Label htmlFor="installationCategory">Category of Installation</Label>
                  <Controller
                    name="installationCategory"
                    control={control}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <SelectTrigger id="installationCategory" className={errors.installationCategory ? 'border-destructive' : ''}>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {installationCategoryOptions.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.installationCategory && <p className="text-xs text-destructive mt-1">{errors.installationCategory.message}</p>}
                </div>
                 <div>
                  <Label htmlFor="installationPurposeDetails">Purpose Details</Label>
                  <Input id="installationPurposeDetails" {...register('installationPurposeDetails')} className={errors.installationPurposeDetails ? 'border-destructive' : ''} placeholder="e.g., Domestic use, Shop lighting"/>
                  {errors.installationPurposeDetails && <p className="text-xs text-destructive mt-1">{errors.installationPurposeDetails.message}</p>}
                </div>
                <div>
                  <Label htmlFor="equipment">Equipment (for Voltage/System of Supply)</Label>
                  <Input id="equipment" {...register('equipment')} className={errors.equipment ? 'border-destructive' : ''} placeholder="e.g., Lighting, Fans, Motor"/>
                  {errors.equipment && <p className="text-xs text-destructive mt-1">{errors.equipment.message}</p>}
                </div>
                <div>
                  <Label htmlFor="totalLoad">Total Load (KW)</Label>
                  <Input id="totalLoad" type="number" step="0.1" {...register('totalLoad')} className={errors.totalLoad ? 'border-destructive' : ''} placeholder="e.g., 1.5"/>
                  {errors.totalLoad && <p className="text-xs text-destructive mt-1">{errors.totalLoad.message}</p>}
                </div>
              </div>
            </div>

            <div className="space-y-2">
                <Label className="font-semibold text-md">Additional Wiring Information (Optional)</Label>
                <div className="p-4 border rounded-md bg-muted/20 space-y-4">
                    <div>
                        <Label htmlFor="typeOfSystemWiring">b) Type of system of wiring:</Label>
                        <Textarea id="typeOfSystemWiring" {...register('typeOfSystemWiring')} placeholder="Describe system of wiring" rows={2}/>
                    </div>
                    <div>
                        <Label htmlFor="conductorSizeDetails">c) Conductor Size:</Label>
                        <Textarea id="conductorSizeDetails" {...register('conductorSizeDetails')} placeholder="Specify conductor size if different or additional" rows={2}/>
                    </div>
                    <div>
                        <Label htmlFor="overheadLineSpec">ii) Specification of supports of overhead line:</Label>
                        <Textarea id="overheadLineSpec" {...register('overheadLineSpec')} placeholder="Details of supports" rows={2}/>
                    </div>
                    <div>
                        <Label htmlFor="lengthOfLine">iii) Length of the line:</Label>
                        <Input id="lengthOfLine" {...register('lengthOfLine')} placeholder="e.g., 50 meters"/>
                    </div>
                    <div>
                        <Label htmlFor="averageSpanLength">iv) Average Span Length:</Label>
                        <Input id="averageSpanLength" {...register('averageSpanLength')} placeholder="e.g., 20 meters"/>
                    </div>
                </div>
            </div>

          </CardContent>
          <CardFooter className="flex flex-col sm:flex-row gap-2 justify-end">
            <Button type="button" variant="outline" onClick={togglePreview} className="w-full sm:w-auto">
              {showPreviewTemplate ? <EyeOff className="mr-2 h-4 w-4" /> : <Eye className="mr-2 h-4 w-4" />}
              {showPreviewTemplate ? 'Hide Preview' : 'Preview Form'}
            </Button>
            <Button type="submit" className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground" disabled={isLoading}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
              Generate & Download PDF
            </Button>
          </CardFooter>
        </form>
      </Card>

      {/* PDF Template */}
      <div id="completion-pdf-template" style={pdfTemplateStyle} className="text-black bg-white">
        <div style={{ textAlign: 'center', marginBottom: '30px', fontWeight: 'bold', fontSize: '16pt', textDecoration: 'underline' }}>
          COMPLETION CERTIFICATE
        </div>
        
        <p style={{ marginBottom: '20px', textIndent: '30pt', fontStyle: 'italic' }}>
          I/We certify that the installation detailed below has been installed by me/us and tested and that to the best of my knowledge and belief it complies with Indian Electricity Rules 1956 as earls IS 732-1963 Code of Practice for electrical wiring installation (System voltage not exceeding 650 Volt) (Revised) and is ready for inspection.
        </p>

        <div style={{ marginBottom: '15px' }}>
          <span style={{ display: 'inline-block', width: '200pt' }}>i. Name and Address of the Owner</span>: <strong>{currentData.ownerTitle || '[Title]'}. {currentData.ownerName || '[Applicant Name]'}</strong>
        </div>
        <div style={{ marginBottom: '15px' }}>
          <span style={{ display: 'inline-block', width: '200pt' }}>Of the Electrical Installation</span>: At. {currentData.village || '[Village]'}, Dist. {currentData.district || '[District]'}, {currentData.state || '[State]'}
        </div>
        <div style={{ marginBottom: '15px' }}>
          <span style={{ display: 'inline-block', width: '200pt' }}>Purpose of installation</span>: {currentData.installationCategory || '[Category]'} {currentData.installationPurposeDetails || '[Purpose Details]'}
        </div>
        <div style={{ marginBottom: '20px' }}>
          <span style={{ display: 'inline-block', width: '200pt' }}>ii. Voltage and System of Supply</span>: 220V, 1-Ph, 50HZ
          <br />
          <span style={{ display: 'inline-block', width: '200pt', visibility: 'hidden' }}>ii. Voltage and System of Supply</span>&nbsp;&nbsp;{currentData.equipment || '[Equipment]'}
        </div>

        <div style={{ marginBottom: '5px' }}><span style={{ display: 'inline-block', width: '200pt' }}>Type of wiring Conductor Size</span>: Conceal wiring</div>
        <div style={{ marginBottom: '5px' }}><span style={{ display: 'inline-block', width: '200pt' }}>Conductor Size</span>: 6,4,2.5, 1.5,1 Sqmm Copper PVC Cable</div>
        <div style={{ marginBottom: '15px' }}><span style={{ display: 'inline-block', width: '200pt' }}>Total Load</span>: {currentData.totalLoad || '[Load]'} KW.</div>
        
        <p style={{ fontSize: '10pt', fontStyle: 'italic', marginBottom: '10px' }}>Note : The above is illustrative</p>
        <p style={{ fontSize: '10pt', marginBottom: '15px' }}>
          Any Other information not included in the above coulomb
          But stated in the plate should be mentioned fully.
        </p>

        <div style={{ marginBottom: '5px' }}>
            <span style={{ display: 'inline-block', width: '280pt' }}>b) Type of system of wiring:</span>
            <span>{currentData.typeOfSystemWiring || 'N/A'}</span>
        </div>
        <div style={{ marginBottom: '5px' }}>
            <span style={{ display: 'inline-block', width: '280pt' }}>c) Conductor Size:</span>
            <span>{currentData.conductorSizeDetails || 'N/A'}</span>
        </div>
        <div style={{ marginBottom: '5px' }}>
          <span style={{ display: 'inline-block', width: '280pt' }}>d) if the work involves installation
          of overhead line and/or Underground Cable</span>: LT 1-Ph Service Connection.
        </div>
        <div style={{ paddingLeft: '20pt' }}>
            <div style={{ marginBottom: '5px' }}>
                <span style={{ display: 'inline-block', width: '260pt' }}>i) Conductor/Cable Size</span>: 4Sqmm Alu Cable
            </div>
            <div style={{ marginBottom: '5px' }}>
                <span style={{ display: 'inline-block', width: '260pt' }}>ii) and specification of supports of overhead line</span>: {currentData.overheadLineSpec || 'N/A'}
            </div>
            <div style={{ marginBottom: '5px' }}>
                <span style={{ display: 'inline-block', width: '260pt' }}>iii) Length of the line</span>: {currentData.lengthOfLine || 'N/A'}
            </div>
            <div style={{ marginBottom: '5px' }}>
                <span style={{ display: 'inline-block', width: '260pt' }}>iv) Average Span Length</span>: {currentData.averageSpanLength || 'N/A'}
            </div>
        </div>
        <div style={{ marginBottom: '20px' }}>
          <span style={{ display: 'inline-block', width: '280pt' }}>v) State if clearance are maintaine2
          As per relavant section of I.E.R.1956</span>: YES
        </div>
        
        {/* Placeholder for contractor details if needed in future */}
        {/*
        <div style={{ marginTop: '30px', paddingTop: '15px', borderTop: '1px dashed #ccc' }}>
          <p>Details of Contractor (if applicable)</p>
          <p>Name: _________________________</p>
          <p>License No: ____________________</p>
          <p>Signature: _____________________</p>
        </div>
        */}

      </div>
    </div>
  );
}
