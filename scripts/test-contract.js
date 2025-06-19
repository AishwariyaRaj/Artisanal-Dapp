const { ethers } = require("hardhat");

async function main() {
  console.log("Starting contract test...");
  
  // Get the deployed contract
  const [deployer] = await ethers.getSigners();
  console.log("Using account:", deployer.address);
  
  // Get the contract factory
  const ArtisanNFT = await ethers.getContractFactory("ArtisanNFT");
  
  // Get the deployed contract address - replace with your actual deployed contract address
  const contractAddress = process.env.CONTRACT_ADDRESS;
  if (!contractAddress) {
    console.error("Please set CONTRACT_ADDRESS in your environment variables");
    return;
  }
  
  console.log("Contract address:", contractAddress);
  const contract = await ethers.getContractAt("ArtisanNFT", contractAddress);
  
  // Check if the contract is deployed correctly
  const name = await contract.name();
  console.log("Contract name:", name);
  
  // Check roles
  const DEFAULT_ADMIN_ROLE = await contract.DEFAULT_ADMIN_ROLE();
  const ARTISAN_ROLE = await contract.ARTISAN_ROLE();
  
  console.log("DEFAULT_ADMIN_ROLE:", DEFAULT_ADMIN_ROLE);
  console.log("ARTISAN_ROLE:", ARTISAN_ROLE);
  
  // Check if deployer is admin
  const isAdmin = await contract.hasRole(DEFAULT_ADMIN_ROLE, deployer.address);
  console.log("Is deployer admin?", isAdmin);
  
  if (isAdmin) {
    // Test address to register as artisan
    const testAddress = "0x711C527EB5211e38747d82f40E162fEC650C5eAd";
    
    try {
      console.log(`Registering ${testAddress} as artisan...`);
      // Check the correct function signature from the contract
      const tx = await contract.registerArtisan(testAddress);
      await tx.wait();
      console.log("Transaction confirmed!");
      
      // Verify the role was granted
      const isArtisan = await contract.hasRole(ARTISAN_ROLE, testAddress);
      console.log("Is test address artisan now?", isArtisan);
    } catch (error) {
      console.error("Error registering artisan:", error);
      
      // Let's check the contract interface to see available functions
      console.log("Available functions:");
      Object.keys(contract.interface.functions).forEach(fn => {
        console.log(`- ${fn}`);
      });
    }
    
    // Try to mint an NFT
    try {
      console.log("Attempting to mint a test NFT...");
      const tokenURI = "ipfs://QmXExS4BMc1YrH6iWERyryFcDWkvobxryXSwECLrcd7Y1H";
      
      const tx = await contract.mintNFT(
        deployer.address,
        "Test NFT Description",
        "Digital Materials",
        "Test Artisan Details",
        tokenURI
      );
      
      console.log("Mint transaction sent:", tx.hash);
      await tx.wait();
      
      const totalSupply = await contract.totalSupply();
      console.log("Total supply after mint:", totalSupply.toString());
      console.log("NFT minted successfully!");
    } catch (error) {
      console.error("Error minting NFT:", error);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });