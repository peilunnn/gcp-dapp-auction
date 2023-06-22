import axios from "axios";

export function pinNFT(
  selectedFile,
  name,
  description,
  setSelectedFile,
  setName,
  setDescription,
  enqueueSnackbar
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
    .post("http://localhost:5000/pin", formData)
    .then((response) => {
      setSelectedFile(null);
      setName("");
      setDescription("");
      enqueueSnackbar("Pinned NFT and metadata to IPFS", {
        variant: "success",
      });
      console.log("File uploaded successfully");
    })
    .catch((error) => {
      console.log("Error uploading file:", error);
    });
}
