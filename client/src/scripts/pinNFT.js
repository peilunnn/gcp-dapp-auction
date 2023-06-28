import axios from "axios";
import { mintNFT } from "../utils";

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
  setContractAddress
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
    .post("https://dapp-be-staging-6gnnhrwjpa-as.a.run.app/pin", formData)
    .then(async (response) => {
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
      setContractAddress(contractAddress);
    })
    .catch((error) => {
      console.log("Error uploading file:", error);
    });
}