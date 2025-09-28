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

export default function TenantPage() {
  const packageId =
    "0x3e8fa6e916ae72eb894b84c4228d41556d099d5d4f853e7c41ebde152cc0723a";
  const currentAccount = useCurrentAccount();
  const { mutateAsync: signAndExecute } = useSignAndExecuteTransaction();
  const suiClient = useSuiClient();

  const [contractId, setContractId] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const makeDeposit = async () => {
    if (!currentAccount || !contractId) return;
    setIsLoading(true);

    try {
      const tx = new Transaction();
      tx.setGasBudget(50_000_000);

      // Get contract object
      const contractObj = await suiClient.getObject({
        id: contractId,
        options: { showContent: true },
      });
      if (!contractObj.data) throw new Error("Contract not found");

      // Extract price and guarantee from contract (you'd need to parse this from contract data)
      const depositAmount = 7_000_000; // price + guarantee (5M + 2M)

      const [depositCoin] = tx.splitCoins(tx.gas, [tx.pure.u64(depositAmount)]);

      tx.moveCall({
        target: `${packageId}::actual::make_deposit`,
        arguments: [
          tx.objectRef({
            objectId: contractId,
            version: contractObj.data.version!,
            digest: contractObj.data.digest!,
          }),
          depositCoin,
          tx.object("0x6"),
        ],
      });

      const result = await signAndExecute({ transaction: tx });
      console.log("Deposit successful:", result);
      alert("Deposit made successfully!");
    } catch (error: any) {
      console.error("Deposit failed:", error);
      alert(`Deposit failed: ${error?.message || "Unknown error"}`);
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
                Tenant Dashboard
              </h1>
              <p className="text-lg text-muted-foreground">
                Make deposits and manage your contracts
              </p>
            </div>
            <Card className="max-w-md mx-auto">
              <CardHeader>
                <CardTitle>Make Deposit</CardTitle>
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
                  <Button
                    onClick={makeDeposit}
                    disabled={!contractId || isLoading}
                    className="w-full"
                  >
                    {isLoading && (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    )}
                    Make Deposit
                  </Button>
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
