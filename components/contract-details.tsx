"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EscrowTransferModal } from "./escrow-transfer-modal";
import { Calendar, DollarSign, FileText, Shield, User } from "lucide-react";

interface Contract {
  id: string;
  title: string;
  landlordAddress: string;
  tenantAddress: string;
  depositAmount: string;
  currency: string;
  expiryDate: string;
  contractText: string;
  escrowWallet: string;
  status: string;
}

interface ContractDetailsProps {
  contract: Contract;
  isWalletConnected: boolean;
  currentAccount: any;
}

export function ContractDetails({ contract, isWalletConnected, currentAccount }: ContractDetailsProps) {
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [depositMade, setDepositMade] = useState(false);

  const isExpired = new Date(contract.expiryDate) < new Date();
  const canMakeDeposit = isWalletConnected && !depositMade && !isExpired;

  const handleDepositSuccess = () => {
    setDepositMade(true);
    setShowTransferModal(false);
  };

  return (
    <>
      <div className="space-y-6">
        {/* Contract Header */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  {contract.title}
                </CardTitle>
                <CardDescription>Contract ID: {contract.id}</CardDescription>
              </div>
              <Badge variant={isExpired ? "destructive" : "default"} className="text-lg px-4 py-2">
                {isExpired ? "EXPIRED" : "ACTIVE"}
              </Badge>
            </div>
          </CardHeader>
        </Card>

        {/* Contract Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Landlord</p>
                  <p className="text-xs text-muted-foreground">
                    {contract.landlordAddress.slice(0, 8)}...{contract.landlordAddress.slice(-6)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Deposit Amount</p>
                  <p className="text-lg font-bold">{contract.depositAmount} {contract.currency}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Expires</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(contract.expiryDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Escrow Wallet</p>
                  <p className="text-xs text-muted-foreground font-mono">
                    {contract.escrowWallet.slice(0, 8)}...{contract.escrowWallet.slice(-6)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Deposit Status */}
        {depositMade && (
          <Card className="border-green-200 bg-green-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-medium text-green-800">Deposit in Escrow</p>
                  <p className="text-sm text-green-600">{contract.depositAmount} {contract.currency} successfully deposited</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Contract Text */}
        <Card>
          <CardHeader>
            <CardTitle>Contract Terms</CardTitle>
            <CardDescription>Review the full contract details</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-muted p-4 rounded-lg max-h-96 overflow-y-auto">
              <pre className="text-sm whitespace-pre-wrap">
                {contract.contractText || `RENTAL DEPOSIT ESCROW AGREEMENT

Contract: ${contract.title}
Contract ID: ${contract.id}

PARTIES:
Landlord: ${contract.landlordAddress}
Tenant: ${contract.tenantAddress}

TERMS:
- Deposit Amount: ${contract.depositAmount} ${contract.currency}
- Contract Expiry: ${new Date(contract.expiryDate).toLocaleString()}
- Escrow Wallet: ${contract.escrowWallet}

This agreement establishes a blockchain-based escrow for the rental deposit. 
The deposit will be held securely until the contract terms are fulfilled or 
a dispute resolution is completed.

By accepting this contract, the tenant agrees to transfer the specified 
deposit amount to the escrow wallet address provided above.`}
              </pre>
            </div>
          </CardContent>
        </Card>

        {/* Action Button */}
        <Card>
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <Button
                onClick={() => setShowTransferModal(true)}
                disabled={!canMakeDeposit}
                size="lg"
                className="w-full md:w-auto"
              >
                {!isWalletConnected 
                  ? "Connect Wallet to Continue" 
                  : depositMade 
                    ? "Deposit Already Made" 
                    : isExpired 
                      ? "Contract Expired" 
                      : "Agree & Transfer to Escrow"
                }
              </Button>
              {!isWalletConnected && (
                <p className="text-sm text-muted-foreground">
                  Please connect your wallet to make a deposit
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transfer Modal */}
      {showTransferModal && (
        <EscrowTransferModal
          contract={contract}
          currentAccount={currentAccount}
          onClose={() => setShowTransferModal(false)}
          onSuccess={handleDepositSuccess}
        />
      )}
    </>
  );
}