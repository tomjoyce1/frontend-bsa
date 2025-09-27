"use client";

import { useState, useEffect } from "react";
import { useWalletKit } from "@mysten/wallet-kit";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { JuryDetail } from "./jury-detail";
import { Scale, Wallet, AlertCircle, Clock } from "lucide-react";

const SERVER_URL = "http://localhost:3002";

interface Dispute {
  id: string;
  title: string;
  landlordAddress: string;
  tenantAddress: string;
  depositAmount: string;
  currency: string;
  appealDeadline: string;
  evidenceCount: number;
  voteCount: number;
}

export function JuryPage() {
  const { isConnected, currentAccount } = useWalletKit();
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [selectedDispute, setSelectedDispute] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isConnected) {
      fetchDisputes();
    }
  }, [isConnected]);

  const fetchDisputes = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${SERVER_URL}/contracts?status=Dispute`);
      if (response.ok) {
        const disputeData = await response.json();
        setDisputes(disputeData);
      }
    } catch (error) {
      console.error("Error fetching disputes:", error);
    } finally {
      setLoading(false);
    }
  };

  const isEligibleVoter = (dispute: Dispute) => {
    if (!currentAccount) return false;
    return currentAccount.address !== dispute.landlordAddress && 
           currentAccount.address !== dispute.tenantAddress;
  };

  if (!isConnected) {
    return (
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <Wallet className="h-6 w-6" />
            Connect Wallet to Participate
          </CardTitle>
          <CardDescription>
            Connect your wallet to view and vote on rental disputes
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (selectedDispute) {
    return (
      <JuryDetail
        disputeId={selectedDispute}
        currentAccount={currentAccount}
        onBack={() => setSelectedDispute(null)}
      />
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scale className="h-5 w-5" />
            Open Disputes
          </CardTitle>
          <CardDescription>
            Review evidence and vote on rental deposit disputes. You can only vote on disputes where you are not a party.
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Disputes List */}
      {loading ? (
        <Card>
          <CardContent className="p-8 text-center">
            <p>Loading disputes...</p>
          </CardContent>
        </Card>
      ) : disputes.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Scale className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">No open disputes at this time</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {disputes.map((dispute) => {
            const eligible = isEligibleVoter(dispute);
            const timeLeft = new Date(dispute.appealDeadline).getTime() - Date.now();
            const daysLeft = Math.ceil(timeLeft / (1000 * 60 * 60 * 24));

            return (
              <Card key={dispute.id} className={eligible ? "" : "opacity-60"}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{dispute.title}</CardTitle>
                    <Badge variant={eligible ? "default" : "secondary"}>
                      {eligible ? "Eligible" : "Ineligible"}
                    </Badge>
                  </div>
                  <CardDescription>Contract ID: {dispute.id}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Deposit Amount</p>
                      <p className="font-medium">{dispute.depositAmount} {dispute.currency}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Evidence</p>
                      <p className="font-medium">{dispute.evidenceCount} items</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Current Votes</p>
                      <p className="font-medium">{dispute.voteCount}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Time Left</p>
                      <p className="font-medium flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {daysLeft > 0 ? `${daysLeft}d` : "Expired"}
                      </p>
                    </div>
                  </div>

                  {!eligible && (
                    <div className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <AlertCircle className="h-4 w-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-yellow-700">
                        <p className="font-medium">Cannot vote on this dispute</p>
                        <p>You are a party to this contract</p>
                      </div>
                    </div>
                  )}

                  <Button
                    onClick={() => setSelectedDispute(dispute.id)}
                    disabled={!eligible}
                    className="w-full"
                    variant={eligible ? "default" : "outline"}
                  >
                    {eligible ? "Review & Vote" : "View Details"}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}