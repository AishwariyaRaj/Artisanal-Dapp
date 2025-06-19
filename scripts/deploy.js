const hre = require("hardhat");

async function main() {
  const ArtisanNFT = await hre.ethers.getContractFactory("ArtisanNFT");
  const artisanNFT = await ArtisanNFT.deploy();

  await artisanNFT.waitForDeployment();
  
  const address = await artisanNFT.getAddress();
  console.log("ArtisanNFT deployed to:", address);
  
  // For testing purposes, register the deployer as an artisan
  const [deployer] = await ethers.getSigners();
  await artisanNFT.registerArtisan(deployer.address);
  console.log("Registered deployer as artisan:", deployer.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });