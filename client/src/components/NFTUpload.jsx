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
} from "@mui/material";
import { useSnackbar } from "notistack";
import FileCopyIcon from "@mui/icons-material/FileCopy";
import { pinNFT } from "../scripts/pinNFT";
import { getMintNFTContract } from "../utils";

function NFTUpload({ web3, networkID, accounts }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const { enqueueSnackbar } = useSnackbar();
  const [tokenId, setTokenId] = useState(null);
  const [contractAddress, setContractAddress] = useState(null);

  const mintNFTContract = getMintNFTContract(web3, networkID);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    setSelectedFile(file);
  };

  return (
    <Box border={1} borderRadius={4} p={2} mt={2}>
      <Card>
        <CardContent>
          <Typography variant="h6" component="div" gutterBottom>
            <strong style={{ fontSize: "1.5rem" }}>
              Upload and mint a NFT
            </strong>
          </Typography>
          <Box mt={2}>
            <input
              id="upload-input"
              type="file"
              onChange={handleFileSelect}
              style={{ display: "none" }}
            />
            <label htmlFor="upload-input">
              <Button
                component="span"
                variant="contained"
                color="primary"
                fullWidth
                size="large"
                style={{ fontWeight: "bold" }}
              >
                Choose File
              </Button>
            </label>
          </Box>
          <Box mt={2}>
            <TextField
              id="name"
              label="Name"
              fullWidth
              value={name}
              onChange={(e) => setName(e.target.value)}
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
            <Button
              onClick={() =>
                pinNFT(
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
                )
              }
              disabled={!selectedFile || name.trim() === ""}
              variant="contained"
              color="primary"
              fullWidth
              size="large"
              style={{
                fontWeight: "bold",
                backgroundColor: "pink",
              }}
            >
              Upload
            </Button>
          </Box>
          {tokenId && contractAddress && (
            <Box mt={2}>
              <Typography
                variant="h6"
                gutterBottom
                style={{
                  color: "green",
                  fontWeight: "bold",
                  fontSize: "1.5rem",
                }}
              >
                Use the following to create an auction for your newly minted NFT:
              </Typography>
              <Box display="flex" alignItems="center" mt={1}>
                <Typography
                  variant="h6"
                  style={{
                    color: "green",
                    fontWeight: "bold",
                    fontSize: "1.5rem",
                  }}
                >
                  Token ID: {tokenId}
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
              <Box display="flex" alignItems="center" mt={1}>
                <Typography
                  variant="h6"
                  style={{
                    color: "green",
                    fontWeight: "bold",
                    fontSize: "1.5rem",
                  }}
                >
                  NFT Address: {contractAddress}
                </Typography>
                <Tooltip title="Copy to clipboard">
                  <IconButton
                    edge="end"
                    onClick={() =>
                      navigator.clipboard.writeText(contractAddress)
                    }
                  >
                    <FileCopyIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}

export default NFTUpload;
