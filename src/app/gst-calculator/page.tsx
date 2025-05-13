
"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Calculator, RotateCcw, IndianRupee } from 'lucide-react';

const gstRates = [
  { label: '0%', value: 0 },
  { label: '3%', value: 3 },
  { label: '5%', value: 5 },
  { label: '12%', value: 12 },
  { label: '18%', value: 18 },
  { label: '28%', value: 28 },
];

type CalculationBase = 'exclusive' | 'inclusive';

export default function GstCalculatorPage() {
  const [amountStr, setAmountStr] = useState<string>('');
  const [selectedGstRate, setSelectedGstRate] = useState<number>(18);
  const [calculationBase, setCalculationBase] = useState<CalculationBase>('exclusive');

  const [netPriceResult, setNetPriceResult] = useState<string | null>(null);
  const [gstPayableResult, setGstPayableResult] = useState<string | null>(null);
  const [grossPriceResult, setGrossPriceResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCalculate = () => {
    setError(null);
    setNetPriceResult(null);
    setGstPayableResult(null);
    setGrossPriceResult(null);

    const amountNum = parseFloat(amountStr);
    if (isNaN(amountNum) || amountNum < 0) {
      setError('Please enter a valid positive amount.');
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

  const handleReset = () => {
    setAmountStr('');
    setSelectedGstRate(18);
    setCalculationBase('exclusive');
    setNetPriceResult(null);
    setGstPayableResult(null);
    setGrossPriceResult(null);
    setError(null);
  };

  const inputLabel = calculationBase === 'exclusive' 
    ? "Amount (Excluding GST)" 
    : "Amount (Including GST)";

  return (
    <div className="container mx-auto py-8">
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
          
          {error && <p className="text-sm text-destructive">{error}</p>}

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
          <Button variant="outline" onClick={handleReset}>
            <RotateCcw className="mr-2 h-4 w-4" /> Reset
          </Button>
          <Button onClick={handleCalculate} className="bg-primary hover:bg-primary/90 text-primary-foreground">
            <Calculator className="mr-2 h-4 w-4" /> Calculate
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
