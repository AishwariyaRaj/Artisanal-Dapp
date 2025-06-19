import React, { useState, useEffect } from 'react';
import {
  Box, Heading, Text, SimpleGrid, Image, Badge, Flex, 
  Spinner, Button, useDisclosure, Modal, ModalOverlay,
  ModalContent, ModalHeader, ModalBody, ModalCloseButton,
  ModalFooter, FormControl, FormLabel, Input, useToast,
  Alert, AlertIcon, Tabs, TabList, TabPanels, Tab, TabPanel,
  Grid, Divider, RepeatIcon
} from '@chakra-ui/react';
import { useWeb3 } from '../context/Web3Context';
import { ethers } from 'ethers';

export default function MyCollection() {
  const { contract, account, isConnected } = useWeb3();
  const [myNfts, setMyNfts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedNFT, setSelectedNFT] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [price, setPrice] = useState('');
  const [processing, setProcessing] = useState(false);
  const toast = useToast();
  const [filter, setFilter] = useState('all'); // 'all', 'forSale', 'notForSale'
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    if (contract && account) {
      loadMyNFTs();
    }
  }, [contract, account, refreshTrigger]);

  const loadMyNFTs = async () => {
    if (!contract || !account) return;
    
    try {
      setLoading(true);
      const totalSupply = await contract.totalSupply();
      
      const items = [];
      for (let i = 1; i <= totalSupply; i++) {
        try {
          const tokenId = i.toString();
          const owner = await contract.ownerOf(tokenId);
          
          // Only include NFTs owned by the current user
          if (owner.toLowerCase() === account.toLowerCase()) {
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
              tokenURI,
              isForSale,
              price: ethers.formatEther(price),
              description: metadata.description || ipfsMetadata.description || "No description",
              materials: metadata.materials || "Unknown",
              artisanDetails: metadata.artisanDetails || "Unknown",
              name: ipfsMetadata.name || `Artisan NFT #${tokenId}`,
              image: ipfsMetadata.image || "https://via.placeholder.com/400?text=Artisan+NFT"
            });
          }
        } catch (error) {
          console.error(`Error loading NFT #${i}:`, error);
        }
      }
      
      setMyNfts(items);
      setLoading(false);
    } catch (error) {
      console.error("Error loading NFTs:", error);
      setLoading(false);
    }
  };

  const handleNFTClick = (nft) => {
    setSelectedNFT(nft);
    setPrice(nft.isForSale ? nft.price : '');
    onOpen();
  };

  const handleSetForSale = async () => {
    if (!selectedNFT || !price) return;
    
    try {
      setProcessing(true);
      const priceInWei = ethers.parseEther(price);
      
      const tx = await contract.setNFTForSale(selectedNFT.tokenId, priceInWei);
      
      toast({
        title: "Transaction Sent",
        description: `Setting NFT for sale: ${tx.hash}`,
        status: "info",
        duration: 5000,
        isClosable: true,
      });
      
      await tx.wait();
      
      toast({
        title: "Success",
        description: `NFT #${selectedNFT.tokenId} is now for sale at ${price} ETH`,
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      
      onClose();
      loadMyNFTs();
    } catch (error) {
      console.error("Error setting NFT for sale:", error);
      toast({
        title: "Error",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleRemoveFromSale = async () => {
    if (!selectedNFT) return;
    
    try {
      setProcessing(true);
      
      const tx = await contract.removeNFTFromSale(selectedNFT.tokenId);
      
      toast({
        title: "Transaction Sent",
        description: `Removing NFT from sale: ${tx.hash}`,
        status: "info",
        duration: 5000,
        isClosable: true,
      });
      
      await tx.wait();
      
      toast({
        title: "Success",
        description: `NFT #${selectedNFT.tokenId} has been removed from sale`,
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      
      onClose();
      loadMyNFTs();
    } catch (error) {
      console.error("Error removing NFT from sale:", error);
      toast({
        title: "Error",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setProcessing(false);
    }
  };

  const getFilteredNFTs = () => {
    switch(filter) {
      case 'forSale':
        return myNfts.filter(nft => nft.isForSale);
      case 'notForSale':
        return myNfts.filter(nft => !nft.isForSale);
      default:
        return myNfts;
    }
  };

  const filteredNFTs = getFilteredNFTs();

  const refreshCollection = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  if (!isConnected) {
    return (
      <Box textAlign="center" py={10}>
        <Alert status="warning">
          <AlertIcon />
          Please connect your wallet to view your collection
        </Alert>
      </Box>
    );
  }

  if (loading) {
    return (
      <Box textAlign="center" py={10}>
        <Spinner size="xl" />
        <Text mt={4}>Loading your NFTs...</Text>
      </Box>
    );
  }

  return (
    <Box p={5}>
      <Heading mb={6}>My NFT Collection</Heading>
      
      {myNfts.length === 0 ? (
        <Box textAlign="center" py={10}>
          <Text fontSize="xl">You don't own any NFTs yet</Text>
        </Box>
      ) : (
        <>
          <Flex mb={6} justifyContent="center">
            <Button 
              colorScheme={filter === 'all' ? 'blue' : 'gray'} 
              mr={2}
              onClick={() => setFilter('all')}
            >
              All ({myNfts.length})
            </Button>
            <Button 
              colorScheme={filter === 'forSale' ? 'green' : 'gray'} 
              mr={2}
              onClick={() => setFilter('forSale')}
            >
              For Sale ({myNfts.filter(nft => nft.isForSale).length})
            </Button>
            <Button 
              colorScheme={filter === 'notForSale' ? 'purple' : 'gray'}
              onClick={() => setFilter('notForSale')}
            >
              Not For Sale ({myNfts.filter(nft => !nft.isForSale).length})
            </Button>
          </Flex>
          
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={10}>
            {filteredNFTs.map((nft) => (
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
                position="relative"
              >
                {nft.isForSale && (
                  <Badge 
                    colorScheme="green" 
                    position="absolute" 
                    top={2} 
                    right={2} 
                    zIndex={1}
                    px={2}
                    py={1}
                    borderRadius="md"
                  >
                    For Sale: {nft.price} ETH
                  </Badge>
                )}
                
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
                  <Heading size="md" noOfLines={1}>{nft.name}</Heading>
                  <Text mt={2} noOfLines={2} color="gray.600">{nft.description}</Text>
                  <Text mt={3} fontSize="sm" color="gray.500">ID: #{nft.tokenId}</Text>
                </Box>
              </Box>
            ))}
          </SimpleGrid>
        </>
      )}
      
      {/* NFT Management Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          {selectedNFT && (
            <>
              <ModalHeader>{selectedNFT.name}</ModalHeader>
              <ModalCloseButton />
              <ModalBody>
                <Tabs isFitted variant="enclosed">
                  <TabList mb="1em">
                    <Tab>Details</Tab>
                    <Tab>Manage</Tab>
                  </TabList>
                  <TabPanels>
                    <TabPanel>
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
                      
                      <Divider my={4} />
                      
                      <Box p={3} bg={selectedNFT.isForSale ? "green.50" : "gray.50"} borderRadius="md">
                        <Text fontWeight="bold" color={selectedNFT.isForSale ? "green.500" : "gray.700"}>
                          Status: {selectedNFT.isForSale 
                            ? `For Sale at ${selectedNFT.price} ETH` 
                            : "Not For Sale"}
                        </Text>
                      </Box>
                    </TabPanel>
                    <TabPanel>
                      <Box mb={6}>
                        <Text fontSize="lg" fontWeight="bold" mb={4}>
                          {selectedNFT.isForSale 
                            ? "Update Sale Price or Remove from Sale" 
                            : "Set NFT for Sale"}
                        </Text>
                        
                        {selectedNFT.isForSale && (
                          <Alert status="info" mb={4}>
                            <AlertIcon />
                            This NFT is currently for sale at {selectedNFT.price} ETH
                          </Alert>
                        )}
                        
                        <FormControl mb={4}>
                          <FormLabel>Price (ETH)</FormLabel>
                          <Input 
                            type="number" 
                            value={price} 
                            onChange={(e) => setPrice(e.target.value)}
                            placeholder="Enter price in ETH"
                            step="0.001"
                            min="0"
                          />
                        </FormControl>
                        
                        <Button 
                          colorScheme="blue" 
                          width="full"
                          onClick={handleSetForSale}
                          isLoading={processing && !selectedNFT.isForSale}
                          loadingText="Processing..."
                          isDisabled={!price || price <= 0}
                          mb={4}
                        >
                          {selectedNFT.isForSale ? "Update Price" : "Set For Sale"}
                        </Button>
                        
                        {selectedNFT.isForSale && (
                          <Button 
                            colorScheme="red" 
                            width="full"
                            onClick={handleRemoveFromSale}
                            isLoading={processing && selectedNFT.isForSale}
                            loadingText="Processing..."
                          >
                            Remove From Sale
                          </Button>
                        )}
                      </Box>
                    </TabPanel>
                  </TabPanels>
                </Tabs>
              </ModalBody>
              
              <ModalFooter>
                <Button variant="ghost" onClick={onClose}>Close</Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
      <Button 
        leftIcon={<RepeatIcon />}
        onClick={refreshCollection}
        size="sm"
        colorScheme="blue"
        variant="outline"
        ml="auto"
        mb={4}
      >
        Refresh
      </Button>
    </Box>
  );
}


