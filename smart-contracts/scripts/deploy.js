const hre = require("hardhat");
const fs = require("fs");
const path = require("path");
require("dotenv").config(); // 🛡️ Load hidden environment variables

async function main() {
  console.log("🚀 Deploying Agrowchain Smart Contract...");

  // 1. Get the default Hardhat accounts
  const [deployer] = await hre.ethers.getSigners();
  console.log(`📡 Deploying contracts with the account: ${deployer.address}`);

  // 2. Deploy the contract
  const Agrowchain = await hre.ethers.getContractFactory("Agrowchain");
  const agrowchain = await Agrowchain.deploy();
  await agrowchain.waitForDeployment();

  const contractAddress = await agrowchain.getAddress();
  console.log(`✅ Agrowchain deployed to: ${contractAddress}`);

  // ---------------------------------------------------------
  // 🌱 🛠️ PROFESSIONAL SEEDING PATTERN (Dynamic via .env)
  // ---------------------------------------------------------
  const devWallet = process.env.DEV_TEST_WALLET;
  
  if (devWallet) {
    console.log(`🌱 Development Mode: Seeding wallet from .env...`);
    try {
      // 🛠️ FIXED: Only pass the wallet address, exactly as Agrowchain.sol expects!
      const tx = await agrowchain.addFarmer(devWallet);
      await tx.wait(); // Wait for the block to mine
      
      console.log(`🎁 Successfully registered ${devWallet} as a Farmer on-chain!`);
    } catch (seedError) {
      console.error(`⚠️ Auto-seeding failed: ${seedError.message}`);
    }
  } else {
    console.log(`🔒 Production Mode: No dev wallet detected in .env. Skipping seeding.`);
  }
  // ---------------------------------------------------------

  // 3. Define the paths where the address needs to be saved
  const frontendConfigPath = path.join(__dirname, "../../frontend/src/config/address.json");
  const backendEnvPath = path.join(__dirname, "../../backend/.env");

  // 4. AUTOMATICALLY UPDATE FRONTEND JSON
  const addressData = JSON.stringify({ address: contractAddress }, null, 2);
  try {
    fs.writeFileSync(frontendConfigPath, addressData);
    console.log(`📝 Successfully updated Frontend: ${frontendConfigPath}`);
  } catch (err) {
    console.error(`⚠️ Could not write to Frontend address.json: ${err.message}`);
  }

  // 5. AUTOMATICALLY UPDATE BACKEND .env
  try {
    let envContent = "";
    if (fs.existsSync(backendEnvPath)) {
      envContent = fs.readFileSync(backendEnvPath, "utf8");
    }

    if (envContent.includes("CONTRACT_ADDRESS=")) {
      envContent = envContent.replace(/CONTRACT_ADDRESS=.*/g, `CONTRACT_ADDRESS=${contractAddress}`);
    } else {
      envContent += `\nCONTRACT_ADDRESS=${contractAddress}\n`;
    }

    fs.writeFileSync(backendEnvPath, envContent);
    console.log(`📝 Successfully updated Backend: ${backendEnvPath}`);
  } catch (err) {
    console.error(`⚠️ Could not write to Backend .env: ${err.message}`);
  }

  console.log("🎉 Deployment and auto-sync complete!");
}

main()
  .then(() => {
    setTimeout(() => process.exit(0), 100); 
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });