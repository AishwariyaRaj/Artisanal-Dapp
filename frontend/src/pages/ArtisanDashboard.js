import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Button,
  Container,
  FormControl,
  FormLabel,
  Heading,
  Input,
  SimpleGrid,
  Textarea,
  VStack,
  useToast,
  Text,
  Spinner,
  Alert,
  AlertIcon,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Image,
  Stack,
  Badge,
  Center
} from '@chakra-ui/react';
import { useWeb3 } from '../context/Web3Context';
import { uploadToIPFS, uploadMetadataToIPFS, createNFTMetadata } from '../services/ipfs';
import NFTCard from '../components/NFTCard';

export default function ArtisanDashboard() {
  const { account, contract, isArtisan, loading: web3Loading } = useWeb3();
  const toast = useToast();
  const fileInputRef = useRef();
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    materials: '',
    artisanDetails: '',
  });
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isMinting, setIsMinting] = useState(false);
  const [myNFTs, setMyNFTs] = useState([]);
  const [loadingNFTs, setLoadingNFTs] = useState(false);
  
  useEffect(() => {
    if (contract && account) {
      fetchMyNFTs();
    }
  }, [contract, account]);
  
  const fetchMyNFTs = async () => {
    if (!contract || !account) return;
    
    try {
      setLoadingNFTs(true);
      const totalSupply = await contract.totalSupply();
      const totalSupplyNumber = Number(totalSupply);
      
      const nftPromises = [];
      for (let i = 1; i <= totalSupplyNumber; i++) {
        nftPromises.push(fetchNFTData(i));
      }
      
      const nftData = await Promise.all(nftPromises);
      // Filter out null values and NFTs not owned by the current user
      const myNFTsData = nftData.filter(
        nft => nft !== null && nft.owner.toLowerCase() === account.toLowerCase()
      );
      
      setMyNFTs(myNFTsData);
    } catch (err) {
      console.error("Error fetching NFTs:", err);
      toast({
        title: "Error",
        description: "Failed to load your NFTs. Please try again later.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoadingNFTs(false);
    }
  };
  
  const fetchNFTData = async (tokenId) => {
    try {
      const owner = await contract.ownerOf(tokenId);
      const tokenURI = await contract.tokenURI(tokenId);
      const metadata = await fetchMetadata(tokenURI);
      const [isForSale, price] = await contract.isForSale(tokenId);
      
      const [description, materials, artisanDetails, creationDate, , ] = 
        await contract.getItemMetadata(tokenId);
      
      return {
        id: tokenId,
        owner,
        name: metadata?.name || `NFT #${tokenId}`,
        description: description || metadata?.description || "No description available",
        image: metadata?.image || "https://via.placeholder.com/300?text=No+Image",
        materials,
        artisanDetails,
        creationDate: new Date(Number(creationDate) * 1000).toLocaleDateString(),
        isForSale,
        price: isForSale ? Number(price) : 0
      };
    } catch (err) {
      console.error(`Error fetching NFT #${tokenId}:`, err);
      return null;
    }
  };
  
  const fetchMetadata = async (uri) => {
    try {
      if (!uri || !uri.startsWith('http')) return null;
      
      const response = await fetch(uri);
      const metadata = await response.json();
      return metadata;
    } catch (err) {
      console.error("Error fetching metadata:", err);
      return null;
    }
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };
  
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;
    
    setFile(selectedFile);
    
    // Create a preview URL
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result);
    };
    reader.readAsDataURL(selectedFile);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!contract || !account || !isArtisan) {
      toast({
        title: "Error",
        description: "You must be a registered artisan to mint NFTs.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }
    
    if (!file) {
      toast({
        title: "Error",
        description: "Please select an image file.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }
    
    try {
      setIsUploading(true);
      
      // Upload image to IPFS
      const imageCID = await uploadToIPFS(file);
      const imageUrl = `https://ipfs.io/ipfs/${imageCID}`;
      
      // Create and upload metadata
      const metadata = createNFTMetadata(
        formData.name,
        formData.description,
        imageUrl,
        formData.materials,
        formData.artisanDetails
      );
      
      const metadataCID = await uploadMetadataToIPFS(metadata);
      const tokenURI = `https://ipfs.io/ipfs/${metadataCID}`;
      
      setIsUploading(false);
      setIsMinting(true);
      
      // Mint NFT
      const tx = await contract.mintNFT(
        account,
        formData.description,
        formData.materials,
        formData.artisanDetails,
        tokenURI
      );
      
      await tx.wait();
      
      toast({
        title: "Success",
        description: "NFT minted successfully!",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      
      // Reset form
      setFormData({
        name: '',
        description: '',
        materials: '',
        artisanDetails: '',
      });
      setFile(null);
      setPreviewUrl('');
      
      // Refresh NFTs
      fetchMyNFTs();
      
    } catch (err) {
      console.error("Error minting NFT:", err);
      toast({
        title: "Error",
        description: `Failed to mint NFT: ${err.message}`,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsUploading(false);
      setIsMinting(false);
    }
  };
  
  if (web3Loading) {
    return (
      <Center h="50vh">
        <Spinner size="xl" />
        <Text ml={4}>Loading web3...</Text>
      </Center>
    );
  }
  
  if (!account) {
    return (
      <Container maxW="container.xl" py={10}>
        <Alert status="warning">
          <AlertIcon />
          Please connect your wallet to access the Artisan Dashboard.
        </Alert>
      </Container>
    );
  }
  
  if (!isArtisan) {
    return (
      <Container maxW="container.xl" py={10}>
        <Alert status="info">
          <AlertIcon />
          You need to be registered as an artisan to access this dashboard. Please contact the admin.
        </Alert>
      </Container>
    );
  }
  
  return (
    <Container maxW="container.xl" py={10}>
      <Heading as="h1" mb={8}>
        Artisan Dashboard
      </Heading>
      
      <Tabs isFitted variant="enclosed">
        <TabList mb="1em">
          <Tab>Create New NFT</Tab>
          <Tab>My NFTs</Tab>
        </TabList>
        
        <TabPanels>
          <TabPanel>
            <Box
              borderWidth="1px"
              rounded="lg"
              shadow="1px 1px 3px rgba(0,0,0,0.3)"
              p={6}
              m="10px auto"
            >
              <VStack spacing={5}>
                <Heading as="h2" size="lg">
                  Create New Artisan NFT
                </Heading>
                
                <FormControl isRequired>
                  <FormLabel>Item Name</FormLabel>
                  <Input
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter the name of your craft item"
                  />
                </FormControl>
                
                <FormControl isRequired>
                  <FormLabel>Description</FormLabel>
                  <Textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Describe your craft item"
                    size="md"
                  />
                </FormControl>
                
                <FormControl isRequired>
                  <FormLabel>Materials Used</FormLabel>
                  <Input
                    name="materials"
                    value={formData.materials}
                    onChange={handleInputChange}
                    placeholder="e.g., Clay, Cotton, Bronze"
                  />
                </FormControl>
                
                <FormControl isRequired>
                  <FormLabel>Artisan Details</FormLabel>
                  <Textarea
                    name="artisanDetails"
                    value={formData.artisanDetails}
                    onChange={handleInputChange}
                    placeholder="Share information about yourself and your craft"
                    size="md"
                  />
                </FormControl>
                
                <FormControl isRequired>
                  <FormLabel>Item Image</FormLabel>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    ref={fileInputRef}
                    display="none"
                  />
                  <Button
                    onClick={() => fileInputRef.current.click()}
                    colorScheme="blue"
                    variant="outline"
                    width="full"
                  >
                    Select Image
                  </Button>
                </FormControl>
                
                {previewUrl && (
                  <Box mt={4}>
                    <Image
                      src={previewUrl}
                      alt="Preview"
                      maxH="200px"
                      borderRadius="md"
                    />
                  </Box>
                )}
                
                <Button
                  colorScheme="blue"
                  width="full"
                  mt={4}
                  onClick={handleSubmit}
                  isLoading={isUploading || isMinting}
                  loadingText={isUploading ? "Uploading to IPFS..." : "Minting NFT..."}
                  isDisabled={
                    !formData.name ||
                    !formData.description ||
                    !formData.materials ||
                    !formData.artisanDetails ||
                    !file
                  }
                >
                  Mint NFT
                </Button>
              </VStack>
            </Box>
          </TabPanel>
          
          <TabPanel>
            <Box>
              <Heading as="h2" size="lg" mb={6}>
                My NFTs
              </Heading>
              
              {loadingNFTs ? (
                <Center h="200px">
                  <Spinner size="xl" />
                  <Text ml={4}>Loading your NFTs...</Text>
                </Center>
              ) : myNFTs.length === 0 ? (
                <Alert status="info">
                  <AlertIcon />
                  You haven't created any NFTs yet. Use the "Create New NFT" tab to mint your first NFT.
                </Alert>
              ) : (
                <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={10}>
                  {myNFTs.map(nft => (
                    <NFTCard key={nft.id} nft={nft} />
                  ))}
                </SimpleGrid>
              )}
            </Box>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Container>
  );
}
