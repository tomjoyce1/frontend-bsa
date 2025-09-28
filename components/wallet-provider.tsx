"use client";

import { WalletProvider } from "@mysten/dapp-kit";

export function SuiWalletProvider({ children }: { children: React.ReactNode }) {
  return (
    <WalletProvider>{children}</WalletProvider>
  );
}