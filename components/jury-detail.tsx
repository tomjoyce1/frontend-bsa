"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { EvidenceGallery } from "./evidence-gallery";
import { VoteSuccessModal } from "./vote-success-modal";
import { StakePaymentModal } from "./stake-payment-modal";
import { ArrowLeft, Scale, User, DollarSign, FileText, CheckCircle } from "lucide-react";

const SERVER_URL = "http://localhost:3002";

interface Contract {
  id: string;
  title: string;
  landlordAddress: string;
  tenantAddress: string;
  depositAmount: string;
  currency: string;
  contractText: string;
  dispute: {
    evidence: Evidence[];
    appealDeadline: string;
  };
}

interface Evidence {
  id: string;
  uploader: string;
  url: string;
  caption: string;
  timestamp: string;
  blobId?: string;
}

interface JuryDetailProps {
  disputeId: string;
  currentAccount: any;
  onBack: () => void;
}

interface StakePaymentModalProps {
  voteFor: 'tenant' | 'landlord' | null;
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
}

export function JuryDetail({ disputeId, currentAccount, onBack }: JuryDetailProps) {
  const [contract, setContract] = useState<Contract | null>(null);
  const [voteReason, setVoteReason] = useState("");
  const [hasVoted, setHasVoted] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showStakeModal, setShowStakeModal] = useState(false);
  const [pendingVote, setPendingVote] = useState<'tenant' | 'landlord' | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchContract();
    checkVoteStatus();
  }, [disputeId]);

  const fetchContract = async () => {
    try {
      const response = await fetch(`${SERVER_URL}/contracts/${disputeId}`);
      if (response.ok) {
        const contractData = await response.json();
        setContract(contractData);
      } else {
        // Use dummy data if API fails
        const dummyContract = {
          id: disputeId,
          title: "Downtown Apartment Lease",
          landlordAddress: "0xCAFE1234567890ABCDEF1234567890ABCDEF1234",
          tenantAddress: "0xFACE1234567890ABCDEF1234567890ABCDEF1234",
          depositAmount: "1000",
          currency: "SUI",
          contractText: `RENTAL DEPOSIT ESCROW AGREEMENT\n\nContract: Downtown Apartment Lease\nContract ID: ${disputeId}\n\nPARTIES:\nLandlord: 0xCAFE1234567890ABCDEF1234567890ABCDEF1234\nTenant: 0xFACE1234567890ABCDEF1234567890ABCDEF1234\n\nTERMS:\n- Deposit Amount: 1000 SUI\n- Property: 123 Main St, Downtown Apartment\n- Lease Period: 12 months\n- Move-in Date: January 1, 2024\n\nDISPUTE DETAILS:\nThe tenant claims property damage was pre-existing.\nThe landlord claims damage occurred during tenancy.\n\nThis is a demo contract with dummy data for jury review.`,
          dispute: {
            evidence: [
              {
                id: "ev1",
                uploader: "0xFACE1234567890ABCDEF1234567890ABCDEF1234",
                url: "/preview.png",
                caption: "Broken window in living room - tenant claims pre-existing",
                timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
                blobId: "1111111111"
              },
              {
                id: "ev2",
                uploader: "0xFACE1234567890ABCDEF1234567890ABCDEF1234",
                url: "/preview.png",
                caption: "Water damage in bathroom ceiling",
                timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
                blobId: "4444444444"
              },
              {
                id: "ev3",
                uploader: "0xCAFE1234567890ABCDEF1234567890ABCDEF1234",
                url: "/preview.png",
                caption: "Move-in inspection photos showing no damage",
                timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
                blobId: "2222222222"
              },
              {
                id: "ev4",
                uploader: "0xCAFE1234567890ABCDEF1234567890ABCDEF1234",
                url: "/preview.png",
                caption: "Professional cleaning receipt from before tenant move-in",
                timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
                blobId: "3333333333"
              }
            ],
            appealDeadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString()
          }
        };
        setContract(dummyContract);
      }
    } catch (error) {
      console.error("Error fetching contract:", error);
      // Use dummy data as fallback
      const dummyContract = {
        id: disputeId,
        title: "Downtown Apartment Lease",
        landlordAddress: "0xCAFE1234567890ABCDEF1234567890ABCDEF1234",
        tenantAddress: "0xFACE1234567890ABCDEF1234567890ABCDEF1234",
        depositAmount: "1000",
        currency: "SUI",
        contractText: `RENTAL DEPOSIT ESCROW AGREEMENT\n\nContract: Downtown Apartment Lease\nContract ID: ${disputeId}\n\nPARTIES:\nLandlord: 0xCAFE1234567890ABCDEF1234567890ABCDEF1234\nTenant: 0xFACE1234567890ABCDEF1234567890ABCDEF1234\n\nTERMS:\n- Deposit Amount: 1000 SUI\n- Property: 123 Main St, Downtown Apartment\n- Lease Period: 12 months\n- Move-in Date: January 1, 2024\n\nDISPUTE DETAILS:\nThe tenant claims property damage was pre-existing.\nThe landlord claims damage occurred during tenancy.\n\nThis is a demo contract with dummy data for jury review.`,
        dispute: {
          evidence: [
            {
              id: "ev1",
              uploader: "0xFACE1234567890ABCDEF1234567890ABCDEF1234",
              url: "/preview.png",
              caption: "Broken window in living room - tenant claims pre-existing",
              timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
              blobId: "1111111111"
            },
            {
              id: "ev2",
              uploader: "0xFACE1234567890ABCDEF1234567890ABCDEF1234",
              url: "/preview.png",
              caption: "Water damage in bathroom ceiling",
              timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
              blobId: "4444444444"
            },
            {
              id: "ev3",
              uploader: "0xCAFE1234567890ABCDEF1234567890ABCDEF1234",
              url: "/preview.png",
              caption: "Move-in inspection photos showing no damage",
              timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
              blobId: "2222222222"
            },
            {
              id: "ev4",
              uploader: "0xCAFE1234567890ABCDEF1234567890ABCDEF1234",
              url: "/preview.png",
              caption: "Professional cleaning receipt from before tenant move-in",
              timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
              blobId: "3333333333"
            }
          ],
          appealDeadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString()
        }
      };
      setContract(dummyContract);
    }
  };

  const checkVoteStatus = async () => {
    try {
      const response = await fetch(`${SERVER_URL}/contracts/${disputeId}/votes/${currentAccount.address}`);
      setHasVoted(response.ok);
    } catch (error) {
      // User hasn't voted yet
      setHasVoted(false);
    }
  };

  const handleVote = async (voteFor: 'tenant' | 'landlord') => {
    setPendingVote(voteFor);
    setShowStakeModal(true);
  };

  const handleStakePayment = async () => {
    if (!pendingVote) return;
    
    setLoading(true);
    try {
      // Mock stake payment transaction
      const stakeAmount = "10"; // 10 SUI stake
      const mockTxHash = `0x${Math.random().toString(16).substr(2, 64)}`;
      
      // Submit vote with stake proof
      const response = await fetch(`${SERVER_URL}/contracts/${disputeId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          voter: currentAccount.address,
          voteFor: pendingVote,
          reason: voteReason.trim() || undefined,
          stakeAmount,
          stakeTxHash: mockTxHash
        }),
      });

      if (response.ok) {
        setHasVoted(true);
        setShowStakeModal(false);
        setShowSuccessModal(true);
      }
    } catch (error) {
      console.error("Error submitting vote:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!contract) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p>Loading dispute details...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Disputes
          </Button>
          <div>
            <h2 className="text-2xl font-bold">{contract.title}</h2>
            <p className="text-muted-foreground">Contract ID: {contract.id}</p>
          </div>
        </div>

        {/* Vote Status */}
        {hasVoted && (
          <Card className="border-green-200 bg-green-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-medium text-green-800">Vote Submitted</p>
                  <p className="text-sm text-green-600">Thank you for participating in the dispute resolution</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Contract Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                <User className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Tenant</p>
                  <p className="text-xs text-muted-foreground">
                    {contract.tenantAddress.slice(0, 8)}...{contract.tenantAddress.slice(-6)}
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
                  <p className="text-sm font-medium">Deposit at Stake</p>
                  <p className="text-lg font-bold">{contract.depositAmount} {contract.currency}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Contract Text */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Contract Terms
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-muted p-4 rounded-lg max-h-64 overflow-y-auto">
              <pre className="text-sm whitespace-pre-wrap">
                {contract.contractText}
              </pre>
            </div>
          </CardContent>
        </Card>

        {/* Evidence Gallery */}
        <EvidenceGallery evidence={contract.dispute.evidence} />

        {/* Voting Section */}
        {!hasVoted && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Scale className="h-5 w-5" />
                Cast Your Vote
              </CardTitle>
              <CardDescription>
                Based on the evidence and contract terms, who should receive the deposit?
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Optional Reason */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Reason (Optional)</label>
                <Input
                  placeholder="Explain your decision..."
                  value={voteReason}
                  onChange={(e) => setVoteReason(e.target.value)}
                  maxLength={200}
                />
                <p className="text-xs text-muted-foreground">
                  {voteReason.length}/200 characters
                </p>
              </div>

              {/* Vote Buttons */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button
                  onClick={() => handleVote('tenant')}
                  disabled={loading}
                  size="lg"
                  className="h-16 bg-blue-600 hover:bg-blue-700"
                >
                  <div className="text-center">
                    <p className="font-bold">Vote for Tenant</p>
                    <p className="text-sm opacity-90">Return deposit to tenant</p>
                  </div>
                </Button>

                <Button
                  onClick={() => handleVote('landlord')}
                  disabled={loading}
                  size="lg"
                  className="h-16 bg-red-600 hover:bg-red-700"
                >
                  <div className="text-center">
                    <p className="font-bold">Vote for Landlord</p>
                    <p className="text-sm opacity-90">Award deposit to landlord</p>
                  </div>
                </Button>
              </div>

              <div className="text-center text-sm text-muted-foreground">
                <p>⚖️ Your vote is final and cannot be changed</p>
                <p>Voting helps ensure fair dispute resolution</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Stake Payment Modal */}
      {showStakeModal && (
        <StakePaymentModal
          voteFor={pendingVote}
          onConfirm={handleStakePayment}
          onCancel={() => {
            setShowStakeModal(false);
            setPendingVote(null);
          }}
          loading={loading}
        />
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <VoteSuccessModal onClose={() => setShowSuccessModal(false)} />
      )}
    </>
  );
}