import React from 'react';
import { 
  Box, 
  Heading, 
  Text, 
  Container, 
  Button, 
  Stack, 
  SimpleGrid, 
  useColorModeValue,
  Image,
  Flex,
  Icon,
} from '@chakra-ui/react';
import { Link } from "react-router-dom";
import { FaHandshake, FaShieldAlt, FaGlobe } from 'react-icons/fa';

// Simple component for the "How It Works" section
function StepCard({ number, title, text }) {
  return (
    <Box
      p={6}
      boxShadow="md"
      borderRadius="lg"
      bg={useColorModeValue('white', 'gray.700')}
    >
      <Text
        fontSize="4xl"
        fontWeight="bold"
        color="blue.400"
        mb={4}
      >
        {number}
      </Text>
      <Heading as="h3" size="md" mb={4}>
        {title}
      </Heading>
      <Text color={useColorModeValue('gray.600', 'gray.400')}>
        {text}
      </Text>
    </Box>
  );
}

function FeatureCard({ icon, title, text }) {
  return (
    <Box
      p={6}
      boxShadow="xl"
      borderRadius="xl"
      bg={useColorModeValue('white', 'gray.700')}
      transition="all 0.3s"
      _hover={{
        transform: 'translateY(-5px)',
        boxShadow: '2xl',
      }}
    >
      <Icon as={icon} w={10} h={10} color="teal.500" mb={4} />
      <Heading as="h3" size="md" mb={4}>
        {title}
      </Heading>
      <Text color={useColorModeValue('gray.600', 'gray.400')}>
        {text}
      </Text>
    </Box>
  );
}

export default function Home() {
  const [account, setAccount] = React.useState(null);
  
  // Function to connect wallet
  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setAccount(accounts[0]);
      } catch (error) {
        console.error("Error connecting to wallet:", error);
      }
    } else {
      alert("Please install MetaMask to use this application");
    }
  };
  
  return (
    <Box>
      {/* Hero Section */}
      <Box 
        bgGradient="linear(to-r, teal.400, blue.500)"
        color="white"
        py={20}
        px={4}
      >
        <Container maxW="container.xl">
          <Stack spacing={8} align="center" textAlign="center">
            <Heading 
              as="h1" 
              size="2xl"
              fontWeight="bold"
              lineHeight="1.2"
            >
              Authentic Chennai Artisanal Crafts
            </Heading>
            <Text fontSize="xl" maxW="2xl">
              Discover unique handcrafted items from Chennai's finest artisans. 
              Each piece is certified on the blockchain, providing verifiable proof of authenticity and origin.
            </Text>
            <Button
              as={Link}
              to="/marketplace"
              size="lg"
              colorScheme="whiteAlpha"
              px={8}
              _hover={{
                transform: 'translateY(-2px)',
                boxShadow: 'lg',
              }}
              transition="all 0.2s"
            >
              Explore Marketplace
            </Button>
          </Stack>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxW="container.xl" py={20}>
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={10}>
          <FeatureCard
            icon={FaHandshake}
            title="Direct from Artisans"
            text="Connect directly with skilled artisans from Chennai, supporting local craftsmanship and preserving cultural heritage."
          />
          <FeatureCard
            icon={FaShieldAlt}
            title="Blockchain Verified"
            text="Every piece is authenticated on the blockchain, ensuring the provenance and authenticity of your artisanal crafts."
          />
          <FeatureCard
            icon={FaGlobe}
            title="Global Marketplace"
            text="Access a worldwide marketplace for Chennai's artisanal crafts, bringing traditional craftsmanship to a global audience."
          />
        </SimpleGrid>
      </Container>

      <Box
        bgGradient="linear(to-r, teal.50, blue.50)"
        py={16}
        px={4}
        textAlign="center"
      >
        <Heading as="h3" size="lg" mb={4} color="teal.700">
          Ready to own a piece of Chennai's heritage?
        </Heading>
        <Text fontSize="lg" mb={8} color="gray.700">
          Browse our marketplace and discover your next unique collectible.
        </Text>
        <Button
          as={Link}
          to="/marketplace"
          size="lg"
          colorScheme="teal"
          px={8}
          _hover={{
            transform: 'translateY(-2px)',
            boxShadow: 'lg',
          }}
          transition="all 0.2s"
        >
          Go to Marketplace
        </Button>
      </Box>

      <Box bg="gray.800" color="gray.200" mt={16} pt={12} pb={6}>
        <Container maxW="container.xl">
          <SimpleGrid columns={{ base: 1, md: 4 }} spacing={10} mb={8}>
            {/* About the Project */}
            <Box>
              <Heading as="h4" size="md" mb={4} color="teal.300">Chennai Artisan NFT</Heading>
              <Text fontSize="sm" mb={2}>
                Preserving Chennai's rich artisanal heritage by connecting local creators with global collectors through blockchain technology.
              </Text>
              <Text fontSize="sm">© {new Date().getFullYear()} Chennai Artisan NFT</Text>
            </Box>
            {/* Artisans Section */}
            <Box>
              <Heading as="h4" size="sm" mb={4} color="teal.200">For Artisans</Heading>
              <Stack spacing={2}>
                <Text as="a" href="#">Become an Artisan</Text>
                <Text as="a" href="#">Artisan Stories</Text>
                <Text as="a" href="#">Workshops & Events</Text>
                <Text as="a" href="#">Support for Creators</Text>
              </Stack>
            </Box>
            {/* NFTs & Marketplace */}
            <Box>
              <Heading as="h4" size="sm" mb={4} color="teal.200">NFT Marketplace</Heading>
              <Stack spacing={2}>
                <Text as="a" href="#">Explore NFTs</Text>
                <Text as="a" href="#">How to Buy</Text>
                <Text as="a" href="#">Mint Your NFT</Text>
                <Text as="a" href="#">NFT FAQs</Text>
              </Stack>
            </Box>
            {/* Payments & Community */}
            <Box>
              <Heading as="h4" size="sm" mb={4} color="teal.200">Payments & Community</Heading>
              <Stack spacing={2}>
                <Text as="a" href="#">Crypto Payments</Text>
                <Text as="a" href="#">Security & Trust</Text>
                <Text as="a" href="#">Join Our Discord</Text>
                <Text as="a" href="#">Follow on Twitter</Text>
              </Stack>
            </Box>
          </SimpleGrid>
          <Flex
            justify="space-between"
            align="center"
            flexDir={{ base: "column", md: "row" }}
            borderTop="1px"
            borderColor="gray.700"
            pt={6}
          >
            <Stack direction="row" spacing={6} mb={{ base: 4, md: 0 }}>
              <Text fontSize="sm">Payment Methods:</Text>
              <Text fontSize="sm">Crypto (ETH, MATIC)</Text>
              <Text fontSize="sm">UPI</Text>
              <Text fontSize="sm">Net Banking</Text>
            </Stack>
            <Stack direction="row" spacing={6}>
              <Text fontSize="sm">Secure &amp; Verified</Text>
              <Text fontSize="sm">SSL 256-bit Encryption</Text>
            </Stack>
          </Flex>
        </Container>
      </Box>
    </Box>
  );
}
