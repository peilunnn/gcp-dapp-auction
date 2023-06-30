import axios from "axios";
import { mintNFT } from "../utils";

const beEndpoint = process.env.REACT_APP_BE_ENDPOINT;

export function pinNFT(
  selectedFile,
  name,
  description,
  setSelectedFile,
  setName,
  setDescription,
  enqueueSnackbar,
  web3,
  mintNFTContract,
  accounts,
  setTokenId,
  setMintNFTContractAddress,
  setLoading
) {
  if (!(selectedFile && name.trim() !== "")) {
    enqueueSnackbar("Please select a picture and provide a name", {
      variant: "error",
    });
  }

  const formData = new FormData();
  formData.append("file", selectedFile);
  formData.append("name", name);
  formData.append("description", description);

  axios
    .post(beEndpoint, formData)
    .then(async (response) => {
      setLoading(false);
      const metadataURI = response.data.metadataURI;
      const tokenId = await mintNFT(
        web3,
        mintNFTContract,
        accounts,
        metadataURI
      );
      const contractAddress = mintNFTContract.options.address;

      setSelectedFile(null);
      setName("");
      setDescription("");
      enqueueSnackbar("Successfully pinned and minted NFT", {
        variant: "success",
      });
      setTokenId(tokenId);
      setMintNFTContractAddress(contractAddress);
    })
    .catch((error) => {
      console.log("Error uploading file:", error);
    });
}
