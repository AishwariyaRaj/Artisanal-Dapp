import React from 'react';
import {
  Box,
  Image,
  Heading,
  Text,
  Badge,
  Stack,
  Button,
  useColorModeValue,
  Flex,
  Icon,
} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { ethers } from 'ethers';
import { useWeb3 } from '../context/Web3Context';
import { FaEthereum, FaCalendarAlt, FaUser } from 'react-icons/fa';

export default function NFTCard({ nft, onHide }) {
  const { account, contract, signer } = useWeb3();
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const isOwner = account?.toLowerCase() === nft.owner?.toLowerCase();
  
  const handlePurchase = async () => {
    if (!contract || !signer || !account) return;
    
    try {
      const tx = await contract.purchaseNFT(nft.id, {
        value: ethers.parseEther(nft.price.toString())
      });
      
      await tx.wait();
      alert(`Successfully purchased NFT #${nft.id}!`);
      window.location.reload();
    } catch (error) {
      console.error("Error purchasing NFT:", error);
      alert(`Failed to purchase: ${error.message}`);
    }
  };
  
  const handleHideNFT = () => {
    onHide(nft.id);
  };
  
  return (
    <Box
      borderWidth="1px"
      borderRadius="xl"
      overflow="hidden"
      boxShadow="lg"
      bg={bgColor}
      borderColor={borderColor}
      transition="all 0.3s"
      _hover={{ 
        transform: 'translateY(-5px)',
        boxShadow: 'xl',
      }}
    >
      <RouterLink to={`/nft/${nft.id}`}>
        <Box position="relative">
          {onHide && (
            <Button
              size="xs"
              colorScheme="red"
              onClick={e => {
                e.preventDefault();
                onHide(nft.id);
              }}
              position="absolute"
              top={2}
              right={2}
              zIndex={2}
            >
              Hide
            </Button>
          )}
          <Image
            src={nft.image}
            alt={nft.description}
            height="250px"
            width="100%"
            objectFit="cover"
            fallbackSrc="https://via.placeholder.com/300?text=No+Image"
            transition="transform 0.3s"
            _hover={{ transform: 'scale(1.05)' }}
          />
          {nft.isForSale && (
            <Badge
              position="absolute"
              top={3}
              right={3}
              colorScheme="green"
              px={3}
              py={1}
              borderRadius="full"
              fontSize="sm"
              boxShadow="md"
            >
              For Sale
            </Badge>
          )}
        </Box>
      </RouterLink>
      
      <Box p={5}>
        <RouterLink to={`/nft/${nft.id}`}>
          <Heading size="md" mb={3} noOfLines={1} _hover={{ color: 'teal.500' }}>
            {nft.description}
          </Heading>
        </RouterLink>
        
        <Stack spacing={3}>
          <Flex align="center" color="gray.500">
            <Icon as={FaUser} mr={2} />
            <Text fontSize="sm" noOfLines={1}>
              {nft.artisanDetails}
            </Text>
          </Flex>
          
          <Flex align="center" color="gray.500">
            <Icon as={FaEthereum} mr={2} />
            <Text fontSize="sm" noOfLines={1}>
              Materials: {nft.materials}
            </Text>
          </Flex>
          
          <Flex align="center" color="gray.500">
            <Icon as={FaCalendarAlt} mr={2} />
            <Text fontSize="sm">
              {new Date(Number(nft.creationDate) * 1000).toLocaleDateString()}
            </Text>
          </Flex>
        </Stack>
        
        {nft.isForSale && !isOwner && (
          <Button
            colorScheme="teal"
            size="md"
            width="full"
            mt={4}
            onClick={handlePurchase}
            leftIcon={<Icon as={FaEthereum} />}
            _hover={{
              transform: 'translateY(-2px)',
              boxShadow: 'md',
            }}
            transition="all 0.2s"
          >
            Buy for {nft.price} ETH
          </Button>
        )}
      </Box>
    </Box>
  );
}
