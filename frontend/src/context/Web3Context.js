import React, { createContext, useContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';
import ArtisanNFTArtifact from '../artifacts/contracts/ArtisanNFT.sol/ArtisanNFT.json';

const Web3Context = createContext();

export const useWeb3 = () => useContext(Web3Context);

export const Web3Provider = ({ children }) => {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isArtisan, setIsArtisan] = useState(false);
  const [networkId, setNetworkId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Contract address - update this with your deployed contract address
  const contractAddress = process.env.REACT_APP_CONTRACT_ADDRESS;

  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        
        // Check if MetaMask is installed
        if (window.ethereum) {
          // Create ethers provider
          const ethersProvider = new ethers.BrowserProvider(window.ethereum);
          setProvider(ethersProvider);
          
          // Get network
          const network = await ethersProvider.getNetwork();
          setNetworkId(network.chainId);
          
          // Check if user is already connected
          const accounts = await ethersProvider.listAccounts();
          if (accounts.length > 0) {
            setAccount(accounts[0].address);
            
            // Get signer
            const ethersSigner = await ethersProvider.getSigner();
            setSigner(ethersSigner);
            
            // Initialize contract
            const artisanContract = new ethers.Contract(
              contractAddress,
              ArtisanNFTArtifact.abi,
              ethersSigner
            );
            setContract(artisanContract);
            
            // Check roles
            await checkRoles(accounts[0].address, artisanContract);
          }
          
          // Listen for account changes
          window.ethereum.on('accountsChanged', handleAccountsChanged);
          window.ethereum.on('chainChanged', () => window.location.reload());
        } else {
          setError("Please install MetaMask to use this application");
        }
      } catch (err) {
        console.error("Initialization error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    init();
    
    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      }
    };
  }, []);
  
  const handleAccountsChanged = async (accounts) => {
    if (accounts.length === 0) {
      // User disconnected
      setAccount(null);
      setIsAdmin(false);
      setIsArtisan(false);
    } else {
      // Account changed
      setAccount(accounts[0]);
      if (contract) {
        await checkRoles(accounts[0], contract);
      }
    }
  };
  
  const checkRoles = async (address, contract) => {
    try {
      const adminRole = await contract.ADMIN_ROLE();
      const artisanRole = await contract.ARTISAN_ROLE();
      
      const isUserAdmin = await contract.hasRole(adminRole, address);
      const isUserArtisan = await contract.hasRole(artisanRole, address);
      
      setIsAdmin(isUserAdmin);
      setIsArtisan(isUserArtisan);
      
      console.log(`User roles - Admin: ${isUserAdmin}, Artisan: ${isUserArtisan}`);
    } catch (error) {
      console.error("Error checking roles:", error);
    }
  };
  
  const connectWallet = async () => {
    try {
      if (!window.ethereum) {
        throw new Error("MetaMask is not installed");
      }
      
      setLoading(true);
      
      // Request account access
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      
      if (accounts.length === 0) {
        throw new Error("No accounts found. Please unlock MetaMask.");
      }
      
      setAccount(accounts[0]);
      
      // Get signer
      const ethersProvider = new ethers.BrowserProvider(window.ethereum);
      setProvider(ethersProvider);
      
      const ethersSigner = await ethersProvider.getSigner();
      setSigner(ethersSigner);
      
      // Get network
      const network = await ethersProvider.getNetwork();
      setNetworkId(network.chainId);
      
      // Initialize contract with signer
      const artisanContract = new ethers.Contract(
        contractAddress,
        ArtisanNFTArtifact.abi,
        ethersSigner
      );
      setContract(artisanContract);
      
      // Check roles
      await checkRoles(accounts[0], artisanContract);
      
      setLoading(false);
      return true;
    } catch (error) {
      console.error("Error connecting wallet:", error);
      setError(error.message);
      setLoading(false);
      return false;
    }
  };
  
  const disconnectWallet = () => {
    setAccount(null);
    setIsAdmin(false);
    setIsArtisan(false);
  };
  
  const isArtisanAddress = async (address) => {
    if (!contract) return false;
    try {
      const artisanRole = await contract.ARTISAN_ROLE();
      return await contract.hasRole(artisanRole, address);
    } catch (error) {
      console.error("Error checking artisan status:", error);
      return false;
    }
  };
  
  const value = {
    provider,
    signer,
    contract,
    account,
    isAdmin,
    isArtisan,
    networkId,
    loading,
    error,
    connectWallet,
    disconnectWallet,
    isArtisanAddress
  };
  
  return (
    <Web3Context.Provider value={value}>
      {children}
    </Web3Context.Provider>
  );
};


