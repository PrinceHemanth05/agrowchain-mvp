# 🌾 Agrowchain - Decentralized Agricultural Supply Chain

Agrowchain (Store Karnataka) is a hybrid full-stack Web3 application designed to track agricultural produce from farm to table. By combining Ethereum smart contracts with a reliable relational database and AI insights, it provides an immutable, transparent, and verifiable ledger of a crop's journey through the supply chain.

---

## 🏗️ System Architecture

The application is built on a robust 4-tier decentralized architecture:

1. **The Frontend (React + Vite)**
   * **Role:** Responsive client UI for farmers, distributors, retailers, and network administrators.
   * **Action:** Captures profile registrations and crop batches, triggers state updates, and renders live blockchain activity feeds and dynamic verification QR codes.

2. **The Backend Middleware (Node.js + Express)**
   * **Role:** A secure, authenticated bridge separating public reads from protected blockchain/database writes.
   * **Action:** Validates incoming traffic via API keys, acts as an automated transaction signer using an administrative wallet private key, and hosts specialized analytical engines.

3. **The Database & AI Layer (Supabase + Gemini API)**
   * **Role:** Off-chain relational storage and intelligence processing.
   * **Action:** Supabase tracks dense textual metadata (names, phone numbers, operating cities) to optimize frontend rendering speeds, while the Gemini API parses recent tracking history to deliver automated supply chain diagnostic alerts.

4. **The Blockchain Network (Hardhat + Solidity)**
   * **Role:** The immutable, cryptographic ecosystem anchor.
   * **Action:** Executes smart contract state logic to store permanent crop indices, track ownership transitions, and compute automated multi-party participant trust scores.

---

## 🚀 Key Features

* **Immutable Ledger:** Record harvest particulars securely and permanently across decentralized nodes.
* **Dual-State Synchronization:** Seamless architecture that safely binds off-chain PostgreSQL data with on-chain EVM data.
* **Dynamic Status Updates:** Update a batch's status (*Harvested* ➔ *In Transit* ➔ *Delivered*) using cryptographically signed administrative signatures.
* **Automated Trust Scoring:** Decentralized trust engine that rewards supply chain participants based on milestone delivery reliability.
* **AI Supply Chain Insights:** Real-time logistics bottleneck diagnostics powered by the `gemini-2.5-flash` model.

---

## 📋 Pre-requisites & Installation Manifest

To run this project on a new development device, ensure you have **Node.js (v18.x or higher)** and **npm** installed. Open separate terminal windows for each of the three micro-directories and execute the exact dependency profiles below:

### 1. Smart Contracts Directory (`/smart-contracts`)
This directory runs your local Ethereum development node, compiles your smart contract code, and deploys it to your test environment.

```bash
# Navigate to directory
cd smart-contracts

# Install core Hardhat engine and testing framework
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox

# Install configuration support utilities
npm install dotenv ethers
2. Backend API Middleware Directory (/backend)
The backend securely manages off-chain databases, handles administrative private key signings, and operates the generative AI engine.

Bash
# Navigate to directory
cd backend

# Install express server framework and security layers
npm install express cors dotenv

# Install Web3 connection and off-chain database clients
npm install ethers @supabase/supabase-js

# Install Artificial Intelligence processing components
npm install @google/generative-ai
3. Frontend Client Application Directory (/frontend)
The client app renders the interactive dashboard, manages live browser-level MetaMask hookups, and handles form controls.

Bash
# Navigate to directory
cd frontend

# Install core React application environment
npm install react react-dom react-router-dom

# Install iconography and visual tracking generators
npm install lucide-react qrcode.react

# Install Vite compiler engine (Dev Dependencies)
npm install --save-dev vite @types/react @types/react-dom @vitejs/plugin-react Tailwindcss postcss autoprefixer
💻 Local Execution Blueprint
Run the backend, blockchain network, and user interface simultaneously across three distinct terminals in this exact sequence:

Step 1: Initialize the EVM Blockchain
From your first terminal inside the smart-contracts folder, spin up the local network node:

Bash
npx hardhat node
⚠️ Keep this terminal running. This process maintains your local Ethereum network memory stack and prints test accounts with pre-funded mock gas fees.

Step 2: Compile & Deploy Smart Contracts
Open a second terminal window inside the smart-contracts folder and broadcast the contract to your running network:

Bash
npx hardhat run scripts/deploy.js --network localhost
Take note of the newly compiled Contract Address printed in your console.

Copy this address value into your backend .env file under CONTRACT_ADDRESS.

Step 3: Configure Environment Variables & Start Backend
Navigate to your backend terminal. Create a .env configuration file matching the schema below:

Code snippet
PORT=5000
PRIVATE_KEY=0x... # (Insert your Hardhat Node account 0 private key here)
CONTRACT_ADDRESS=0x... # (Insert the address copied from Step 2 here)
RPC_URL=[http://127.0.0.1:8545](http://127.0.0.1:8545)
SUPABASE_URL=your_supabase_project_url
SUPABASE_KEY=your_supabase_anon_public_key
GEMINI_API_KEY=your_google_gemini_api_key
FRONTEND_API_KEY=agrowchain-secure-mvp-key-2026
Once saved, start your API service:

Bash
npm run dev
Step 4: Run the React Client Framework
Open your final terminal inside the frontend folder and launch the interface server:

Bash
npm run dev
Open your browser and navigate to http://localhost:5173 to interact with your decentralized application ecosystem.

🔒 Security Posture
Key Separation: Local test files use Hardhat's default public-facing private keys. Never commit real production private keys or MetaMask seed phrases to a Git history.

Route Protection: Destructive or modifying endpoints (such as user or batch initialization) require an explicit x-api-key validation header checked server-side before execution.

📜 License
Distributed under the MIT License.

***