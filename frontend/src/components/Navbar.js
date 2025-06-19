import React from "react";
import { Box, Flex, Link, Spacer, Button, Text, useColorModeValue, HStack, Icon } from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import { useWeb3 } from "../context/Web3Context";
import { FaHome, FaStore, FaPlus } from 'react-icons/fa';

export default function Navbar() {
  const { account } = useWeb3();
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  return (
    <Box 
      bg={bgColor} 
      px={4} 
      py={3} 
      boxShadow="sm"
      borderBottom="1px"
      borderColor={borderColor}
      position="sticky"
      top={0}
      zIndex={1000}
    >
      <Flex align="center" maxW="1200px" mx="auto">
        <Text 
          fontWeight="bold" 
          fontSize="xl" 
          bgGradient="linear(to-r, teal.400, blue.500)"
          bgClip="text"
        >
          Chennai Artisan NFT
        </Text>
        <Spacer />
        <HStack spacing={6}>
          <Link 
            as={RouterLink} 
            to="/" 
            display="flex" 
            alignItems="center"
            _hover={{ color: 'teal.500' }}
          >
            <Icon as={FaHome} mr={2} />
            Home
          </Link>
          <Link 
            as={RouterLink} 
            to="/marketplace" 
            display="flex" 
            alignItems="center"
            _hover={{ color: 'teal.500' }}
          >
            <Icon as={FaStore} mr={2} />
            Marketplace
          </Link>
          <Link 
            as={RouterLink} 
            to="/mint" 
            display="flex" 
            alignItems="center"
            _hover={{ color: 'teal.500' }}
          >
            <Icon as={FaPlus} mr={2} />
            Mint
          </Link>
        </HStack>
        <Spacer />
        <Button 
          colorScheme="teal" 
          variant={account ? "outline" : "solid"}
          size="md"
          borderRadius="full"
          px={6}
          _hover={{
            transform: 'translateY(-2px)',
            boxShadow: 'lg',
          }}
          transition="all 0.2s"
        >
          {account ? `${account.slice(0, 6)}...${account.slice(-4)}` : "Connect Wallet"}
        </Button>
      </Flex>
    </Box>
  );
}


