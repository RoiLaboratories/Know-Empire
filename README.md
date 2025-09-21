# KnowEmpire-MVP

## Overview

KnowEmpire is a decentralized marketplace MVP built with Next.js, Hardhat, and smart contracts. It enables buyers and sellers to interact, manage orders, and resolve disputes in a trustless environment.

## Features

- Decentralized escrow for secure transactions
- Buyer and seller onboarding
- Product listing and management
- Cart and order management
- Dispute resolution
- Leaderboard and profile features
- Authentication via Farcaster and Privy
- Supabase integration for data storage

## Tech Stack

- **Frontend:** Next.js, React, Tailwind CSS
- **Smart Contracts:** Solidity, Hardhat
- **Authentication:** Farcaster, Privy
- **Backend/DB:** Supabase
- **Other:** Wagmi, Viem, Formik, Yup

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- npm or yarn
- Hardhat (for smart contract development)
- Supabase account (for backend)

### Installation

```bash
npm install
# or
yarn install
```

### Running the App

```bash
npm run dev
```

Visit `http://localhost:3000` in your browser.

### Building for Production

```bash
npm run build
npm start
```

### Smart Contract Commands

- Compile: `npm run compile`
- Test: `npm run test`
- Deploy (Sepolia): `npm run deploy:sepolia`
- Deploy (Mainnet): `npm run deploy:mainnet`

## Folder Structure

- `app/` - Next.js app routes and pages
- `components/` - Reusable React components
- `contracts/` - Solidity smart contracts
- `db/` - Database migrations
- `hooks/` - Custom React hooks
- `providers/` - Context providers
- `public/` - Static assets
- `schema/` - Validation schemas
- `styles/` - CSS files
- `types/` - TypeScript type definitions
- `utils/` - Utility functions

## Contributing

1. Fork the repo and create your branch.
2. Make changes and commit.
3. Open a pull request with a clear description.

## License

Specify your license here.
