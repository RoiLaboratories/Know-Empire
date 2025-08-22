const hre = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  const KnowEmpireEscrow = await hre.ethers.getContractFactory("KnowEmpireEscrow");
  const escrow = await KnowEmpireEscrow.deploy();

  await escrow.deployed();

  console.log("KnowEmpireEscrow deployed to:", escrow.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
