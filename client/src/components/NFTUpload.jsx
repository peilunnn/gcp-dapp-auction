import React, { useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  TextField,
  CircularProgress,
} from "@mui/material";
import { useSnackbar } from "notistack";
import { pinNFT } from "../scripts/pinNFT";
import { getMintNFTContract } from "../utils";
import Creation from "./Creation";

function NFTUpload({ web3, networkID, accounts, refetchData }) {
  const [uploadedImage, setUploadedImage] = useState(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const { enqueueSnackbar } = useSnackbar();
  const [mintNFTContractAddress, setMintNFTContractAddress] = useState(null);
  const [tokenId, setTokenId] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [mintLoading, setMintLoading] = useState(false);

  const mintNFTContract = getMintNFTContract(web3, networkID);

  const handleUploadImage = (event) => {
    const img = event.target.files[0];
    setUploadedImage(img);
    setImagePreview(URL.createObjectURL(img));
  };

  const handleMintButtonClick = async () => {
    setMintLoading(true);
    await pinNFT(
      uploadedImage,
      name,
      description,
      setUploadedImage,
      setName,
      setDescription,
      enqueueSnackbar,
      web3,
      mintNFTContract,
      accounts,
      setTokenId,
      setMintNFTContractAddress,
      setMintLoading
    );
  };

  return (
    <Card
      sx={{
        border: "1px solid #ccc",
        mt: "20px",
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <CardContent
        sx={{
          flex: "1 0 auto",
        }}
      >
        <Typography variant="h6" component="div" gutterBottom align="center">
          <strong style={{ fontSize: "1.4rem" }}>Upload and Mint a NFT</strong>
        </Typography>
        <Box mt={2}>
          <input
            id="upload-input"
            type="file"
            onChange={handleUploadImage}
            style={{ display: "none" }}
          />
          <label htmlFor="upload-input">
            <Button
              component="span"
              variant="contained"
              color="primary"
              fullWidth
              size="large"
              sx={{
                backgroundColor: "#FF9900",
                "&:hover": {
                  backgroundColor: "#cc7a00",
                },
                fontWeight: "bold",
              }}
            >
              Upload Image
            </Button>
          </label>
        </Box>
        {imagePreview && (
          <Box mt={2} display="flex" justifyContent="center">
            <img
              src={imagePreview}
              alt="Preview"
              style={{ maxWidth: "100%", maxHeight: "300px" }}
            />
          </Box>
        )}
        <Box mt={2}>
          <TextField
            id="name"
            label="Name"
            fullWidth
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={name.trim() === ""}
            sx={{
              "& .MuiOutlinedInput-root.Mui-error .MuiOutlinedInput-notchedOutline":
                {
                  borderColor: "red",
                },
              "& .MuiInputLabel-root.Mui-error": {
                color: "red",
              },
            }}
          />
        </Box>
        <Box mt={2}>
          <TextField
            id="description"
            label="Description"
            fullWidth
            multiline
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </Box>
        <Box mt={2}>
          <Box
            position="relative"
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            {!mintLoading && (
              <Button
                onClick={handleMintButtonClick}
                disabled={!uploadedImage || name.trim() === ""}
                variant="contained"
                fullWidth
                size="large"
                sx={{
                  backgroundColor: "#FF9900",
                  "&:hover": {
                    backgroundColor: "#cc7a00",
                  },
                  fontWeight: "bold",
                }}
              >
                Mint
              </Button>
            )}
            {mintLoading && (
              <Box
                position="relative"
                display="flex"
                flexDirection="column"
                alignItems="center"
                justifyContent="center"
              >
                <CircularProgress
                  size={24}
                  sx={{
                    color: "#FF9900",
                  }}
                />
                <Typography
                  variant="subtitle1"
                  sx={{
                    color: "#FF9900",
                    marginTop: "10px",
                  }}
                >
                  Waiting for wallet confirmation...
                </Typography>
              </Box>
            )}
          </Box>
        </Box>
        {tokenId && mintNFTContractAddress && (
          <Box mt={2} textAlign="center">
            <Box mt={2} display="flex" justifyContent="center">
              <Creation
                refetchData={refetchData}
                mintNFTContractAddress={mintNFTContractAddress}
                tokenId={tokenId}
              />
            </Box>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}

export default NFTUpload;
