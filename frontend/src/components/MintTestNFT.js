import React, { useState } from 'react';
import {
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  useDisclosure,
  VStack,
  Alert,
  AlertIcon,
  useToast,
  Box
} from '@chakra-ui/react';
import { useWeb3 } from '../context/Web3Context';
import { uploadToIPFS, uploadMetadataToIPFS, createNFTMetadata } from '../services/ipfs';
import { ethers } from 'ethers';

export default function MintTestNFT() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { contract, account, isAdmin, isArtisan } = useWeb3();
  const toast = useToast();
  
  const [name, setName] = useState('Test NFT');
  const [description, setDescription] = useState('This is a test NFT');
  const [materials, setMaterials] = useState('Digital');
  const [artisanDetails, setArtisanDetails] = useState('Test Artisan');
  const [price, setPrice] = useState('0.01');
  const [loading, setLoading] = useState(false);
  const [mintSuccess, setMintSuccess] = useState(false);
  const [tokenId, setTokenId] = useState(null);
  
  const resetForm = () => {
    setName('Test NFT');
    setDescription('This is a test NFT');
    setMaterials('Digital');
    setArtisanDetails('Test Artisan');
    setPrice('0.01');
    setMintSuccess(false);
    setTokenId(null);
  };
  
  const handleOpenModal = () => {
    resetForm();
    onOpen();
  };
  
  const handleMint = async () => {
    if (!contract || !account) {
      toast({
        title: 'Error',
        description: 'Please connect your wallet first',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }
    
    try {
      setLoading(true);
      
      // Create metadata
      const metadata = createNFTMetadata(
        name,
        description,
        'https://via.placeholder.com/500?text=Test+NFT',
        materials,
        artisanDetails
      );
      
      console.log("Created metadata:", metadata);
      
      // Upload metadata to IPFS
      const metadataURI = await uploadMetadataToIPFS(metadata);
      const tokenURI = `ipfs://${metadataURI}`;
      
      console.log("Minting NFT with URI:", tokenURI);
      
      // Ensure contract is properly connected with signer
      if (!contract.runner || !contract.runner.provider) {
        throw new Error("Contract not properly initialized with signer");
      }
      
      // Mint NFT with proper error handling
      const tx = await contract.mintNFT(
        account,
        description,
        materials,
        artisanDetails,
        tokenURI
      );
      
      console.log("Mint transaction sent:", tx.hash);
      
      // Wait for confirmation with timeout
      const receipt = await tx.wait();
      console.log("Mint transaction confirmed:", receipt);
      
      // Get the new token ID
      const totalSupply = await contract.totalSupply();
      const newTokenId = totalSupply.toString();
      console.log("New token ID:", newTokenId);
      setTokenId(newTokenId);
      
      // Set NFT for sale if price is provided
      if (parseFloat(price) > 0) {
        const priceInWei = ethers.parseEther(price);
        console.log(`Setting NFT #${newTokenId} for sale at ${price} ETH (${priceInWei} wei)`);
        
        const saleTx = await contract.setNFTForSale(newTokenId, priceInWei);
        console.log("Sale transaction sent:", saleTx.hash);
        await saleTx.wait();
        console.log("Sale transaction confirmed");
      }
      
      setMintSuccess(true);
      toast({
        title: 'Success',
        description: `NFT #${newTokenId} minted successfully!`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Error minting NFT:", error);
      
      // More descriptive error messages
      let errorMessage = error.message;
      if (error.message.includes("user rejected")) {
        errorMessage = "Transaction was rejected in your wallet";
      } else if (error.message.includes("insufficient funds")) {
        errorMessage = "You don't have enough ETH to complete this transaction";
      }
      
      toast({
        title: 'Error',
        description: `Failed to mint NFT: ${errorMessage}`,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Add this function
  const monitorTransaction = async (txHash) => {
    try {
      const provider = contract.runner.provider;
      const tx = await provider.getTransaction(txHash);
      console.log("Transaction details:", tx);
      
      // Wait for confirmation
      const receipt = await tx.wait();
      console.log("Transaction receipt:", receipt);
      return receipt;
    } catch (error) {
      console.error("Error monitoring transaction:", error);
      throw error;
    }
  };
  
  // Only show the button if user is admin or artisan
  if (!isAdmin && !isArtisan) {
    return null;
  }
  
  return (
    <>
      <Button 
        colorScheme="blue" 
        onClick={handleOpenModal}
        size="sm"
        ml={2}
      >
        Mint Test NFT
      </Button>
      
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Mint Test NFT</ModalHeader>
          <ModalCloseButton />
          
          <ModalBody>
            {mintSuccess ? (
              <Alert status="success" mb={4}>
                <AlertIcon />
                NFT #{tokenId} minted successfully!
              </Alert>
            ) : (
              <VStack spacing={4}>
                <FormControl>
                  <FormLabel>Name</FormLabel>
                  <Input 
                    value={name} 
                    onChange={(e) => setName(e.target.value)}
                    placeholder="NFT Name"
                  />
                </FormControl>
                
                <FormControl>
                  <FormLabel>Description</FormLabel>
                  <Textarea 
                    value={description} 
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="NFT Description"
                  />
                </FormControl>
                
                <FormControl>
                  <FormLabel>Materials</FormLabel>
                  <Input 
                    value={materials} 
                    onChange={(e) => setMaterials(e.target.value)}
                    placeholder="Materials used"
                  />
                </FormControl>
                
                <FormControl>
                  <FormLabel>Artisan Details</FormLabel>
                  <Input 
                    value={artisanDetails} 
                    onChange={(e) => setArtisanDetails(e.target.value)}
                    placeholder="Artisan information"
                  />
                </FormControl>
                
                <FormControl>
                  <FormLabel>Price (ETH) - Set to 0 to not list for sale</FormLabel>
                  <Input 
                    value={price} 
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="0.01"
                    type="number"
                    step="0.001"
                  />
                </FormControl>
              </VStack>
            )}
          </ModalBody>
          
          <ModalFooter>
            {mintSuccess ? (
              <Button colorScheme="blue" onClick={onClose}>
                Close
              </Button>
            ) : (
              <>
                <Button variant="ghost" mr={3} onClick={onClose}>
                  Cancel
                </Button>
                <Button 
                  colorScheme="blue" 
                  onClick={handleMint} 
                  isLoading={loading}
                  loadingText="Minting..."
                >
                  Mint NFT
                </Button>
              </>
            )}
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}



