# Mysten dApp Integration Setup

This template now includes Mysten Labs Sui blockchain integration using Wallet Kit.

## Dependencies Added

- `@mysten/sui.js` - Sui JavaScript SDK
- `@mysten/wallet-kit` - Wallet connection and management

## Installation

1. Install the new dependencies:
```bash
npm install
```

## Features Added

- **Wallet Connection**: Connect/disconnect Sui wallets via the navbar
- **dApp Demo**: Interactive component showing wallet status and balance fetching
- **Sui Integration**: Uses Sui devnet for blockchain interactions

## Components Added

- `components/wallet-provider.tsx` - WalletKitProvider wrapper
- `components/wallet-connect.tsx` - Wallet connection button
- `components/dapp-demo.tsx` - Interactive dApp demonstration
- `components/ui/card.tsx` - Card UI component

## Usage

1. Start the development server:
```bash
npm run dev
```

2. Open your browser and navigate to `http://localhost:3000`
3. Click "Connect Wallet" in the navbar
4. Use the dApp demo section to interact with the Sui blockchain

## Wallet Support

The integration uses Mysten Wallet Kit which supports:
- Sui Wallet
- Ethos Wallet
- Suiet Wallet
- And other Wallet Standard compatible wallets

## Network

Currently configured to use Sui Testnet. To change networks, update the `connection` configuration in `components/dapp-demo.tsx`.