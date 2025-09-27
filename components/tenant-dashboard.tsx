"use client";

import { useState } from "react";
import { useWalletKit } from "@mysten/wallet-kit";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ContractDetails } from "./contract-details";
import { Search, Wallet } from "lucide-react";

const SERVER_URL = "http://localhost:3002";

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

export function TenantDashboard() {
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
        throw new Error(`Contract not found (${response.status})`);
      }
      
      const contractData = await response.json();
      setContract(contractData);
    } catch (error) {
      console.error("Error fetching contract:", error);
      setError(error instanceof Error ? error.message : "Failed to fetch contract");
      setContract(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Search Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search Contract
          </CardTitle>
          <CardDescription>
            Enter a contract ID to view details and make deposits
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

      {/* Wallet Connection Status */}
      {!isConnected && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5" />
              Connect Wallet Required
            </CardTitle>
            <CardDescription>
              Connect your wallet to interact with contracts and make deposits
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      {/* Contract Details */}
      {contract && (
        <ContractDetails 
          contract={contract} 
          isWalletConnected={isConnected}
          currentAccount={currentAccount}
        />
      )}
    </div>
  );
}