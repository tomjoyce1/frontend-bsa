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
import { Navbar } from "@/components/navbar";
import Footer from "@/components/footer";

export default function JuryPage() {
  const packageId =
    "0x98ce90fff1d1cad3c2f6f59b660c091806fe20d61a6f1c245035a8b57e3f5669";
  const currentAccount = useCurrentAccount();
  const { mutateAsync: signAndExecute } = useSignAndExecuteTransaction();
  const suiClient = useSuiClient();

  const [contractId, setContractId] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const voteSeller = async () => {
    if (!currentAccount || !contractId) return;
    
    // Validate that contractId is not the package ID
    if (contractId === packageId) {
      alert("Please enter a contract object ID, not the package ID");
      return;
    }
    
    setIsLoading(true);

    try {
      const tx = new Transaction();
      tx.setGasBudget(50_000_000);

      const contractObj = await suiClient.getObject({
        id: contractId,
        options: { showContent: true },
      });
      if (!contractObj.data) throw new Error("Contract not found");

      console.log("Contract object:", contractObj.data);
      console.log("Contract owner:", contractObj.data.owner);

      const contractData = contractObj.data.content as any;
      const votingFee = contractData?.fields?.voting_fee
        ? parseInt(contractData.fields.voting_fee)
        : 10;

      const [feeCoin] = tx.splitCoins(tx.gas, [votingFee]);

      console.log("Contract owner details:", contractObj.data.owner);

      if (
        contractObj.data.owner &&
        typeof contractObj.data.owner === "object" &&
        "Shared" in contractObj.data.owner
      ) {
        const sharedOwner = contractObj.data.owner as any;
        const initialSharedVersion = sharedOwner.Shared.initial_shared_version;

        tx.moveCall({
          target: `${packageId}::actual::vote_seller`,
          arguments: [
            tx.sharedObjectRef({
              objectId: contractId,
              initialSharedVersion: initialSharedVersion,
              mutable: true,
            }),
            feeCoin,
          ],
        });
      } else {
        tx.moveCall({
          target: `${packageId}::actual::vote_seller`,
          arguments: [tx.object(contractId), feeCoin],
        });
      }

      const result = await signAndExecute({ transaction: tx });
      console.log("Vote for seller successful:", result);
      alert("Vote for seller cast successfully!");
    } catch (error: any) {
      console.error("Vote failed:", error);
      alert(`Vote failed: ${error?.message || "Unknown error"}`);
    } finally {
      setIsLoading(false);
    }
  };

  const voteBuyer = async () => {
    if (!currentAccount || !contractId) return;
    
    // Validate that contractId is not the package ID
    if (contractId === packageId) {
      alert("Please enter a contract object ID, not the package ID");
      return;
    }
    
    setIsLoading(true);

    try {
      const tx = new Transaction();
      tx.setGasBudget(50_000_000);

      const contractObj = await suiClient.getObject({
        id: contractId,
        options: { showContent: true },
      });
      if (!contractObj.data) throw new Error("Contract not found");

      console.log("Contract object:", contractObj.data);
      console.log("Contract owner:", contractObj.data.owner);

      const contractData = contractObj.data.content as any;
      const votingFee = contractData?.fields?.voting_fee
        ? parseInt(contractData.fields.voting_fee)
        : 10;

      const [feeCoin] = tx.splitCoins(tx.gas, [votingFee]);

      console.log("Contract owner details:", contractObj.data.owner);

      if (
        contractObj.data.owner &&
        typeof contractObj.data.owner === "object" &&
        "Shared" in contractObj.data.owner
      ) {
        const sharedOwner = contractObj.data.owner as any;
        const initialSharedVersion = sharedOwner.Shared.initial_shared_version;

        tx.moveCall({
          target: `${packageId}::actual::vote_buyer`,
          arguments: [
            tx.sharedObjectRef({
              objectId: contractId,
              initialSharedVersion: initialSharedVersion,
              mutable: true,
            }),
            feeCoin,
          ],
        });
      } else {
        tx.moveCall({
          target: `${packageId}::actual::vote_buyer`,
          arguments: [tx.object(contractId), feeCoin],
        });
      }

      const result = await signAndExecute({ transaction: tx });
      console.log("Vote for buyer successful:", result);
      alert("Vote for buyer cast successfully!");
    } catch (error: any) {
      console.error("Vote failed:", error);
      alert(`Vote failed: ${error?.message || "Unknown error"}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className="pt-16 xs:pt-20 sm:pt-24">
        <div className="min-h-[calc(100vh-12rem)] py-20 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-3xl xs:text-4xl sm:text-5xl font-bold mb-6">
                Jury Dashboard
              </h1>
              <p className="text-lg text-muted-foreground">
                Vote on contract disputes and earn rewards
              </p>
            </div>
            <Card className="max-w-md mx-auto">
              <CardHeader>
                <CardTitle>Vote on Dispute</CardTitle>
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
                      onClick={voteSeller}
                      disabled={!contractId || isLoading}
                      className="w-full bg-green-600 hover:bg-green-700"
                    >
                      {isLoading && (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      )}
                      Vote for Seller
                    </Button>

                    <Button
                      onClick={voteBuyer}
                      disabled={!contractId || isLoading}
                      className="w-full bg-blue-600 hover:bg-blue-700"
                    >
                      {isLoading && (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      )}
                      Vote for Buyer
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
        <Footer />
      </main>
    </>
  );
}
