import { create } from 'ipfs-http-client';

// Configure auth for Infura IPFS - you should replace these with your own credentials
// and store them in environment variables
const projectId = process.env.REACT_APP_INFURA_PROJECT_ID || '2NNlYXYbZlXwrfwqCcyxJgh4vF5';
const projectSecret = process.env.REACT_APP_INFURA_PROJECT_SECRET || '94a9b55c9c7daf0a97c5dff0c9a5212c';
const auth = 'Basic ' + btoa(projectId + ':' + projectSecret);

const client = create({
  host: 'ipfs.infura.io',
  port: 5001,
  protocol: 'https',
  headers: {
    authorization: auth,
  },
});

// Upload file to IPFS
export const uploadToIPFS = async (file) => {
  try {
    const added = await client.add(
      file,
      {
        progress: (prog) => console.log(`Received: ${prog}`)
      }
    );
    return added.path;
  } catch (error) {
    console.error('Error uploading file to IPFS:', error);
    throw new Error('IPFS upload failed: ' + error.message);
  }
};

// Upload metadata JSON to IPFS
export const uploadMetadataToIPFS = async (metadata) => {
  try {
    const metadataJSON = JSON.stringify(metadata);
    const added = await client.add(metadataJSON);
    return added.path;
  } catch (error) {
    console.error('Error uploading metadata to IPFS:', error);
    throw new Error('IPFS metadata upload failed: ' + error.message);
  }
};

// Create NFT metadata object
export const createNFTMetadata = (name, description, imageUrl, materials, artisanDetails) => {
  return {
    name,
    description,
    image: imageUrl,
    attributes: [
      {
        trait_type: 'Materials',
        value: materials
      },
      {
        trait_type: 'Artisan',
        value: artisanDetails
      },
      {
        trait_type: 'Creation Date',
        value: new Date().toISOString()
      }
    ]
  };
};


