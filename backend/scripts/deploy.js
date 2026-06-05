import hre from "hardhat";

async function main() {
  console.log("🚀 Initializing deployment to Polygon Amoy...");

  // Grab the V2 Contract Blueprint
  const Agrowchain = await hre.ethers.getContractFactory("Agrowchain");
  
  // Deploy it to the network
  const agrowchain = await Agrowchain.deploy();

  // Wait for the blockchain to officially confirm the transaction
  await agrowchain.waitForDeployment();

  const address = await agrowchain.getAddress();
  console.log(`✅ SUCCESS! Agrowchain V2 deployed to: ${address}`);
}

main().catch((error) => {
  console.error("❌ Deployment Failed:", error);
  process.exitCode = 1;
});