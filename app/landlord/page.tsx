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
import Footer from "@/components/footer";
import { Navbar } from "@/components/navbar";
import ClipLoader from "react-spinners/ClipLoader";

export default function LandlordPage() {
  const packageId =
    "0x3e8fa6e916ae72eb894b84c4228d41556d099d5d4f853e7c41ebde152cc0723a";
  const currentAccount = useCurrentAccount();
  const { mutateAsync: signAndExecute } = useSignAndExecuteTransaction();
  const suiClient = useSuiClient();

  const [contractId, setContractId] = useState("");

  const [price, setPrice] = useState("");

  const [landlordsGuarantee, setLandlordsGuarantee] = useState("");

  const [tenantsGuarantee, setTenantsGuarantee] = useState("");

  const [votingFee, setVotingFee] = useState("");

  const [originalDesc, setOriginalDesc] = useState("");
  const [disputeDesc, setDisputeDesc] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [waitingForTxn, setWaitingForTxn] = useState(false);
  const [newContractId, setNewContractId] = useState<string>("");

  const raiseDispute = async () => {
    if (!currentAccount || !contractId) return;
    setIsLoading(true);
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
    try {
      const tx = new Transaction();
      tx.setGasBudget(50_000_000);

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
          target: `${packageId}::actual::make_deposit`,
          arguments: [
            tx.sharedObjectRef({
              objectId: contractId,
              initialSharedVersion: initialSharedVersion,
              mutable: true,
            }),
            tx.pure.vector("u8", []),
            tx.pure.vector("u8", []), // desc_hash

            tx.object("0x6"),
          ],
        });
      }

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
        options: { showContent: true },
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

  const createNewContract = () => {
    setWaitingForTxn(true);

    const tx = new Transaction();

    // Create a coin with the exact seller guarantee amount
    const [sellerGuaranteeCoin] = tx.splitCoins(tx.gas, [1]);

    tx.moveCall({
      arguments: [
        tx.pure.address(
          "0x7919dc9a22abc373e824a4f00a7bc99d45945c3a183826a14ff3450e91a66fa3"
        ), // buyer
        tx.pure.u64(10), // price
        tx.pure.u64(10), // guarantee
        tx.pure.u64(1), // seller_guarantee
        tx.pure.u64(10), // voting_fee
        tx.pure.u64(10000000), // deposit_time
        tx.pure.u64(1000000), // contract_time
        tx.pure.u64(1000000), // dispute_time
        tx.pure.vector("u64", []), // image_hashes
        tx.pure.vector("u8", []), // desc_hash
        sellerGuaranteeCoin, // seller_guarantee_coin
        tx.object("0x6"), // clock
      ],
      target:
        "0x98ce90fff1d1cad3c2f6f59b660c091806fe20d61a6f1c245035a8b57e3f5669::actual::new",
    });

    signAndExecute(
      { transaction: tx },
      {
        onSuccess: (result) => {
          const getTransactionWithRetry = async (
            digest: string,
            retries = 3
          ) => {
            for (let i = 0; i < retries; i++) {
              try {
                await new Promise((resolve) =>
                  setTimeout(resolve, 1000 * (i + 1))
                );
                const txResult = await suiClient.getTransactionBlock({
                  digest,
                  options: { showEffects: true, showObjectChanges: true },
                });

                const createdObjects = txResult.effects?.created;
                const objectChanges = txResult.objectChanges;

                let contractId = "";
                if (createdObjects && createdObjects.length > 0) {
                  contractId = createdObjects[0].reference.objectId;
                } else if (objectChanges) {
                  const createdObject = objectChanges.find(
                    (change) => change.type === "created"
                  );
                  if (createdObject && "objectId" in createdObject) {
                    contractId = createdObject.objectId;
                  }
                }

                if (contractId) {
                  setNewContractId(contractId);
                  console.log("Contract ID:", contractId);
                } else {
                  console.log("Full transaction result:", txResult);
                }
                setWaitingForTxn(false);
                return;
              } catch (error) {
                if (i === retries - 1) {
                  console.error(
                    "Error getting transaction after retries:",
                    error
                  );
                  setWaitingForTxn(false);
                }
              }
            }
          };

          getTransactionWithRetry(result.digest);
        },
        onError: () => {
          setWaitingForTxn(false);
        },
      }
    );
  };

  return (
    <>
      <Navbar />
      <main className="pt-16 xs:pt-20 sm:pt-24">
        <div className="min-h-[calc(100vh-12rem)] py-20 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-3xl xs:text-4xl sm:text-5xl font-bold mb-6">
                Landlord Dashboard
              </h1>
              <p className="text-lg text-muted-foreground">
                Manage disputes and contract resolutions
              </p>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle>Create New Contract</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Input
                    placeholder="Price"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                  />
                  <Input
                    placeholder="Landlord's Guarantee"
                    value={landlordsGuarantee}
                    onChange={(e) => setLandlordsGuarantee(e.target.value)}
                  />
                  <Input
                    placeholder="Tenant's Guarantee"
                    value={tenantsGuarantee}
                    onChange={(e) => setTenantsGuarantee(e.target.value)}
                  />
                  <Input
                    placeholder="Voting Fee"
                    value={votingFee}
                    onChange={(e) => setVotingFee(e.target.value)}
                  />
                  <Button
                    onClick={createNewContract}
                    disabled={waitingForTxn}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400"
                  >
                    {waitingForTxn ? (
                      <ClipLoader size={20} color="white" />
                    ) : (
                      "Create Contract"
                    )}
                  </Button>
                  {newContractId && (
                    <div className="text-sm text-gray-600">
                      Contract created with ID: {newContractId}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Dispute Management</CardTitle>
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
                        disabled={
                          !contractId ||
                          // !originalDesc ||
                          // !disputeDesc ||
                          isLoading
                        }
                        className="w-full"
                      >
                        {isLoading && (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        )}
                        Raise Dispute
                      </Button>

                      <Button
                        onClick={resolveDispute}
                        disabled={!contractId || isLoading}
                        className="w-full"
                        variant="outline"
                      >
                        {isLoading && (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        )}
                        Resolve Dispute
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
        {newContractId && (
          <div className="text-center py-8 bg-green-50 border-t">
            <h3 className="text-lg font-semibold mb-2">
              Contract Created Successfully!
            </h3>
            <p className="text-sm text-gray-600">
              Contract ID:{" "}
              <span className="font-mono bg-gray-100 px-2 py-1 rounded">
                {newContractId}
              </span>
            </p>
          </div>
        )}
        <Footer />
      </main>
    </>
  );
}
