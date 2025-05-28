
"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Search, Building2, MapPin, BadgeCheck, AlertTriangle } from 'lucide-react';
import { getGstinDetails, type GetGstinDetailsInput, type GetGstinDetailsOutput } from '@/ai/flows/get-gstin-details-flow';

export default function GstCalculatorPage() {
  const [gstin, setGstin] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [gstDetails, setGstDetails] = useState<GetGstinDetailsOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleGstinLookup = async () => {
    if (gstin.length !== 15) {
      setError("GSTIN must be 15 characters long.");
      toast({ variant: "destructive", title: "Invalid GSTIN", description: "Please enter a valid 15-character GSTIN." });
      return;
    }
    setIsLoading(true);
    setError(null);
    setGstDetails(null);

    try {
      const result = await getGstinDetails({ gstin });
      if (result.error) {
        setError(result.error);
        toast({ variant: "destructive", title: "GSTIN Lookup Failed", description: result.error });
      } else {
        setGstDetails(result);
         if (!result.legalName && !result.tradeName) { // If no names, assume not found by mock
            toast({ variant: "default", title: "GSTIN Not Found", description: "The provided GSTIN was not found (mock response)." });
        }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "An unexpected error occurred.";
      setError(message);
      toast({ variant: "destructive", title: "Error", description: message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <Card className="max-w-2xl mx-auto shadow-lg">
        <CardHeader>
          <div className="flex items-center gap-3 mb-2">
            <Search className="h-8 w-8 text-primary" />
            <CardTitle className="text-2xl font-bold">GSTIN Validator</CardTitle>
          </div>
          <CardDescription>Enter a GSTIN to fetch and validate its details. (Uses a mock API for demonstration)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="gstin">GSTIN Number</Label>
            <div className="flex space-x-2">
              <Input
                id="gstin"
                value={gstin}
                onChange={(e) => setGstin(e.target.value.toUpperCase())}
                placeholder="Enter 15-character GSTIN"
                maxLength={15}
                className={error ? 'border-destructive' : ''}
                disabled={isLoading}
              />
              <Button onClick={handleGstinLookup} disabled={isLoading || gstin.length !== 15}>
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                <span className="ml-2 sm:inline hidden">Validate</span>
              </Button>
            </div>
            {error && !gstDetails && <p className="text-sm text-destructive mt-1">{error}</p>}
          </div>

          {gstDetails && !gstDetails.error && (gstDetails.legalName || gstDetails.tradeName) && (
            <Card className="mt-4 bg-muted/50 p-4 border">
              <CardHeader className="p-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-primary" />
                  {gstDetails.legalName || gstDetails.tradeName || "Business Details"}
                </CardTitle>
                {gstDetails.tradeName && gstDetails.legalName && gstDetails.tradeName !== gstDetails.legalName && (
                  <CardDescription className="text-sm">Trade Name: {gstDetails.tradeName}</CardDescription>
                )}
              </CardHeader>
              <CardContent className="space-y-2 text-sm p-2">
                {gstDetails.status && (
                  <div className="flex items-center gap-2">
                    <BadgeCheck className="h-4 w-4 text-green-600" />
                    <span>Status: <span className="font-semibold">{gstDetails.status}</span></span>
                  </div>
                )}
                {gstDetails.taxpayerType && (
                  <div className="flex items-center gap-2">
                    <BadgeCheck className="h-4 w-4 text-muted-foreground" />
                    <span>Taxpayer Type: <span className="font-semibold">{gstDetails.taxpayerType}</span></span>
                  </div>
                )}
                {gstDetails.address && (
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <span>Address: <span className="font-semibold">{gstDetails.address}</span></span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
          {gstDetails && gstDetails.error && (
             <div className="mt-4 p-3 rounded-md bg-destructive/10 border border-destructive/30 text-destructive text-sm flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 flex-shrink-0" />
                <span>{gstDetails.error}</span>
             </div>
          )}
           {gstDetails && !gstDetails.error && !gstDetails.legalName && !gstDetails.tradeName && !isLoading &&(
             <div className="mt-4 p-3 rounded-md bg-yellow-100 dark:bg-yellow-800/30 border border-yellow-300 dark:border-yellow-700 text-yellow-700 dark:text-yellow-300 text-sm flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 flex-shrink-0" />
                <span>GSTIN not found (mock response).</span>
             </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
