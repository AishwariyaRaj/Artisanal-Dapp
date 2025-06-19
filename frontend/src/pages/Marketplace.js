import React, { useState, useEffect } from 'react';
import {
  Box, Heading, SimpleGrid, Spinner, Text, Center, Select, InputGroup, InputLeftElement, Input, Flex, Alert, AlertIcon, Button
} from '@chakra-ui/react';
import { SearchIcon, RepeatIcon } from '@chakra-ui/icons';
import { useWeb3 } from '../context/Web3Context';
import NFTCard from '../components/NFTCard';
import { ethers } from 'ethers';

export default function Marketplace() {
  const { contract, loading: web3Loading, account, connectWallet } = useWeb3();
  const [nfts, setNfts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [hiddenNFTs, setHiddenNFTs] = useState([]);

  useEffect(() => {
    if (contract) {
      fetchAllNFTs();
    } else {
      setLoading(false);
    }
  }, [contract, account]);

  const fetchAllNFTs = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("Fetching NFTs from contract:", contract.target);
      
      const totalSupply = await contract.totalSupply();
      console.log("Total supply:", totalSupply.toString());
      const totalSupplyNumber = parseInt(totalSupply.toString());
      
      if (totalSupplyNumber === 0) {
        setNfts([]);
        setLoading(false);
        return;
      }
      
      const nftPromises = [];
      for (let i = 1; i <= totalSupplyNumber; i++) {
        nftPromises.push(fetchNFTData(i));
      }
      
      const nftData = await Promise.all(nftPromises);
      // Filter out null values (failed fetches)
      const validNFTs = nftData.filter(nft => nft !== null);
      console.log("Fetched NFTs:", validNFTs);
      
      setNfts(validNFTs);
    } catch (err) {
      console.error("Error fetching NFTs:", err);
      setError(`Failed to load NFTs: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  const fetchNFTData = async (tokenId) => {
    try {
      console.log(`Fetching data for token ID: ${tokenId}`);
      const owner = await contract.ownerOf(tokenId);
      console.log(`Owner of token ${tokenId}: ${owner}`);
      
      const tokenURI = await contract.tokenURI(tokenId);
      console.log(`Token URI for ${tokenId}: ${tokenURI}`);
      
      const metadata = await fetchMetadata(tokenURI);
      console.log(`Metadata for ${tokenId}:`, metadata);
      
      const saleInfo = await contract.isForSale(tokenId);
      const isForSale = saleInfo[0];
      const price = saleInfo[1];
      console.log(`Sale info for ${tokenId}: isForSale=${isForSale}, price=${price}`);
      
      let description, materials, artisanDetails, creationDate;
      try {
        const metadataFromContract = await contract.getItemMetadata(tokenId);
        description = metadataFromContract[0];
        materials = metadataFromContract[1];
        artisanDetails = metadataFromContract[2];
        creationDate = metadataFromContract[3];
      } catch (metadataErr) {
        console.warn(`Error fetching on-chain metadata for token ${tokenId}:`, metadataErr);
      }
      
      return {
        id: tokenId,
        owner,
        name: metadata?.name || `NFT #${tokenId}`,
        description: description || metadata?.description || "No description available",
        image: metadata?.image || "https://via.placeholder.com/300?text=No+Image",
        materials: materials || "Unknown",
        artisanDetails: artisanDetails || "Unknown Artisan",
        creationDate: creationDate ? new Date(Number(creationDate) * 1000).toLocaleDateString() : "Unknown",
        isForSale,
        price: isForSale ? Number(ethers.formatEther(price)) : 0
      };
    } catch (err) {
      console.error(`Error fetching NFT #${tokenId}:`, err);
      return null;
    }
  };
  
  const fetchMetadata = async (uri) => {
    try {
      if (!uri) return null;
      
      // Handle IPFS URIs
      let url = uri;
      if (uri.startsWith('ipfs://')) {
        url = uri.replace('ipfs://', 'https://ipfs.io/ipfs/');
      }
      
      console.log(`Fetching metadata from: ${url}`);
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const metadata = await response.json();
      return metadata;
    } catch (err) {
      console.error("Error fetching metadata:", err);
      return null;
    }
  };

  // Filter NFTs based on search term and filter option
  const filteredNFTs = nfts.filter(nft => {
    // Filter by search term
    const matchesSearch = 
      nft.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      nft.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filter by sale status
    if (filter === 'forSale') return matchesSearch && nft.isForSale;
    if (filter === 'notForSale') return matchesSearch && !nft.isForSale;
    
    return matchesSearch; // 'all' filter
  });
  
  // After filteredNFTs:
  const visibleNFTs = filteredNFTs.filter(nft => !hiddenNFTs.includes(nft.id));
  
  // Handler:
  const handleHideNFT = (id) => {
    setHiddenNFTs(prev => [...prev, id]);
  };
  
  if (web3Loading) {
    return (
      <Center h="50vh">
        <Spinner size="xl" />
        <Text ml={4}>Loading web3...</Text>
      </Center>
    );
  }
  
  return (
    <Box w="full" maxW="1200px" mx="auto" px={4}>
      <Box 
        bgGradient="linear(to-r, teal.400, blue.500)"
        color="white"
        py={8}
        px={6}
        borderRadius="xl"
        mb={8}
        boxShadow="lg"
      >
        <Heading as="h1" size="xl" mb={4} textAlign="center">
          Artisan NFT Marketplace
        </Heading>
        <Text textAlign="center" fontSize="lg" opacity={0.9}>
          Discover unique handcrafted items from Chennai's finest artisans
        </Text>
      </Box>
      
      <Flex 
        direction={{ base: 'column', md: 'row' }} 
        mb={8} 
        gap={4}
        bg="white"
        p={4}
        borderRadius="lg"
        boxShadow="md"
      >
        <InputGroup flex="1">
          <InputLeftElement pointerEvents="none">
            <SearchIcon color="gray.400" />
          </InputLeftElement>
          <Input 
            placeholder="Search by name or description..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            size="lg"
            borderRadius="md"
            _focus={{
              borderColor: 'teal.400',
              boxShadow: '0 0 0 1px teal.400',
            }}
          />
        </InputGroup>
        
        <Select 
          width={{ base: 'full', md: '200px' }}
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          size="lg"
          borderRadius="md"
          _focus={{
            borderColor: 'teal.400',
            boxShadow: '0 0 0 1px teal.400',
          }}
        >
          <option value="all">All NFTs</option>
          <option value="forSale">For Sale</option>
          <option value="notForSale">Not For Sale</option>
        </Select>
        
        <Button 
          leftIcon={<RepeatIcon />} 
          onClick={fetchAllNFTs} 
          isLoading={loading}
          colorScheme="teal"
          size="lg"
          px={6}
          borderRadius="md"
          _hover={{
            transform: 'translateY(-2px)',
            boxShadow: 'lg',
          }}
          transition="all 0.2s"
        >
          Refresh
        </Button>
      </Flex>
      
      {loading ? (
        <Center h="200px" bg="white" borderRadius="lg" boxShadow="md">
          <Spinner size="xl" color="teal.500" thickness="4px" />
          <Text ml={4} fontSize="lg">Loading NFTs...</Text>
        </Center>
      ) : error ? (
        <Alert status="error" mb={6} borderRadius="lg">
          <AlertIcon />
          {error}
        </Alert>
      ) : !account ? (
        <Alert 
          status="warning" 
          mb={6} 
          borderRadius="lg"
          bg="orange.50"
          borderLeft="4px"
          borderColor="orange.400"
        >
          <AlertIcon color="orange.400" />
          <Box flex="1">
            <Text fontWeight="bold">Wallet Not Connected</Text>
            <Text>Please connect your wallet to view NFTs.</Text>
          </Box>
          <Button 
            ml={4} 
            colorScheme="orange" 
            size="sm" 
            onClick={connectWallet}
            _hover={{
              transform: 'translateY(-2px)',
              boxShadow: 'md',
            }}
            transition="all 0.2s"
          >
            Connect Wallet
          </Button>
        </Alert>
      ) : filteredNFTs.length === 0 ? (
        <Alert 
          status="info" 
          borderRadius="lg"
          bg="blue.50"
          borderLeft="4px"
          borderColor="blue.400"
        >
          <AlertIcon color="blue.400" />
          <Box flex="1">
            <Text fontWeight="bold">No NFTs Found</Text>
            <Text>
              {nfts.length === 0 
                ? "There are no NFTs minted yet." 
                : "Try a different search or filter."}
            </Text>
          </Box>
        </Alert>
      ) : (
        <SimpleGrid 
          columns={{ base: 1, sm: 2, md: 3 }} 
          spacing={8}
          py={4}
        >
          {visibleNFTs.map(nft => (
            <NFTCard key={nft.id} nft={nft} onHide={handleHideNFT} />
          ))}
        </SimpleGrid>
      )}
    </Box>
  );
}

