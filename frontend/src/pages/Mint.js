import React, { useState } from "react";
import {
  Box,
  Heading,
  Input,
  Button,
  Text,
  VStack,
  useToast,
  Container,
  FormControl,
  FormLabel,
  Textarea,
  useColorModeValue,
  Icon,
  Flex,
  Alert,
  AlertIcon,
  Image,
  Divider,
} from "@chakra-ui/react";
import { useWeb3 } from "../context/Web3Context";
import { FaImage, FaInfoCircle, FaTools, FaUser } from 'react-icons/fa';

export default function Mint() {
  const { contract, isArtisan } = useWeb3();
  const [form, setForm] = useState({
    description: "",
    materials: "",
    artisanDetails: "",
    ipfsLink: ""
  });
  const [previewUrl, setPreviewUrl] = useState("");
  const toast = useToast();
  
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleMint = async () => {
    try {
      const tx = await contract.mintNFT(
        form.description,
        form.materials,
        form.artisanDetails,
        form.ipfsLink
      );
      await tx.wait();
      toast({ 
        title: "NFT Minted Successfully!", 
        description: "Your artwork is now on the blockchain.",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
    } catch (err) {
      toast({ 
        title: "Mint Failed", 
        description: err.message, 
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  if (!isArtisan) {
    return (
      <Container maxW="container.md" py={10}>
        <Alert status="warning" borderRadius="lg">
          <AlertIcon />
          <Text>Only registered artisans can mint NFTs. Please contact the admin to get registered.</Text>
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxW="container.md" py={10}>
      <Box
        bg={bgColor}
        borderRadius="xl"
        boxShadow="xl"
        p={8}
        borderWidth="1px"
        borderColor={borderColor}
      >
        <VStack spacing={6} align="stretch">
          <Box textAlign="center" mb={6}>
            <Heading 
              size="xl" 
              bgGradient="linear(to-r, teal.400, blue.500)"
              bgClip="text"
              mb={2}
            >
              Mint New NFT
            </Heading>
            <Text color="gray.500">
              Create your unique artisanal NFT on the blockchain
            </Text>
          </Box>

          <Divider />

          <FormControl isRequired>
            <FormLabel>
              <Flex align="center">
                <Icon as={FaInfoCircle} mr={2} color="teal.500" />
                Description
              </Flex>
            </FormLabel>
            <Textarea
              name="description"
              placeholder="Describe your artwork in detail..."
              onChange={handleChange}
              size="lg"
              rows={4}
              _hover={{ borderColor: 'teal.500' }}
              _focus={{ borderColor: 'teal.500', boxShadow: '0 0 0 1px teal.500' }}
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel>
              <Flex align="center">
                <Icon as={FaTools} mr={2} color="teal.500" />
                Materials Used
              </Flex>
            </FormLabel>
            <Input
              name="materials"
              placeholder="e.g., Clay, Cotton, Bronze..."
              onChange={handleChange}
              size="lg"
              _hover={{ borderColor: 'teal.500' }}
              _focus={{ borderColor: 'teal.500', boxShadow: '0 0 0 1px teal.500' }}
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel>
              <Flex align="center">
                <Icon as={FaUser} mr={2} color="teal.500" />
                Artisan Details
              </Flex>
            </FormLabel>
            <Textarea
              name="artisanDetails"
              placeholder="Share information about yourself and your craft..."
              onChange={handleChange}
              size="lg"
              rows={3}
              _hover={{ borderColor: 'teal.500' }}
              _focus={{ borderColor: 'teal.500', boxShadow: '0 0 0 1px teal.500' }}
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel>
              <Flex align="center">
                <Icon as={FaImage} mr={2} color="teal.500" />
                IPFS Image/Metadata Link
              </Flex>
            </FormLabel>
            <Input
              name="ipfsLink"
              placeholder="Enter your IPFS link..."
              onChange={handleChange}
              size="lg"
              _hover={{ borderColor: 'teal.500' }}
              _focus={{ borderColor: 'teal.500', boxShadow: '0 0 0 1px teal.500' }}
            />
          </FormControl>

          {previewUrl && (
            <Box mt={4}>
              <Text mb={2} fontWeight="medium">Preview:</Text>
              <Image
                src={previewUrl}
                alt="NFT Preview"
                borderRadius="lg"
                maxH="200px"
                objectFit="cover"
              />
            </Box>
          )}

          <Button
            colorScheme="teal"
            size="lg"
            onClick={handleMint}
            mt={4}
            _hover={{
              transform: 'translateY(-2px)',
              boxShadow: 'lg',
            }}
            transition="all 0.2s"
            isDisabled={!form.description || !form.materials || !form.artisanDetails || !form.ipfsLink}
          >
            Mint NFT
          </Button>
        </VStack>
      </Box>
    </Container>
  );
}
