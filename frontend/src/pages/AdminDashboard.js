import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Container,
  Heading,
  Input,
  VStack,
  HStack,
  Text,
  useToast,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Alert,
  AlertIcon,
  Spinner,
  Center,
  FormControl,
  FormLabel
} from '@chakra-ui/react';
import { useWeb3 } from '../context/Web3Context';

export default function AdminDashboard() {
  const { account, contract, isAdmin, loading: web3Loading } = useWeb3();
  const toast = useToast();
  
  const [newArtisanAddress, setNewArtisanAddress] = useState('');
  const [artisans, setArtisans] = useState([]);
  const [isRegistering, setIsRegistering] = useState(false);
  const [loadingArtisans, setLoadingArtisans] = useState(false);
  
  useEffect(() => {
    if (contract && isAdmin) {
      fetchArtisans();
    }
  }, [contract, isAdmin]);
  
  const fetchArtisans = async () => {
    if (!contract) return;
    
    try {
      setLoadingArtisans(true);
      
      // Get the artisan role hash
      const artisanRole = await contract.ARTISAN_ROLE();
      
      // This is a simplified approach - in a real app, you'd need to listen to RoleGranted events
      // or have a way to query all addresses with a specific role
      // For demo purposes, we'll just show recent artisans from events
      const filter = contract.filters.ArtisanRegistered();
      const events = await contract.queryFilter(filter);
      
      const artisanList = [];
      for (const event of events) {
        const artisanAddress = event.args.artisan;
        const isStillArtisan = await contract.hasRole(artisanRole, artisanAddress);
        
        if (isStillArtisan) {
          artisanList.push({
            address: artisanAddress,
            registeredAt: new Date(Number(event.blockNumber) * 1000).toLocaleDateString()
          });
        }
      }
      
      setArtisans(artisanList);
    } catch (err) {
      console.error("Error fetching artisans:", err);
      toast({
        title: "Error",
        description: "Failed to load artisans. Please try again later.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoadingArtisans(false);
    }
  };
  
  const handleRegisterArtisan = async () => {
    if (!contract || !isAdmin || !newArtisanAddress) return;
    
    // Basic address validation
    if (!newArtisanAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
      toast({
        title: "Invalid Address",
        description: "Please enter a valid Ethereum address.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }
    
    try {
      setIsRegistering(true);
      
      // Check if already an artisan
      const artisanRole = await contract.ARTISAN_ROLE();
      const isAlreadyArtisan = await contract.hasRole(artisanRole, newArtisanAddress);
      
      if (isAlreadyArtisan) {
        toast({
          title: "Already Registered",
          description: "This address is already registered as an artisan.",
          status: "warning",
          duration: 5000,
          isClosable: true,
        });
        setIsRegistering(false);
        return;
      }
      
      // Register the artisan
      const tx = await contract.registerArtisan(newArtisanAddress);
      await tx.wait();
      
      toast({
        title: "Success",
        description: "Artisan registered successfully!",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      
      // Reset form and refresh artisans list
      setNewArtisanAddress('');
      fetchArtisans();
      
    } catch (err) {
      console.error("Error registering artisan:", err);
      toast({
        title: "Error",
        description: `Failed to register artisan: ${err.message}`,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsRegistering(false);
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
          Please connect your wallet to access the Admin Dashboard.
        </Alert>
      </Container>
    );
  }
  
  if (!isAdmin) {
    return (
      <Container maxW="container.xl" py={10}>
        <Alert status="error">
          <AlertIcon />
          You do not have admin privileges to access this dashboard.
        </Alert>
      </Container>
    );
  }
  
  return (
    <Container maxW="container.xl" py={10}>
      <Heading as="h1" mb={8}>
        Admin Dashboard
      </Heading>
      
      <Box
        borderWidth="1px"
        rounded="lg"
        shadow="1px 1px 3px rgba(0,0,0,0.3)"
        p={6}
        mb={8}
      >
        <VStack spacing={5} align="stretch">
          <Heading as="h2" size="md">
            Register New Artisan
          </Heading>
          
          <FormControl>
            <FormLabel>Artisan Wallet Address</FormLabel>
            <HStack>
              <Input
                value={newArtisanAddress}
                onChange={(e) => setNewArtisanAddress(e.target.value)}
                placeholder="0x..."
              />
              <Button
                colorScheme="blue"
                onClick={handleRegisterArtisan}
                isLoading={isRegistering}
                loadingText="Registering..."
                isDisabled={!newArtisanAddress}
              >
                Register
              </Button>
            </HStack>
          </FormControl>
        </VStack>
      </Box>
      
      <Box
        borderWidth="1px"
        rounded="lg"
        shadow="1px 1px 3px rgba(0,0,0,0.3)"
        p={6}
      >
        <Heading as="h2" size="md" mb={4}>
          Registered Artisans
        </Heading>
        
        {loadingArtisans ? (
          <Center h="100px">
            <Spinner />
            <Text ml={4}>Loading artisans...</Text>
          </Center>
        ) : artisans.length === 0 ? (
          <Alert status="info">
            <AlertIcon />
            No artisans have been registered yet.
          </Alert>
        ) : (
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Address</Th>
                <Th>Registered Date</Th>
                <Th>Status</Th>
              </Tr>
            </Thead>
            <Tbody>
              {artisans.map((artisan, index) => (
                <Tr key={index}>
                  <Td>
                    <Text fontSize="sm" fontFamily="monospace">
                      {artisan.address}
                    </Text>
                  </Td>
                  <Td>{artisan.registeredAt}</Td>
                  <Td>
                    <Badge colorScheme="green">Active</Badge>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        )}
      </Box>
    </Container>
  );
}