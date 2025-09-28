"use client";

import { useState } from "react";
import {
  useCurrentAccount,
  useSignAndExecuteTransaction,
  useSuiClient,
  ConnectButton,
} from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Wallet } from "lucide-react";

export default function JuryPage() {
  const packageId = "0x3e8fa6e916ae72eb894b84c4228d41556d099d5d4f853e7c41ebde152cc0723a";
  const currentAccount = useCurrentAccount();
  const { mutateAsync: signAndExecute } = useSignAndExecuteTransaction();
  const suiClient = useSuiClient();
  
  const [contractId, setContractId] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const vote = async (forSeller: boolean) => {
    if (!currentAccount || !contractId) return;
    setIsLoading(true);

    try {
      const tx = new Transaction();
      tx.setGasBudget(50_000_000);

      const contractObj = await suiClient.getObject({ 
        id: contractId,
        options: { showContent: true }
      });
      if (!contractObj.data) throw new Error("Contract not found");

      const votingFee = 500_000; // From contract parameters
      const [feeCoin] = tx.splitCoins(tx.gas, [tx.pure.u64(votingFee)]);

      const target = forSeller 
        ? `${packageId}::contract::vote_seller`
        : `${packageId}::contract::vote_buyer`;

      tx.moveCall({
        target,
        arguments: [
          tx.objectRef({
            objectId: contractId,
            version: contractObj.data.version!,
            digest: contractObj.data.digest!,
          }),
          feeCoin,
        ],
      });

      const result = await signAndExecute({ transaction: tx });
      console.log("Vote cast:", result);
      alert(`Vote for ${forSeller ? 'seller' : 'buyer'} cast successfully!`);
    } catch (error: any) {
      console.error("Vote failed:", error);
      alert(`Vote failed: ${error?.message || "Unknown error"}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Jury - Vote on Dispute</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Input
          placeholder="Contract ID"
          value={contractId}
          onChange={(e) => setContractId(e.target.value)}
        />
        
        {!currentAccount ? (
          <ConnectButton className="w-full">
            <Wallet className="h-4 w-4 mr-2" />
            Connect Wallet
          </ConnectButton>
        ) : (
          <div className="space-y-2">
            <Button
              onClick={() => vote(true)}
              disabled={!contractId || isLoading}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              {isLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Vote for Seller
            </Button>
            
            <Button
              onClick={() => vote(false)}
              disabled={!contractId || isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              {isLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Vote for Buyer
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}