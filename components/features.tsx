import {
  Blocks,
  Bot,
  ChartPie,
  Film,
  MessageCircle,
  Settings2,
} from "lucide-react";
import React from "react";

const features = [
  {
    icon: Blocks,
    title: "Step 1: Contract Creation",
    description:
      "Landlord uploads photos and sets contract terms. This data is immutably stored on the blockchain.",
  },
  {
    icon: Bot,
    title: "Step 2: Tenant Deposit",
    description:
      "Tenant funds the contract. The deposit is held securely in a neutral escrow smart contract.",
  },
  {
    icon: Film,
    title: "Step 3: End of Tenancy",
    description:
      "At lease end, the landlord is prompted to approve the deposit's return to the tenant.",
  },
  {
    icon: Film,
    title: "Step 4: Automatic Release",
    description:
      "If approved, the smart contract instantly transfers the full deposit to the tenant. Contract complete.",
  },
  {
    icon: ChartPie,
    title: "Step 5: Dispute Activation",
    description:
      "If denied, the deposit is locked while the contract enters a dispute mode.",
  },
  {
    icon: MessageCircle,
    title: "Step 6: Dispute Resolution",
    description:
      "A third party reviews evidence and the smart contract executes their final decision.",
  },
];

const Features = () => {
  return (
    <div id="features" className="w-full  ">
      <div className="w-full max-w-screen-lg mx-auto mt-10 sm:mt-16 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature) => (
          <div
            key={feature.title}
            className="flex flex-col bg-background border rounded-xl py-6 px-5"
          >
            <div className="mb-3 h-10 w-10 flex items-center justify-center bg-muted rounded-full">
              <feature.icon className="h-6 w-6" />
            </div>
            <span className="text-lg font-semibold">{feature.title}</span>
            <p className="mt-1 text-foreground/80 text-[15px]">
              {feature.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Features;
