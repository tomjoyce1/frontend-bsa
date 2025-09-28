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
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Wallet } from "lucide-react";

export default function LandlordPage() {
  const packageId = "0x3e8fa6e916ae72eb894b84c4228d41556d099d5d4f853e7c41ebde152cc0723a";
  const currentAccount = useCurrentAccount();
  const { mutateAsync: signAndExecute } = useSignAndExecuteTransaction();
  const suiClient = useSuiClient();
  
  const [contractId, setContractId] = useState("");
  const [originalDesc, setOriginalDesc] = useState("");
  const [disputeDesc, setDisputeDesc] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const raiseDispute = async () => {
    if (!currentAccount || !contractId || !originalDesc || !disputeDesc) return;
    setIsLoading(true);

    try {
      const tx = new Transaction();
      tx.setGasBudget(50_000_000);

      const contractObj = await suiClient.getObject({ 
        id: contractId,
        options: { showContent: true }
      });
      if (!contractObj.data) throw new Error("Contract not found");

      const clock = await suiClient.getObject({ id: "0x6" });
      if (!clock?.data?.version) throw new Error("Cannot fetch clock");

      tx.moveCall({
        target: `${packageId}::contract::raise_dispute`,
        arguments: [
          tx.objectRef({
            objectId: contractId,
            version: contractObj.data.version!,
            digest: contractObj.data.digest!,
          }),
          tx.pure.vector("u8", Array.from(new TextEncoder().encode(originalDesc))),
          tx.pure.vector("u8", Array.from(new TextEncoder().encode(disputeDesc))),
          tx.sharedObjectRef({
            objectId: "0x6",
            initialSharedVersion: clock.data.version,
            mutable: false,
          }),
        ],
      });

      const result = await signAndExecute({ transaction: tx });
      console.log("Dispute raised:", result);
      alert("Dispute raised successfully!");
    } catch (error: any) {
      console.error("Dispute failed:", error);
      alert(`Dispute failed: ${error?.message || "Unknown error"}`);
    } finally {
      setIsLoading(false);
    }
  };

  const resolveDispute = async () => {
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

      const clock = await suiClient.getObject({ id: "0x6" });
      if (!clock?.data?.version) throw new Error("Cannot fetch clock");

      tx.moveCall({
        target: `${packageId}::contract::resolve_dispute_voting`,
        arguments: [
          tx.objectRef({
            objectId: contractId,
            version: contractObj.data.version!,
            digest: contractObj.data.digest!,
          }),
          tx.sharedObjectRef({
            objectId: "0x6",
            initialSharedVersion: clock.data.version,
            mutable: false,
          }),
        ],
      });

      const result = await signAndExecute({ transaction: tx });
      console.log("Dispute resolved:", result);
      alert("Dispute resolved successfully!");
    } catch (error: any) {
      console.error("Resolution failed:", error);
      alert(`Resolution failed: ${error?.message || "Unknown error"}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Landlord - Dispute Management</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Input
          placeholder="Contract ID"
          value={contractId}
          onChange={(e) => setContractId(e.target.value)}
        />
        
        <Textarea
          placeholder="Original Description"
          value={originalDesc}
          onChange={(e) => setOriginalDesc(e.target.value)}
        />
        
        <Textarea
          placeholder="Dispute Description"
          value={disputeDesc}
          onChange={(e) => setDisputeDesc(e.target.value)}
        />
        
        {!currentAccount ? (
          <ConnectButton className="w-full">
            <Wallet className="h-4 w-4 mr-2" />
            Connect Wallet
          </ConnectButton>
        ) : (
          <div className="space-y-2">
            <Button
              onClick={raiseDispute}
              disabled={!contractId || !originalDesc || !disputeDesc || isLoading}
              className="w-full"
            >
              {isLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Raise Dispute
            </Button>
            
            <Button
              onClick={resolveDispute}
              disabled={!contractId || isLoading}
              className="w-full"
              variant="outline"
            >
              {isLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Resolve Dispute
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}