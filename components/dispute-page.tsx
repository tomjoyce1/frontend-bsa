"use client";

import { useState, useEffect } from "react";
import { useWalletKit } from "@mysten/wallet-kit";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EvidenceUpload } from "./evidence-upload";
import { EvidenceList } from "./evidence-list";
import { Search, AlertTriangle, Scale } from "lucide-react";

const SERVER_URL = "http://localhost:3002";

interface Contract {
  id: string;
  title: string;
  status: string;
  landlordDecision?: string;
  appealWindowStart?: string;
  dispute?: {
    appealedBy?: string;
    appealOpenedAt?: string;
    appealDeadline?: string;
    evidence: Evidence[];
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

export function DisputePage() {
  const { isConnected, currentAccount } = useWalletKit();
  const [searchId, setSearchId] = useState("");
  const [contract, setContract] = useState<Contract | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!searchId.trim()) return;

    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${SERVER_URL}/contracts/${searchId.trim()}`);
      
      if (!response.ok) {
        // Use dummy data if API fails
        const dummyContract = {
          id: searchId.trim(),
          title: "Downtown Apartment Lease",
          status: "Dispute",
          landlordDecision: "Withheld",
          appealWindowStart: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          dispute: {
            appealedBy: "0xFACE1234567890ABCDEF1234567890ABCDEF1234",
            appealOpenedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
            appealDeadline: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString(),
            evidence: [
              {
                id: "ev1",
                uploader: "0xFACE1234567890ABCDEF1234567890ABCDEF1234",
                url: "/preview.png",
                caption: "Property damage - broken window in living room",
                timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
                blobId: "1111111111"
              },
              {
                id: "ev2",
                uploader: "0xCAFE1234567890ABCDEF1234567890ABCDEF1234",
                url: "/preview.png",
                caption: "Pre-existing damage documented before tenant moved in",
                timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
                blobId: "2222222222"
              }
            ]
          }
        };
        setContract(dummyContract);
        return;
      }
      
      const contractData = await response.json();
      setContract(contractData);
    } catch (error) {
      console.error("Error fetching contract:", error);
      // Use dummy data as fallback
      const dummyContract = {
        id: searchId.trim() || "SC-0001",
        title: "Downtown Apartment Lease",
        status: "Dispute",
        landlordDecision: "Withheld",
        appealWindowStart: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        dispute: {
          appealedBy: "0xFACE1234567890ABCDEF1234567890ABCDEF1234",
          appealOpenedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          appealDeadline: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString(),
          evidence: [
            {
              id: "ev1",
              uploader: "0xFACE1234567890ABCDEF1234567890ABCDEF1234",
              url: "/preview.png",
              caption: "Property damage - broken window in living room",
              timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
              blobId: "1111111111"
            },
            {
              id: "ev2",
              uploader: "0xCAFE1234567890ABCDEF1234567890ABCDEF1234",
              url: "/preview.png",
              caption: "Pre-existing damage documented before tenant moved in",
              timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
              blobId: "2222222222"
            }
          ]
        }
      };
      setContract(dummyContract);
    } finally {
      setLoading(false);
    }
  };

  const handleAppeal = async () => {
    if (!contract || !currentAccount) return;

    try {
      const response = await fetch(`${SERVER_URL}/contracts/${contract.id}/appeal`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          appealedBy: currentAccount.address,
          appealOpenedAt: new Date().toISOString(),
          appealDeadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        }),
      });

      if (response.ok) {
        const updatedContract = await response.json();
        setContract(updatedContract);
      }
    } catch (error) {
      console.error("Error submitting appeal:", error);
    }
  };

  const canAppeal = contract && 
    contract.status === "Expired" && 
    contract.landlordDecision === "Withheld" &&
    contract.appealWindowStart &&
    new Date() <= new Date(new Date(contract.appealWindowStart).getTime() + 7 * 24 * 60 * 60 * 1000) &&
    !contract.dispute?.appealedBy;

  const isInDispute = contract?.status === "Dispute";

  return (
    <div className="space-y-8">
      {/* Search Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Find Contract for Dispute
          </CardTitle>
          <CardDescription>
            Enter a contract ID to manage disputes and upload evidence
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="Search contract by ID (e.g. SC-0001)"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              className="flex-1"
            />
            <Button onClick={handleSearch} disabled={loading}>
              {loading ? "Searching..." : "Search"}
            </Button>
          </div>
          
          {error && (
            <div className="mt-4 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Appeal Section */}
      {canAppeal && isConnected && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-800">
              <AlertTriangle className="h-5 w-5" />
              Appeal Available
            </CardTitle>
            <CardDescription className="text-orange-700">
              The landlord has withheld your deposit. You can appeal this decision within the appeal window.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleAppeal} className="bg-orange-600 hover:bg-orange-700">
              Submit Appeal
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Dispute Status */}
      {isInDispute && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-800">
              <Scale className="h-5 w-5" />
              Dispute Active
            </CardTitle>
            <CardDescription className="text-red-700">
              This contract is under dispute. Both parties can upload evidence below.
              {contract.dispute?.appealDeadline && (
                <span className="block mt-1">
                  Appeal deadline: {new Date(contract.dispute.appealDeadline).toLocaleDateString()}
                </span>
              )}
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      {/* Evidence Upload Section */}
      {contract && isConnected && isInDispute && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <EvidenceUpload
            contractId={contract.id}
            currentAccount={currentAccount}
            onEvidenceUploaded={(evidence) => {
              setContract(prev => prev ? {
                ...prev,
                dispute: {
                  ...prev.dispute,
                  evidence: [...(prev.dispute?.evidence || []), evidence]
                }
              } : null);
            }}
          />
          
          <Card>
            <CardHeader>
              <CardTitle>Upload Guidelines</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>• Upload clear photos showing property condition</p>
              <p>• Add descriptive captions to explain each image</p>
              <p>• All evidence is timestamped and recorded on blockchain</p>
              <p>• Both tenant and landlord can upload evidence</p>
              <p>• Evidence cannot be deleted once uploaded</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Evidence List */}
      {contract?.dispute?.evidence && contract.dispute.evidence.length > 0 && (
        <EvidenceList evidence={contract.dispute.evidence} />
      )}

      {/* Wallet Connection Required */}
      {!isConnected && contract && (
        <Card>
          <CardHeader>
            <CardTitle>Connect Wallet Required</CardTitle>
            <CardDescription>
              Connect your wallet to submit appeals and upload evidence
            </CardDescription>
          </CardHeader>
        </Card>
      )}
    </div>
  );
}