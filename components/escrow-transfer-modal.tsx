"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { X, FileText, Shield, AlertTriangle, CheckCircle } from "lucide-react";

const SERVER_URL = "http://localhost:3002";

interface Contract {
  id: string;
  title: string;
  depositAmount: string;
  currency: string;
  escrowWallet: string;
}

interface EscrowTransferModalProps {
  contract: Contract;
  currentAccount: any;
  onClose: () => void;
  onSuccess: () => void;
}

export function EscrowTransferModal({ contract, currentAccount, onClose, onSuccess }: EscrowTransferModalProps) {
  const [step, setStep] = useState<'review' | 'sign' | 'transfer' | 'success'>('review');
  const [signature, setSignature] = useState<string>("");
  const [txHash, setTxHash] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const handleSign = async () => {
    setLoading(true);
    try {
      // Mock signature - in real implementation, use wallet.signMessage()
      const message = `I, ${currentAccount.address}, accept ${contract.id}`;
      const mockSignature = `0x${Math.random().toString(16).substr(2, 130)}`;
      
      setSignature(mockSignature);
      setStep('transfer');
    } catch (error) {
      console.error("Error signing message:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleTransfer = async () => {
    setLoading(true);
    try {
      // Mock transaction - in real implementation, use wallet.sendTransaction()
      const mockTxHash = `0x${Math.random().toString(16).substr(2, 64)}`;
      setTxHash(mockTxHash);

      // Record deposit in backend
      const response = await fetch(`${SERVER_URL}/contracts/${contract.id}/deposit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          txHash: mockTxHash,
          signature,
          amount: contract.depositAmount,
          from: currentAccount.address,
          to: contract.escrowWallet
        }),
      });

      if (response.ok) {
        setStep('success');
        setTimeout(() => {
          onSuccess();
        }, 2000);
      }
    } catch (error) {
      console.error("Error making transfer:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Escrow Transfer
            </CardTitle>
            <CardDescription>
              Transfer deposit to secure escrow wallet
            </CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Contract Summary */}
          <div className="bg-muted p-4 rounded-lg">
            <h3 className="font-medium mb-2">Contract Summary</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Contract</p>
                <p className="font-medium">{contract.title}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Amount</p>
                <p className="font-medium">{contract.depositAmount} {contract.currency}</p>
              </div>
              <div>
                <p className="text-muted-foreground">From</p>
                <p className="font-mono text-xs">{currentAccount.address.slice(0, 10)}...{currentAccount.address.slice(-8)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">To (Escrow)</p>
                <p className="font-mono text-xs">{contract.escrowWallet.slice(0, 10)}...{contract.escrowWallet.slice(-8)}</p>
              </div>
            </div>
          </div>

          {/* Warning */}
          <div className="flex items-start gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-yellow-800">Important Notice</p>
              <p className="text-yellow-700">
                By transferring money you accept the terms of this smart contract. This action requires your signature and cannot be undone.
              </p>
            </div>
          </div>

          {/* Step Content */}
          {step === 'review' && (
            <div className="space-y-4">
              <div className="text-center">
                <Badge variant="outline" className="mb-4">Step 1 of 3: Review</Badge>
                <p className="text-sm text-muted-foreground">
                  Please review the contract details above before proceeding.
                </p>
              </div>
              <Button onClick={() => setStep('sign')} className="w-full">
                Continue to Sign
              </Button>
            </div>
          )}

          {step === 'sign' && (
            <div className="space-y-4">
              <div className="text-center">
                <Badge variant="outline" className="mb-4">Step 2 of 3: Sign Agreement</Badge>
                <p className="text-sm text-muted-foreground mb-4">
                  Sign the message to accept the contract terms.
                </p>
                <div className="bg-muted p-3 rounded text-sm font-mono">
                  I, {currentAccount.address.slice(0, 8)}...{currentAccount.address.slice(-6)}, accept {contract.id}
                </div>
              </div>
              <Button onClick={handleSign} disabled={loading} className="w-full">
                {loading ? "Signing..." : "Sign to Accept Contract"}
              </Button>
            </div>
          )}

          {step === 'transfer' && (
            <div className="space-y-4">
              <div className="text-center">
                <Badge variant="outline" className="mb-4">Step 3 of 3: Transfer Funds</Badge>
                <p className="text-sm text-muted-foreground">
                  Signature received. Now transfer the deposit to escrow.
                </p>
                <div className="bg-green-50 p-3 rounded mt-4">
                  <p className="text-sm text-green-700">✓ Message signed successfully</p>
                </div>
              </div>
              <Button onClick={handleTransfer} disabled={loading} className="w-full">
                {loading ? "Processing Transfer..." : "Confirm Transfer"}
              </Button>
            </div>
          )}

          {step === 'success' && (
            <div className="text-center space-y-4">
              <CheckCircle className="h-16 w-16 text-green-600 mx-auto" />
              <div>
                <h3 className="text-lg font-medium text-green-800">Transfer Successful!</h3>
                <p className="text-sm text-green-600">
                  Your deposit has been securely transferred to escrow.
                </p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg text-left">
                <p className="text-sm font-medium text-green-800 mb-2">Transaction Details:</p>
                <div className="space-y-1 text-xs text-green-700">
                  <p><span className="font-medium">Amount:</span> {contract.depositAmount} {contract.currency}</p>
                  <p><span className="font-medium">TX Hash:</span> {txHash.slice(0, 20)}...{txHash.slice(-10)}</p>
                  <p><span className="font-medium">Status:</span> Confirmed</p>
                </div>
              </div>
            </div>
          )}

          {step !== 'success' && (
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}