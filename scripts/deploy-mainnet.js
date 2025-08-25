const hre = require("hardhat");

async function main() {
  // Base mainnet USDC address
  const USDC_ADDRESS = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";
  
  // Your platform wallet that will receive fees
  const PLATFORM_WALLET = "0xe05412c4ae1db9ee44b7e9231b76379073e8d5a3";
  
  console.log("Deploying KnowEmpireEscrow to Base mainnet...");

  const KnowEmpireEscrow = await hre.ethers.getContractFactory("KnowEmpireEscrow");
  const escrow = await KnowEmpireEscrow.deploy(USDC_ADDRESS, PLATFORM_WALLET);

  await escrow.deployed();

  console.log(`KnowEmpireEscrow deployed to ${escrow.address}`);
  console.log("Waiting for 5 block confirmations...");
  
  // Wait for 5 block confirmations
  await escrow.deployTransaction.wait(5);
  
  console.log("Deployment confirmed. Verifying contract...");

  // Verify the contract
  try {
    await hre.run("verify:verify", {
      address: escrow.address,
      constructorArguments: [USDC_ADDRESS, PLATFORM_WALLET],
    });
    console.log("Contract verified successfully");
  } catch (error) {
    console.error("Error verifying contract:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
