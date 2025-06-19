import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Box, Text, Badge, Image, Container, Heading, Grid } from "@chakra-ui/react";
import { useWeb3 } from "../context/Web3Context";

export default function NFTDetails() {
  const { id } = useParams();
  const { contract } = useWeb3();
  const [meta, setMeta] = useState(null);
  const [provenance, setProvenance] = useState([]);
  const [tokenURI, setTokenURI] = useState(null);
  const [ipfsMetadata, setIpfsMetadata] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!contract) return;
      
      try {
        // Fetch on-chain metadata
        const metadata = await contract.getItemMetadata(id);
        setMeta(metadata);
        
        // Fetch provenance
        const provenanceData = await contract.getProvenance(id);
        setProvenance(provenanceData);
        
        // Fetch token URI and IPFS metadata
        const uri = await contract.tokenURI(id);
        setTokenURI(uri);
        
        if (uri && uri.startsWith('ipfs://')) {
          const ipfsHash = uri.replace('ipfs://', '');
          const response = await fetch(`https://ipfs.io/ipfs/${ipfsHash}`);
          if (response.ok) {
            const metadata = await response.json();
            setIpfsMetadata(metadata);
          }
        }

        // Convert ipfs:// to https://gateway.pinata.cloud/ipfs/
        let metadataUrl = uri;
        if (uri.startsWith("ipfs://")) {
          metadataUrl = "https://gateway.pinata.cloud/ipfs/" + uri.replace("ipfs://", "");
        }

        // Fetch the metadata JSON
        const metadataResponse = await fetch(metadataUrl);
        const metadataJson = await metadataResponse.json();
        setMeta(metadataJson);

        // Convert image ipfs:// to https://gateway.pinata.cloud/ipfs/
        let imgUrl = metadataJson.image;
        if (imgUrl.startsWith("ipfs://")) {
          imgUrl = "https://gateway.pinata.cloud/ipfs/" + imgUrl.replace("ipfs://", "");
        }
        setImageUrl(imgUrl);
      } catch (error) {
        console.error("Error fetching NFT data:", error);
      }
    };
    
    fetchData();
  }, [contract, id]);

  if (!meta) return <Text>Loading...</Text>;

  return (
    <Container maxW="container.lg" py={8}>
      <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={8}>
        {/* Image Section */}
        <Box>
          <Image
            src={imageUrl || "https://via.placeholder.com/400?text=No+Image"}
            alt={meta.description}
            width="100%"
            borderRadius="lg"
            fallbackSrc="https://via.placeholder.com/400?text=Loading..."
          />
        </Box>

        {/* Details Section */}
        <Box>
          <Heading size="lg" mb={4}>{ipfsMetadata?.name || `NFT #${id}`}</Heading>
          
          <Text fontWeight="bold" mb={2}>Description:</Text>
          <Text mb={4}>{meta.description}</Text>
          
          <Text fontWeight="bold" mb={2}>Materials:</Text>
          <Text mb={4}>{meta.materials}</Text>
          
          <Text fontWeight="bold" mb={2}>Artisan:</Text>
          <Text mb={4}>{meta.artisanDetails}</Text>
          
          <Text fontWeight="bold" mb={2}>Creation Date:</Text>
          <Badge mb={4}>
            {new Date(Number(meta.creationDate) * 1000).toLocaleDateString()}
          </Badge>
          
          {tokenURI && (
            <>
              <Text fontWeight="bold" mb={2}>IPFS Link:</Text>
              <Text mb={4}>
                <a 
                  href={tokenURI.startsWith('ipfs://') 
                    ? `https://ipfs.io/ipfs/${tokenURI.replace('ipfs://', '')}`
                    : tokenURI
                  } 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  {tokenURI}
                </a>
              </Text>
            </>
          )}
          
          <Text fontWeight="bold" mb={2}>Provenance:</Text>
          {provenance.map((addr, idx) => (
            <Text key={idx} fontSize="sm" color="gray.600">
              {addr}
            </Text>
          ))}
        </Box>
      </Grid>
    </Container>
  );
}
