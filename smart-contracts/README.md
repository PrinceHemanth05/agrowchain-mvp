# 🌾 Agrowchain - Decentralized Agricultural Supply Chain

Agrowchain (Store Karnataka) is a full-stack Web3 application designed to track agricultural produce from farm to table. By leveraging Ethereum smart contracts, it provides an immutable, transparent, and verifiable ledger of a crop's journey through the supply chain.

---

## 🏗️ System Architecture

The application is built on a 3-tier Decentralized Application (dApp) architecture:

### 1. The Frontend (React + Vite)
*   **Role:** The user interface for farmers and supply chain inspectors.
*   **Action:** Captures crop data (e.g., "Organic Tomatoes", "500kg") and sends it to the backend. Automatically generates dynamic QR codes based on real-time blockchain data for instant tracking.

### 2. The Backend Middleware (Node.js + Express)
*   **Role:** The secure bridge between standard web traffic and the blockchain. 
*   **Action:** Receives HTTP requests from the frontend, uses `ethers.js` and a secure Private Key to cryptographically sign the data, and broadcasts the transaction to the Ethereum network.

### 3. The Blockchain (Hardhat + Solidity)
*   **Role:** The immutable, permanent database.
*   **Action:** Executes the `Agrowchain.sol` smart contract logic to permanently store the crop details, timestamp, and current status. Returns a cryptographic transaction hash as a digital receipt.

---

## 🚀 Key Features

*   **Immutable Ledger:** Record crop details permanently on the blockchain.
*   **Dynamic Status Updates:** Update a batch's status (e.g., *Harvested* ➔ *In Transit* ➔ *Delivered*) with secure, cryptographically signed transactions.
*   **Instant Verification:** Scan dynamic QR codes to verify authenticity and trace origin directly from the network.
*   **Live Dashboard:** View real-time network status, data integrity metrics, and a feed of recent blockchain activity.

---

## 🛠️ Tech Stack

*   **Frontend:** React, Vite, React Router, Lucide React, qrcode.react
*   **Backend:** Node.js, Express, Ethers.js (v6), Cors, Dotenv
*   **Smart Contracts:** Solidity, Hardhat, Local Ethereum Node

---

## 💻 Getting Started (Local Development)

To run this full-stack Web3 application, you must run the blockchain, the backend, and the frontend simultaneously across three separate terminals.

### 1. Start the Local Blockchain
Open a terminal in the `smart-contracts` folder and start your local Hardhat node:
```bash
npx hardhat node
(Leave this terminal running. It will act as your local Ethereum network).

2. Deploy the Smart Contract
Open a second terminal in the smart-contracts folder and deploy your contract:

Bash
npx hardhat run scripts/deploy.js --network localhost
Important: Copy the newly generated Contract Address (e.g., 0x...) that prints in the terminal.

3. Start the Backend API
Navigate to the backend folder.

Open your .env or server.js file and paste your new Contract Address into the ethers.Contract setup.

Install dependencies and start the Node.js server:

Bash
npm install
npm run dev
4. Start the Frontend Application
Open a third terminal in the frontend folder and spin up the React app:

Bash
npm install
npm run dev
Navigate to http://localhost:5173 in your browser to view the application!

🔒 Security Note
This local environment uses Hardhat's default test accounts. Never use these publicly known private keys or mnemonic phrases on the Ethereum mainnet. For production deployment, generate a new, secure private key via a crypto wallet (like MetaMask) and store it securely in a hidden .env file.

📜 License
MIT License