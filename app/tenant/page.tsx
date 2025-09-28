"use client";

import { useState } from "react";
import {
  useCurrentAccount,
  useSignAndExecuteTransaction,
  useSuiClient,
  useSuiClientQuery,
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
  const [viewContractId, setViewContractId] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { data, isPending, isError, error, refetch } = useSuiClientQuery(
    "getObject",
    { id: viewContractId || "0x0", options: { showContent: true } },
    {
      refetchInterval: 10_000,
      enabled: !!viewContractId,
    }
  );

  const contractData = data?.data?.content as any;
  console.log("Contract data:", contractData);

  const price = contractData?.fields?.price
    ? parseInt(contractData.fields.price)
    : 0;
  const guarantee = contractData?.fields?.guarantee
    ? parseInt(contractData.fields.guarantee)
    : 0;

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

      console.log("Contract object:", contractObj.data);
      console.log("Contract owner:", contractObj.data.owner);
      console.log("Contract type:", contractObj.data.type);

      // Get price and guarantee from the actual contract being deposited to
      const actualContractData = contractObj.data.content as any;
      const actualPrice = actualContractData?.fields?.price
        ? parseInt(actualContractData.fields.price)
        : 0;
      const actualGuarantee = actualContractData?.fields?.guarantee
        ? parseInt(actualContractData.fields.guarantee)
        : 0;
      const depositAmount = actualPrice + actualGuarantee;

      console.log("Actual contract price:", actualPrice);
      console.log("Actual contract guarantee:", actualGuarantee);
      console.log("Total deposit amount:", depositAmount);

      if (depositAmount === 0) {
        throw new Error(
          "Invalid deposit amount: price + guarantee cannot be 0"
        );
      }

      const [depositCoin] = tx.splitCoins(tx.gas, [depositAmount]);

      // Use the same package ID as landlord contract creation
      const actualPackageId =
        "0x98ce90fff1d1cad3c2f6f59b660c091806fe20d61a6f1c245035a8b57e3f5669";

      console.log("Contract owner details:", contractObj.data.owner);
      console.log("Contract owner type:", typeof contractObj.data.owner);

      // Handle different owner types
      if (
        contractObj.data.owner &&
        typeof contractObj.data.owner === "object" &&
        "Shared" in contractObj.data.owner
      ) {
        // Shared object
        const sharedOwner = contractObj.data.owner as any;
        const initialSharedVersion = sharedOwner.Shared.initial_shared_version;
        console.log("Using shared object with version:", initialSharedVersion);

        tx.moveCall({
          target: `${actualPackageId}::actual::make_deposit`,
          arguments: [
            tx.sharedObjectRef({
              objectId: contractId,
              initialSharedVersion: initialSharedVersion,
              mutable: true,
            }),
            depositCoin,
            tx.object("0x6"),
          ],
        });
      } else {
        // Try as immutable or owned object
        console.log("Using object reference");

        tx.moveCall({
          target: `${actualPackageId}::actual::make_deposit`,
          arguments: [tx.object(contractId), depositCoin, tx.object("0x6")],
        });
      }

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
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>View Contract</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Input
                    placeholder="Contract ID to view"
                    value={viewContractId}
                    onChange={(e) => setViewContractId(e.target.value)}
                  />
                  {isPending && <div>Loading contract...</div>}
                  {isError && <div>Error: {error?.message}</div>}
                  {data && (
                    <div className="space-y-2 text-sm">
                      <div>Price: {price}</div>
                      <div>Guarantee: {guarantee}</div>
                      <div>Total Deposit: {price + guarantee}</div>
                      <div className="text-xs text-gray-500 mt-2">
                        Debug: {JSON.stringify(contractData?.fields, null, 2)}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
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
                      disabled={
                        !contractId ||
                        isLoading ||
                        price === 0 ||
                        guarantee === 0
                      }
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
        </div>
        <Footer />
      </main>
    </>
  );
}
