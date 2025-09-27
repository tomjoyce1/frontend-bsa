"use client";

import { useState } from "react";
import { useWalletKit } from "@mysten/wallet-kit";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ContractPreviewModal } from "./contract-preview-modal";
import { CalendarDays, FileText, Loader2 } from "lucide-react";

const SERVER_URL = "http://localhost:3002";

interface ContractFormData {
  title: string;
  tenantAddress: string;
  depositAmount: string;
  currency: string;
  expiryDate: string;
  initialImageBlobId: string;
}

export function CreateContractForm() {
  const { currentAccount } = useWalletKit();
  const [formData, setFormData] = useState<ContractFormData>({
    title: "",
    tenantAddress: "",
    depositAmount: "",
    currency: "SUI",
    expiryDate: "",
    initialImageBlobId: "",
  });
  const [showPreview, setShowPreview] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleInputChange = (field: keyof ContractFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentAccount) return;

    setLoading(true);
    try {
      const payload = {
        ...formData,
        landlordAddress: currentAccount.address,
        createdAt: new Date().toISOString(),
      };

      const response = await fetch(`${SERVER_URL}/contracts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setShowPreview(true);
      }
    } catch (error) {
      console.error("Error creating contract:", error);
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = formData.title && formData.tenantAddress && formData.depositAmount && formData.expiryDate;

  return (
    <>
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Create Rental Contract
          </CardTitle>
          <CardDescription>
            Fill in the details to create a new rental agreement with escrow
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Contract Title</label>
                <Input
                  placeholder="e.g., Downtown Apartment Lease"
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Tenant Address</label>
                <Input
                  placeholder="0x..."
                  value={formData.tenantAddress}
                  onChange={(e) => handleInputChange("tenantAddress", e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Deposit Amount</label>
                <Input
                  type="number"
                  placeholder="1000"
                  value={formData.depositAmount}
                  onChange={(e) => handleInputChange("depositAmount", e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Currency</label>
                <Input
                  value={formData.currency}
                  onChange={(e) => handleInputChange("currency", e.target.value)}
                  placeholder="SUI"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <CalendarDays className="h-4 w-4" />
                Expiry Date & Time
              </label>
              <Input
                type="datetime-local"
                value={formData.expiryDate}
                onChange={(e) => handleInputChange("expiryDate", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Initial Image Blob ID</label>
              <Input
                placeholder="Enter blob ID from uploaded property images"
                value={formData.initialImageBlobId}
                onChange={(e) => handleInputChange("initialImageBlobId", e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Upload images in the Image Tool first, then paste the blob ID here
              </p>
            </div>

            <Button
              type="submit"
              disabled={!isFormValid || loading}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Creating Contract...
                </>
              ) : (
                "Create Contract"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {showPreview && (
        <ContractPreviewModal
          formData={formData}
          landlordAddress={currentAccount?.address || ""}
          onClose={() => setShowPreview(false)}
        />
      )}
    </>
  );
}