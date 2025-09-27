"use client";

import { WalletKitProvider } from "@mysten/wallet-kit";

export function SuiWalletProvider({ children }: { children: React.ReactNode }) {
  return (
    <WalletKitProvider>{children}</WalletKitProvider>
  );
}