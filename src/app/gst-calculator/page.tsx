
"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Calculator, RotateCcw, IndianRupee, CheckCircle, XCircle, ShieldCheck, Building2, MapPin, Loader2 } from 'lucide-react';
import { getGstinDetails, type GetGstinDetailsOutput } from '@/ai/flows/get-gstin-details-flow';
import { useToast } from '@/hooks/use-toast';

const gstRates = [
  { label: '0%', value: 0 },
  { label: '3%', value: 3 },
  { label: '5%', value: 5 },
  { label: '12%', value: 12 },
  { label: '18%', value: 18 },
  { label: '28%', value: 28 },
];

type CalculationBase = 'exclusive' | 'inclusive';

interface GstinValidationDisplayResult {
  isValid: boolean;
  message: string;
  isFormatCheck?: boolean; // To distinguish format check messages from API results
}

// Regex for GSTIN validation (covers format, not checksum algorithm)
const GSTIN_REGEX_PATTERN = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-HJ-NP-Z]{1}Z[0-9A-Z]{1}$/;


export default function GstCalculatorPage() {
  // State for GST Calculator
  const [amountStr, setAmountStr] = useState<string>('');
  const [selectedGstRate, setSelectedGstRate] = useState<number>(18);
  const [calculationBase, setCalculationBase] = useState<CalculationBase>('exclusive');
  const [netPriceResult, setNetPriceResult] = useState<string | null>(null);
  const [gstPayableResult, setGstPayableResult] = useState<string | null>(null);
  const [grossPriceResult, setGrossPriceResult] = useState<string | null>(null);
  const [calculatorError, setCalculatorError] = useState<string | null>(null);

  // State for GSTIN Validator
  const [gstin, setGstin] = useState<string>('');
  const [gstinValidationDisplay, setGstinValidationDisplay] = useState<GstinValidationDisplayResult | null>(null);
  const [gstinDetails, setGstinDetails] = useState<GetGstinDetailsOutput | null>(null);
  const [isFetchingGstinDetails, setIsFetchingGstinDetails] = useState<boolean>(false);
  const { toast } = useToast();


  const handleCalculate = () => {
    setCalculatorError(null);
    setNetPriceResult(null);
    setGstPayableResult(null);
    setGrossPriceResult(null);

    const amountNum = parseFloat(amountStr);
    if (isNaN(amountNum) || amountNum < 0) {
      setCalculatorError('Please enter a valid positive amount.');
      return;
    }

    let net = 0;
    let gst = 0;
    let gross = 0;

    if (selectedGstRate === 0) {
      gst = 0;
      net = amountNum;
      gross = amountNum;
    } else {
      if (calculationBase === 'exclusive') {
        net = amountNum;
        gst = net * (selectedGstRate / 100);
        gross = net + gst;
      } else { // calculationBase === 'inclusive'
        gross = amountNum;
        net = gross / (1 + (selectedGstRate / 100));
        gst = gross - net;
      }
    }

    setNetPriceResult(net.toFixed(2));
    setGstPayableResult(gst.toFixed(2));
    setGrossPriceResult(gross.toFixed(2));
  };

  const handleResetCalculator = () => {
    setAmountStr('');
    setSelectedGstRate(18);
    setCalculationBase('exclusive');
    setNetPriceResult(null);
    setGstPayableResult(null);
    setGrossPriceResult(null);
    setCalculatorError(null);
  };

  const inputLabel = calculationBase === 'exclusive' 
    ? "Amount (Excluding GST)" 
    : "Amount (Including GST)";

  const handleValidateGstin = async () => {
    const trimmedGstin = gstin.trim().toUpperCase();
    setGstinDetails(null); // Clear previous details
    setGstinValidationDisplay(null); // Clear previous validation message

    if (!trimmedGstin) {
      setGstinValidationDisplay({ isValid: false, message: "GSTIN cannot be empty.", isFormatCheck: true });
      return;
    }

    if (!GSTIN_REGEX_PATTERN.test(trimmedGstin)) {
      let errorMsg = "Invalid GSTIN format.";
      if (trimmedGstin.length !== 15) {
        errorMsg += ` Expected 15 characters, got ${trimmedGstin.length}.`;
      }
      setGstinValidationDisplay({ isValid: false, message: errorMsg, isFormatCheck: true });
      return;
    }
    
    // Format is valid, proceed to fetch details
    setGstinValidationDisplay({ isValid: true, message: "GSTIN format is valid. Fetching details...", isFormatCheck: true });
    setIsFetchingGstinDetails(true);

    try {
      const response = await getGstinDetails({ gstin: trimmedGstin });
      if (response.error) {
        setGstinValidationDisplay({ isValid: false, message: response.error });
        setGstinDetails(null);
      } else if (response.companyName && response.companyAddress) {
        setGstinDetails(response);
        setGstinValidationDisplay({ isValid: true, message: "GSTIN details retrieved successfully." });
      } else {
        // Should not happen with current flow logic but good for robustness
        setGstinValidationDisplay({ isValid: false, message: "Could not retrieve GSTIN details." });
        setGstinDetails(null);
      }
    } catch (error: any) {
      console.error('Error fetching GSTIN details:', error);
      let errorMessage = "Error fetching GSTIN details. Please try again.";
      if (error.message && error.message.includes("Invalid GSTIN format")) {
        errorMessage = "Invalid GSTIN format according to API.";
      } else if (error.message) {
        errorMessage = error.message; // Use error message from Genkit if available
      }
      setGstinValidationDisplay({ isValid: false, message: errorMessage });
      setGstinDetails(null);
      toast({
        variant: "destructive",
        title: "GSTIN Lookup Failed",
        description: errorMessage,
      });
    } finally {
      setIsFetchingGstinDetails(false);
    }
  };

  const handleResetGstinValidator = () => {
    setGstin('');
    setGstinValidationDisplay(null);
    setGstinDetails(null);
    setIsFetchingGstinDetails(false);
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
      <Card className="max-w-lg mx-auto shadow-xl">
        <CardHeader>
          <div className="flex items-center gap-2 mb-2">
            <Calculator className="h-7 w-7 text-primary" />
            <CardTitle className="text-2xl font-bold">GST Calculator</CardTitle>
          </div>
          <CardDescription>Calculate Goods and Services Tax amounts quickly.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="calculationBase">Calculate Based On</Label>
            <RadioGroup
              id="calculationBase"
              value={calculationBase}
              onValueChange={(value: string) => setCalculationBase(value as CalculationBase)}
              className="flex space-x-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="exclusive" id="exclusive" />
                <Label htmlFor="exclusive" className="font-normal">Amount Excluding GST</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="inclusive" id="inclusive" />
                <Label htmlFor="inclusive" className="font-normal">Amount Including GST</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">{inputLabel}</Label>
            <div className="relative">
              <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                id="amount"
                type="number"
                value={amountStr}
                onChange={(e) => setAmountStr(e.target.value)}
                placeholder="Enter amount"
                step="0.01"
                className="pl-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="gstRate">GST Rate</Label>
            <Select
              value={String(selectedGstRate)}
              onValueChange={(value) => setSelectedGstRate(Number(value))}
            >
              <SelectTrigger id="gstRate">
                <SelectValue placeholder="Select GST Rate" />
              </SelectTrigger>
              <SelectContent>
                {gstRates.map(rate => (
                  <SelectItem key={rate.value} value={String(rate.value)}>
                    {rate.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {calculatorError && <p className="text-sm text-destructive">{calculatorError}</p>}

          {(netPriceResult !== null || gstPayableResult !== null || grossPriceResult !== null) && (
            <div className="space-y-3 pt-4 border-t">
              <h3 className="text-lg font-semibold text-foreground">Calculation Results:</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <ResultDisplay label="Amount (Excluding GST):" value={netPriceResult} />
                <ResultDisplay label="GST Amount:" value={gstPayableResult} />
                <ResultDisplay label="Total Amount (Including GST):" value={grossPriceResult} isEmphasized />
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-end space-x-2">
          <Button variant="outline" onClick={handleResetCalculator}>
            <RotateCcw className="mr-2 h-4 w-4" /> Reset
          </Button>
          <Button onClick={handleCalculate} className="bg-primary hover:bg-primary/90 text-primary-foreground">
            <Calculator className="mr-2 h-4 w-4" /> Calculate
          </Button>
        </CardFooter>
      </Card>

      {/* GSTIN Validator Card */}
      <Card className="max-w-lg mx-auto shadow-xl">
        <CardHeader>
          <div className="flex items-center gap-2 mb-2">
            <ShieldCheck className="h-7 w-7 text-primary" />
            <CardTitle className="text-2xl font-bold">GSTIN Information</CardTitle>
          </div>
          <CardDescription>Validate GSTIN format and retrieve business details (mock data).</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="gstin">GSTIN</Label>
            <Input
              id="gstin"
              type="text"
              value={gstin}
              onChange={(e) => setGstin(e.target.value.toUpperCase())}
              placeholder="Enter 15-digit GSTIN"
              maxLength={15}
              className="uppercase"
              disabled={isFetchingGstinDetails}
            />
          </div>

          {gstinValidationDisplay && (
            <div className={`flex items-start p-3 rounded-md text-sm ${
              gstinValidationDisplay.isValid 
                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 border border-green-300 dark:border-green-700' 
                : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 border border-red-300 dark:border-red-700'
            }`}>
              {gstinValidationDisplay.isValid ? 
                <CheckCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" /> : 
                <XCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
              }
              <span>{gstinValidationDisplay.message}</span>
            </div>
          )}

          {isFetchingGstinDetails && (
            <div className="flex items-center justify-center p-4">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <span className="ml-2 text-muted-foreground">Fetching GSTIN details...</span>
            </div>
          )}

          {gstinDetails && gstinDetails.companyName && (
            <div className="space-y-3 pt-4 border-t">
              <h3 className="text-lg font-semibold text-foreground">Business Details:</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-start">
                  <Building2 className="h-5 w-5 mr-2 mt-0.5 text-muted-foreground flex-shrink-0" />
                  <div>
                    <p className="font-medium text-foreground">{gstinDetails.companyName}</p>
                    <p className="text-xs text-muted-foreground">Company Name</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <MapPin className="h-5 w-5 mr-2 mt-0.5 text-muted-foreground flex-shrink-0" />
                  <div>
                    <p className="text-foreground">{gstinDetails.companyAddress}</p>
                    <p className="text-xs text-muted-foreground">Registered Address</p>
                  </div>
                </div>
              </div>
            </div>
          )}

        </CardContent>
        <CardFooter className="flex justify-end space-x-2">
          <Button variant="outline" onClick={handleResetGstinValidator} disabled={isFetchingGstinDetails}>
            <RotateCcw className="mr-2 h-4 w-4" /> Reset
          </Button>
          <Button onClick={handleValidateGstin} className="bg-primary hover:bg-primary/90 text-primary-foreground" disabled={isFetchingGstinDetails}>
            {isFetchingGstinDetails ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <ShieldCheck className="mr-2 h-4 w-4" />
            )}
            Get Details
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

interface ResultDisplayProps {
  label: string;
  value: string | null;
  isEmphasized?: boolean;
}

function ResultDisplay({ label, value, isEmphasized = false }: ResultDisplayProps) {
  if (value === null) return null;
  return (
    <div className={`p-3 rounded-md bg-muted/50 ${isEmphasized ? 'sm:col-span-2' : ''}`}>
      <p className="text-muted-foreground">{label}</p>
      <p className={`flex items-center font-semibold ${isEmphasized ? 'text-lg text-primary' : 'text-md text-foreground'}`}>
        <IndianRupee className={`h-4 w-4 mr-1 ${isEmphasized ? 'text-primary' : 'text-muted-foreground'}`} />
        {value}
      </p>
    </div>
  );
}
