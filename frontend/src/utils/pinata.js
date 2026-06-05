import axios from 'axios';

export const uploadFileToIPFS = async (file) => {
    const url = `https://api.pinata.cloud/pinning/pinFileToIPFS`;
    
    // We use FormData to package the image file for the API
    let data = new FormData();
    data.append('file', file);

    try {
        const response = await axios.post(url, data, {
            headers: {
                'Content-Type': `multipart/form-data; boundary=${data._boundary}`,
                'pinata_api_key': import.meta.env.VITE_PINATA_API_KEY,
                'pinata_secret_api_key': import.meta.env.VITE_PINATA_SECRET_API_KEY
            }
        });
        
        // This is the CID (Content Identifier) - the permanent hash of your image!
        return response.data.IpfsHash; 
    } catch (error) {
        console.error("Error uploading to Pinata: ", error);
        throw new Error("Failed to upload image to IPFS");
    }
};