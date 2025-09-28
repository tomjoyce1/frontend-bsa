"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { X, FileText, Calendar, DollarSign, User } from "lucide-react";

interface ContractFormData {
  title: string;
  tenantAddress: string;
  depositAmount: string;
  currency: string;
  expiryDate: string;
  initialImageBlobId: string;
}

interface ContractPreviewModalProps {
  formData: ContractFormData;
  landlordAddress: string;
  onClose: () => void;
}

export function ContractPreviewModal({ formData, landlordAddress, onClose }: ContractPreviewModalProps) {
  const contractText = `
RENTAL DEPOSIT ESCROW AGREEMENT

Contract Title: ${formData.title}

PARTIES:
Landlord: ${landlordAddress}
Tenant: ${formData.tenantAddress}

TERMS:
- Deposit Amount: ${formData.depositAmount} ${formData.currency}
- Contract Expiry: ${new Date(formData.expiryDate).toLocaleString()}
- Initial Property Image: ${formData.initialImageBlobId || "Not provided"}

This agreement establishes a blockchain-based escrow for the rental deposit. 
The deposit will be held securely until the contract terms are fulfilled or 
a dispute resolution is completed.

Created: ${new Date().toLocaleString()}
  `.trim();

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Contract Preview
            </CardTitle>
            <CardDescription>
              Review your contract before finalizing
            </CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Landlord</p>
                <p className="text-xs text-muted-foreground">
                  {landlordAddress.slice(0, 8)}...{landlordAddress.slice(-6)}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Tenant</p>
                <p className="text-xs text-muted-foreground">
                  {formData.tenantAddress.slice(0, 8)}...{formData.tenantAddress.slice(-6)}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Deposit</p>
                <p className="text-xs text-muted-foreground">
                  {formData.depositAmount} {formData.currency}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Expires</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(formData.expiryDate).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="font-medium">Contract Text</h3>
            <div className="bg-muted p-4 rounded-lg">
              <pre className="text-sm whitespace-pre-wrap font-mono">
                {contractText}
              </pre>
            </div>
          </div>
te
          {/* Contract ID Display */}
          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-4">
              <div className="text-center space-y-2">
                <h3 className="text-lg font-semibold text-green-800">Contract Created Successfully!</h3>
                <div className="bg-white p-3 rounded-lg border border-green-300">
                  <p className="text-sm text-muted-foreground mb-1">Contract ID:</p>
                  <code className="text-lg font-mono font-bold text-green-700">
                    SC-{Math.random().toString(36).substr(2, 6).toUpperCase()}
                  </code>
                </div>
                <p className="text-sm text-green-600">
                  Share this ID with your tenant to access the contract
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={onClose}>
              Edit Contract
            </Button>
            <Button onClick={onClose}>
              Confirm & Create
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}