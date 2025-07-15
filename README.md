# Chennai Artisan NFT

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Build](https://img.shields.io/badge/build-passing-brightgreen)]()
[![OpenZeppelin](https://img.shields.io/badge/OpenZeppelin-Contracts-blue)](https://openzeppelin.com/contracts/)

A decentralized NFT marketplace empowering Chennai’s artisans to mint, showcase, and trade unique digital collectibles on the blockchain.

---

## 🚀 Project Overview

**Chennai Artisan NFT** is a full-stack decentralized application (dApp) designed to support local artisans in Chennai. The platform enables artists to mint their creations as NFTs, manage collections, and participate in a transparent, global marketplace.

---

## ✨ Features

- **NFT Minting:** Mint unique ERC-721 tokens with custom metadata and IPFS storage.
- **Marketplace:** List, buy, and sell NFTs in a decentralized environment.
- **User Dashboards:** Separate dashboards for admins and artisans.
- **IPFS Integration:** Decentralized storage for NFT metadata and assets.
- **Role-Based Access:** Secure access for different user roles.

---

## 🛠️ Tech Stack

- **Smart Contracts:** Solidity, Hardhat, OpenZeppelin
- **Frontend:** React.js, Web3.js/Ethers.js
- **Storage:** IPFS-Pinata
- **Other:** Node.js, JavaScript

---

## 🌐 Sepolia Testnet Deployment

This project is deployed and tested on the [Sepolia Ethereum Testnet](https://sepolia.etherscan.io/).

### Deploying to Sepolia

 **Deploy contracts to Sepolia**
   ```bash
   npx hardhat run scripts/deploy.js --network sepolia
   ```
---

## ⚡ Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v14+)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [MetaMask](https://metamask.io/) browser extension
- [Hardhat](https://hardhat.org/)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/AishwariyaRaj/Artisanal-Dapp.git
   cd chennai-artisan-nft
   ```

2. **Install backend dependencies**
   ```bash
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd frontend
   npm install
   ```

### Running the Project (Sepolia)

1. **Start the Frontend**
   ```bash
   cd frontend
   npm start
   ```
2. **Connect MetaMask to Sepolia**  
   Ensure your MetaMask is set to the Sepolia network and has test ETH.

3. **Interact with the dApp**  
   Open [http://localhost:3000](http://localhost:3000) and use the app as normal, now connected to Sepolia.

---

## 🤝 Contributing

We welcome contributions! Please fork the repository, create a new branch, and submit a pull request. For major changes, open an issue first to discuss your ideas.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

> **Empowering Chennai’s artisans through blockchain technology.** 
