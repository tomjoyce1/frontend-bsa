"use client";

import { useWalletKit } from "@mysten/wallet-kit";
import { Button } from "@/components/ui/button";
import { Wallet, LogOut, ChevronDown } from "lucide-react";
import { useState, useEffect, useRef } from "react";

export function WalletConnect() {
  const { isConnected, currentAccount, disconnect, wallets, connect } = useWalletKit();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleConnect = async (walletName: string) => {
    try {
      await connect(walletName);
      setIsOpen(false);
    } catch (error) {
      console.error("Failed to connect wallet:", error);
    }
  };

  if (isConnected && currentAccount) {
    return (
      <div className="relative" ref={dropdownRef}>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsOpen(!isOpen)}
          className="gap-2 min-w-[140px] justify-between"
        >
          <div className="flex items-center gap-2">
            <Wallet className="h-4 w-4" />
            <span className="text-sm">
              {currentAccount.address.slice(0, 6)}...{currentAccount.address.slice(-4)}
            </span>
          </div>
          <ChevronDown className="h-4 w-4" />
        </Button>
        
        {isOpen && (
          <div className="absolute top-full mt-2 right-0 bg-background border rounded-lg shadow-lg p-2 min-w-[140px] z-50">
            <Button
              variant="ghost"
              size="sm"
              onClick={disconnect}
              className="w-full justify-start gap-2 text-destructive hover:text-destructive"
            >
              <LogOut className="h-4 w-4" />
              Disconnect
            </Button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        onClick={() => setIsOpen(!isOpen)}
        size="sm"
        className="gap-2 min-w-[140px] justify-between"
      >
        <div className="flex items-center gap-2">
          <Wallet className="h-4 w-4" />
          Connect Wallet
        </div>
        <ChevronDown className="h-4 w-4" />
      </Button>
      
      {isOpen && (
        <div className="absolute top-full mt-2 right-0 bg-background border rounded-lg shadow-lg p-2 min-w-[200px] z-50">
          {wallets.length > 0 ? (
            wallets.map((wallet) => (
              <Button
                key={wallet.name}
                variant="ghost"
                size="sm"
                onClick={() => handleConnect(wallet.name)}
                className="w-full justify-start gap-3 mb-1 last:mb-0"
              >
                {wallet.icon && (
                  <img src={wallet.icon} alt={wallet.name} className="h-5 w-5" />
                )}
                {wallet.name}
              </Button>
            ))
          ) : (
            <div className="p-2 text-sm text-muted-foreground text-center">
              No wallets detected
            </div>
          )}
        </div>
      )}
    </div>
  );
}
