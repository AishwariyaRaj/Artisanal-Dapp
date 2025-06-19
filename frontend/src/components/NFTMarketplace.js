import React, { useState, useEffect } from 'react';
import {
  Grid, Box, Heading, Text, Button, Spinner, 
  SimpleGrid, Image, Badge, Flex, useToast,
  Modal, ModalOverlay, ModalContent, ModalHeader,
  ModalBody, ModalCloseButton, ModalFooter,
  Input, useDisclosure
} from '@chakra-ui/react';
import { useWeb3 } from '../context/Web3Context';
import { ethers } from 'ethers';

export default function NFTMarketplace() {
  const { contract, account, isConnected } = useWeb3();
  const [nfts, setNfts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedNFT, setSelectedNFT] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const [bidAmount, setBidAmount] = useState('');
  const [processingPurchase, setProcessingPurchase] = useState(false);

  useEffect(() => {
    if (contract) {
      loadNFTs();
    }
  }, [contract, account]);

  const loadNFTs = async () => {
    try {
      setLoading(true);
      const totalSupply = await contract.totalSupply();
      console.log("Total supply:", totalSupply.toString());
      
      const items = [];
      for (let i = 1; i <= totalSupply; i++) {
        try {
          const tokenId = i.toString();
          const owner = await contract.ownerOf(tokenId);
          const tokenURI = await contract.tokenURI(tokenId);
          const saleInfo = await contract.isForSale(tokenId);
          const isForSale = saleInfo[0];
          const price = saleInfo[1];
          const metadata = await contract.getItemMetadata(tokenId);
          
          // Fetch IPFS metadata if available
          let ipfsMetadata = {};
          if (tokenURI && tokenURI.startsWith('ipfs://')) {
            try {
              const ipfsHash = tokenURI.replace('ipfs://', '');
              const response = await fetch(`https://ipfs.io/ipfs/${ipfsHash}`);
              if (response.ok) {
                ipfsMetadata = await response.json();
              }
            } catch (error) {
              console.error("Error fetching IPFS metadata:", error);
            }
          }
          
          items.push({
            tokenId,
            owner,
            tokenURI,
            isForSale,
            price: ethers.formatEther(price),
            description: metadata.description || ipfsMetadata.description || "No description",
            materials: metadata.materials || "Unknown",
            artisanDetails: metadata.artisanDetails || "Unknown",
            name: ipfsMetadata.name || `Artisan NFT #${tokenId}`,
            image: ipfsMetadata.image || "https://via.placeholder.com/400?text=Artisan+NFT"
          });
        } catch (error) {
          console.error(`Error loading NFT #${i}:`, error);
        }
      }
      
      setNfts(items);
      setLoading(false);
    } catch (error) {
      console.error("Error loading NFTs:", error);
      setLoading(false);
    }
  };

  const handlePurchase = async () => {
    if (!selectedNFT) return;
    
    try {
      setProcessingPurchase(true);
      const price = ethers.parseEther(selectedNFT.price);
      
      const tx = await contract.purchaseNFT(selectedNFT.tokenId, {
        value: price
      });
      
      toast({
        title: "Transaction Sent",
        description: `Purchase transaction sent: ${tx.hash}`,
        status: "info",
        duration: 5000,
        isClosable: true,
      });
      
      await tx.wait();
      
      toast({
        title: "Purchase Successful",
        description: `You have successfully purchased NFT #${selectedNFT.tokenId}`,
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      
      onClose();
      loadNFTs();
    } catch (error) {
      console.error("Error purchasing NFT:", error);
      toast({
        title: "Purchase Failed",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setProcessingPurchase(false);
    }
  };

  const handleNFTClick = (nft) => {
    setSelectedNFT(nft);
    onOpen();
  };

  if (loading) {
    return (
      <Box textAlign="center" py={10}>
        <Spinner size="xl" />
        <Text mt={4}>Loading NFTs...</Text>
      </Box>
    );
  }

  return (
    <Box p={5}>
      <Heading mb={6}>Artisan NFT Marketplace</Heading>
      
      {nfts.length === 0 ? (
        <Box textAlign="center" py={10}>
          <Text fontSize="xl">No NFTs available in the marketplace</Text>
        </Box>
      ) : (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={10}>
          {nfts.map((nft) => (
            <Box 
              key={nft.tokenId}
              borderWidth="1px"
              borderRadius="lg"
              overflow="hidden"
              boxShadow="md"
              transition="transform 0.3s"
              _hover={{ transform: 'scale(1.02)' }}
              cursor="pointer"
              onClick={() => handleNFTClick(nft)}
            >
              <Image 
                src={nft.image.startsWith('ipfs://') 
                  ? `https://ipfs.io/ipfs/${nft.image.replace('ipfs://', '')}`
                  : nft.image
                }
                alt={nft.name}
                height="250px"
                width="100%"
                objectFit="cover"
                fallbackSrc="https://via.placeholder.com/400?text=Artisan+NFT"
              />
              
              <Box p={4}>
                <Flex justify="space-between" align="center">
                  <Heading size="md">{nft.name}</Heading>
                  {nft.isForSale && (
                    <Badge colorScheme="green" fontSize="0.8em" p={1}>
                      For Sale
                    </Badge>
                  )}
                </Flex>
                
                <Text mt={2} noOfLines={2}>{nft.description}</Text>
                
                <Flex mt={3} justify="space-between" align="center">
                  <Text fontWeight="bold">
                    {nft.isForSale ? `${nft.price} ETH` : 'Not for sale'}
                  </Text>
                  <Text fontSize="sm" color="gray.500">
                    ID: #{nft.tokenId}
                  </Text>
                </Flex>
              </Box>
            </Box>
          ))}
        </SimpleGrid>
      )}
      
      {/* NFT Detail Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          {selectedNFT && (
            <>
              <ModalHeader>{selectedNFT.name}</ModalHeader>
              <ModalCloseButton />
              <ModalBody>
                <Image 
                  src={selectedNFT.image.startsWith('ipfs://') 
                    ? `https://ipfs.io/ipfs/${selectedNFT.image.replace('ipfs://', '')}`
                    : selectedNFT.image
                  }
                  alt={selectedNFT.name}
                  width="100%"
                  borderRadius="md"
                  mb={4}
                  fallbackSrc="https://via.placeholder.com/400?text=Artisan+NFT"
                />
                
                <Text fontWeight="bold" mb={2}>Description:</Text>
                <Text mb={4}>{selectedNFT.description}</Text>
                
                <Grid templateColumns="repeat(2, 1fr)" gap={4} mb={4}>
                  <Box>
                    <Text fontWeight="bold">Materials:</Text>
                    <Text>{selectedNFT.materials}</Text>
                  </Box>
                  <Box>
                    <Text fontWeight="bold">Artisan:</Text>
                    <Text>{selectedNFT.artisanDetails}</Text>
                  </Box>
                </Grid>
                
                <Box p={3} bg="gray.50" borderRadius="md" mb={4}>
                  <Text fontWeight="bold">Owner:</Text>
                  <Text fontSize="sm" wordBreak="break-all">{selectedNFT.owner}</Text>
                </Box>
                
                {selectedNFT.isForSale && (
                  <Box p={3} bg="green.50" borderRadius="md">
                    <Text fontWeight="bold" color="green.500">
                      Price: {selectedNFT.price} ETH
                    </Text>
                  </Box>
                )}
              </ModalBody>
              
              <ModalFooter>
                {selectedNFT.isForSale && selectedNFT.owner !== account && (
                  <Button 
                    colorScheme="blue" 
                    mr={3} 
                    onClick={handlePurchase}
                    isLoading={processingPurchase}
                    loadingText="Processing..."
                  >
                    Buy for {selectedNFT.price} ETH
                  </Button>
                )}
                <Button variant="ghost" onClick={onClose}>Close</Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </Box>
  );
}
