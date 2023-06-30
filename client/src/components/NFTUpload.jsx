import React, { useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  TextField,
  Tooltip,
  IconButton,
  CircularProgress,
} from "@mui/material";
import { useSnackbar } from "notistack";
import FileCopyIcon from "@mui/icons-material/FileCopy";
import { pinNFT } from "../scripts/pinNFT";
import { getMintNFTContract } from "../utils";

function NFTUpload({ web3, networkID, accounts }) {
  const [uploadedImage, setUploadedImage] = useState(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const { enqueueSnackbar } = useSnackbar();
  const [tokenId, setTokenId] = useState(null);
  const [mintNFTContractAddress, setMintNFTContractAddress] = useState(null);
  const [loading, setLoading] = useState(false);

  const mintNFTContract = getMintNFTContract(web3, networkID);

  const handleUploadImage = (event) => {
    const img = event.target.files[0];
    setUploadedImage(img);
  };

  const handleMintButtonClick = async () => {
    setLoading(true);
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
      setLoading
    );
  };

  return (
    <Card sx={{ border: "1px solid #ccc", mt: "20px", height: "550px" }}>
      <CardContent>
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
            {!loading && (
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
            {loading && (
              <Box
                position="absolute"
                display="flex"
                flexDirection="column"
                alignItems="center"
                justifyContent="center"
                marginTop="40px"
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
                    marginTop: "5px",
                  }}
                >
                  Waiting for wallet confirmation...
                </Typography>
              </Box>
            )}
          </Box>
        </Box>
        {tokenId && mintNFTContractAddress && !loading && (
          <Box mt={2}>
            <Typography
              variant="h6"
              gutterBottom
              style={{
                fontWeight: "bold",
                fontSize: "1.2rem",
              }}
            >
              Use the following to create an auction for your newly minted NFT:
            </Typography>
            <Box display="flex" alignItems="center" mt={1}>
              <Typography
                variant="h6"
                style={{
                  fontWeight: "bold",
                  fontSize: "1.2rem",
                }}
              >
                NFT Address: {mintNFTContractAddress}
              </Typography>
              <Tooltip title="Copy to clipboard">
                <IconButton
                  edge="end"
                  onClick={() =>
                    navigator.clipboard.writeText(mintNFTContractAddress)
                  }
                >
                  <FileCopyIcon />
                </IconButton>
              </Tooltip>
            </Box>
            <Box display="flex" alignItems="center" mt={1}>
              <Typography
                variant="h6"
                style={{
                  fontWeight: "bold",
                  fontSize: "1.2rem",
                }}
              >
                NFT Token ID: {tokenId}
              </Typography>
              <Tooltip title="Copy to clipboard">
                <IconButton
                  edge="end"
                  onClick={() => navigator.clipboard.writeText(tokenId)}
                >
                  <FileCopyIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}

export default NFTUpload;
