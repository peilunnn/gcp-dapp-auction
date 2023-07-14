import axios from "axios";
import { mintNFT } from "../utils";

const bePinUrl = process.env.REACT_APP_BE_PIN_URL;

export function pinAIGeneratedNft(
  generatedFile,
  prompt,
  setPrompt,
  enqueueSnackbar,
  web3,
  mintNFTContract,
  accounts,
  setTokenId,
  setMintNFTContractAddress,
  setMintLoading
) {
  const formData = new FormData();
  formData.append("file", generatedFile);
  formData.append("name", prompt);
  formData.append("description", "");

  axios
    .post(bePinUrl, formData)
    .then(async (response) => {
      const metadataURI = response.data.metadataURI;
      const tokenId = await mintNFT(
        web3,
        mintNFTContract,
        accounts,
        metadataURI
      );
      const contractAddress = mintNFTContract.options.address;

      setPrompt("");
      enqueueSnackbar("Successfully pinned and minted NFT", {
        variant: "success",
      });
      setMintLoading(false);
      setTokenId(tokenId);
      setMintNFTContractAddress(contractAddress);
    })
    .catch((error) => {
      console.log("Error uploading file:", error);
      setMintLoading(false);
    });
}
