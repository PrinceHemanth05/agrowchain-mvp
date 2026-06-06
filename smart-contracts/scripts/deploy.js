const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🚀 Deploying Agrowchain Smart Contract...");

  // 1. Deploy the contract
  const Agrowchain = await hre.ethers.getContractFactory("Agrowchain");
  const agrowchain = await Agrowchain.deploy();
  await agrowchain.waitForDeployment();

  // Get the address (ethers v6 syntax)
  const contractAddress = await agrowchain.getAddress();
  console.log(`✅ Agrowchain deployed to: ${contractAddress}`);

  // 2. Define the paths where the address needs to be saved
  // Adjust these relative paths if your folder structure is slightly different!
  const frontendConfigPath = path.join(__dirname, "../../frontend/src/config/address.json");
  const backendEnvPath = path.join(__dirname, "../../backend/.env");

  // 3. 🌐 AUTOMATICALLY UPDATE FRONTEND JSON
  const addressData = JSON.stringify({ address: contractAddress }, null, 2);
  try {
    fs.writeFileSync(frontendConfigPath, addressData);
    console.log(`📝 Successfully updated Frontend: ${frontendConfigPath}`);
  } catch (err) {
    console.error(`⚠️ Could not write to Frontend address.json: ${err.message}`);
  }

  // 4. ⚙️ AUTOMATICALLY UPDATE BACKEND .env
  try {
    let envContent = "";
    if (fs.existsSync(backendEnvPath)) {
      envContent = fs.readFileSync(backendEnvPath, "utf8");
    }

    // Check if CONTRACT_ADDRESS already exists in the .env file
    if (envContent.includes("CONTRACT_ADDRESS=")) {
      // Replace the existing line
      envContent = envContent.replace(/CONTRACT_ADDRESS=.*/g, `CONTRACT_ADDRESS=${contractAddress}`);
    } else {
      // Append it to the bottom if it doesn't exist
      envContent += `\nCONTRACT_ADDRESS=${contractAddress}\n`;
    }

    fs.writeFileSync(backendEnvPath, envContent);
    console.log(`📝 Successfully updated Backend: ${backendEnvPath}`);
  } catch (err) {
    console.error(`⚠️ Could not write to Backend .env: ${err.message}`);
  }

  console.log("🎉 Deployment and auto-sync complete!");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});