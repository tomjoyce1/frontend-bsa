"use client";

import { useState } from "react";
import { useWalletKit } from "@mysten/wallet-kit";
import { CreateContractForm } from "./create-contract-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wallet, FileText, Shield } from "lucide-react";

export function LandlordDashboard() {
  const { isConnected, currentAccount } = useWalletKit();
  const [showCreateForm, setShowCreateForm] = useState(false);

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <Wallet className="h-6 w-6" />
              Connect Wallet
            </CardTitle>
            <CardDescription>
              Connect your wallet to access the landlord dashboard
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (showCreateForm) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Create New Contract</h2>
          <Button variant="outline" onClick={() => setShowCreateForm(false)}>
            Back to Dashboard
          </Button>
        </div>
        <CreateContractForm />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Create Contract
            </CardTitle>
            <CardDescription>
              Set up a new rental agreement with escrow
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setShowCreateForm(true)} className="w-full">
              Create New Contract
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Escrow Wallet
            </CardTitle>
            <CardDescription>
              Secure deposit management
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full" disabled>
              Coming Soon
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Connected Wallet</CardTitle>
            <CardDescription>
              {currentAccount?.address.slice(0, 6)}...{currentAccount?.address.slice(-4)}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">
              Ready to create contracts
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}