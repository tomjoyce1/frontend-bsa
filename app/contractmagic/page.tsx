"use client";

import { useSignAndExecuteTransaction, useSuiClient } from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import ClipLoader from "react-spinners/ClipLoader";

export default function MakeNewContract() {
  const suiClient = useSuiClient();
  const { mutate: signAndExecute } = useSignAndExecuteTransaction();
  const [waitingForTxn, setWaitingForTxn] = useState(false);
  const [contractId, setContractId] = useState<string>("");

  const createNewContract = () => {
    setWaitingForTxn(true);

    const tx = new Transaction();

    // Create a coin with the exact seller guarantee amount
    const [sellerGuaranteeCoin] = tx.splitCoins(tx.gas, [9953786239]);

    tx.moveCall({
      arguments: [
        tx.pure.address(
          "0x7919dc9a22abc373e824a4f00a7bc99d45945c3a183826a14ff3450e91a66fa3"
        ), // buyer
        tx.pure.u64(10), // price
        tx.pure.u64(10), // guarantee
        tx.pure.u64(9953786239), // seller_guarantee
        tx.pure.u64(10), // voting_fee
        tx.pure.u64(100), // deposit_time
        tx.pure.u64(100), // contract_time
        tx.pure.u64(100), // dispute_time
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
          suiClient
            .waitForTransaction({ digest: result.digest })
            .then(async (txResult) => {
              // Extract contract ID from transaction effects
              const createdObjects = txResult.effects?.created;
              if (createdObjects && createdObjects.length > 0) {
                setContractId(createdObjects[0].reference.objectId);
              }
              setWaitingForTxn(false);
            });
        },
        onError: () => {
          setWaitingForTxn(false);
        },
      }
    );
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle>Create New Contract</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button
          onClick={createNewContract}
          disabled={waitingForTxn}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400"
        >
          {waitingForTxn ? (
            <ClipLoader size={20} color="white" />
          ) : (
            "Create Contract"
          )}
        </Button>
        {contractId && (
          <div className="text-sm text-gray-600">
            Contract created with ID: {contractId}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
