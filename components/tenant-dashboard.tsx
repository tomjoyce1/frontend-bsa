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
        // Use dummy data if API fails
        const dummyContract = {
          id: searchId.trim(),
          title: "Downtown Apartment Lease",
          landlordAddress: "0xCAFE1234567890ABCDEF1234567890ABCDEF1234",
          tenantAddress: "0xFACE1234567890ABCDEF1234567890ABCDEF1234",
          depositAmount: "1000",
          currency: "SUI",
          expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          contractText: `RENTAL DEPOSIT ESCROW AGREEMENT\n\nContract: Downtown Apartment Lease\nContract ID: ${searchId.trim()}\n\nPARTIES:\nLandlord: 0xCAFE1234567890ABCDEF1234567890ABCDEF1234\nTenant: 0xFACE1234567890ABCDEF1234567890ABCDEF1234\n\nTERMS:\n- Deposit Amount: 1000 SUI\n- Contract Expiry: ${new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleString()}\n- Escrow Wallet: 0xESCROW1234567890ABCDEF1234567890ABCDEF\n\nThis is a demo contract with dummy data.`,
          escrowWallet: "0xESCROW1234567890ABCDEF1234567890ABCDEF",
          status: "Active"
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
        landlordAddress: "0xCAFE1234567890ABCDEF1234567890ABCDEF1234",
        tenantAddress: "0xFACE1234567890ABCDEF1234567890ABCDEF1234",
        depositAmount: "1000",
        currency: "SUI",
        expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        contractText: `RENTAL DEPOSIT ESCROW AGREEMENT\n\nContract: Downtown Apartment Lease\nContract ID: ${searchId.trim() || "SC-0001"}\n\nPARTIES:\nLandlord: 0xCAFE1234567890ABCDEF1234567890ABCDEF1234\nTenant: 0xFACE1234567890ABCDEF1234567890ABCDEF1234\n\nTERMS:\n- Deposit Amount: 1000 SUI\n- Contract Expiry: ${new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleString()}\n- Escrow Wallet: 0xESCROW1234567890ABCDEF1234567890ABCDEF\n\nThis is a demo contract with dummy data.`,
        escrowWallet: "0xESCROW1234567890ABCDEF1234567890ABCDEF",
        status: "Active"
      };
      setContract(dummyContract);
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