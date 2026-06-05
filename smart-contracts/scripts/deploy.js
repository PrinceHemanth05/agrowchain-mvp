const hre = require("hardhat");

async function main() {
  console.log("🚀 Initializing deployment to Polygon Amoy...");

  const Agrowchain = await hre.ethers.getContractFactory("Agrowchain");
  const agrowchain = await Agrowchain.deploy();
  await agrowchain.waitForDeployment();

  const address = await agrowchain.getAddress();
  console.log(`✅ SUCCESS! Agrowchain V2 deployed to: ${address}`);
}

main().catch((error) => {
  console.error("❌ Deployment Failed:", error);
  process.exitCode = 1;
});