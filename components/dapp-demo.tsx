"use client";

import { useState } from "react";
import { useWalletKit } from "@mysten/wallet-kit";
import { SuiClient } from "@mysten/sui/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Coins, Activity } from "lucide-react";

const suiClient = new SuiClient({ url: "https://fullnode.testnet.sui.io:443" });

export function DAppDemo() {
  const { isConnected, currentAccount } = useWalletKit();
  const [balance, setBalance] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchBalance = async () => {
    if (!currentAccount?.address) return;
    
    setLoading(true);
    try {
      const balance = await suiClient.getBalance({
        owner: currentAccount.address,
      });
      setBalance((parseInt(balance.totalBalance) / 1_000_000_000).toFixed(4));
    } catch (error) {
      console.error("Error fetching balance:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!isConnected) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <Activity className="h-5 w-5" />
            dApp Demo
          </CardTitle>
          <CardDescription>
            Connect your wallet to interact with the Sui blockchain
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center justify-center gap-2">
          <Activity className="h-5 w-5" />
          dApp Demo
        </CardTitle>
        <CardDescription>
          Interact with the Sui testnet
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Status:</span>
          <Badge variant="default">Connected</Badge>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Network:</span>
          <Badge variant="secondary">Testnet</Badge>
        </div>

        {balance && (
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">SUI Balance:</span>
            <span className="text-sm font-mono">{balance} SUI</span>
          </div>
        )}

        <Button
          onClick={fetchBalance}
          disabled={loading}
          className="w-full gap-2"
          variant="outline"
        >
          <Coins className="h-4 w-4" />
          {loading ? "Loading..." : "Fetch Balance"}
        </Button>
      </CardContent>
    </Card>
  );
}