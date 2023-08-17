import React, { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  Card,
  CardContent,
  CircularProgress,
} from "@mui/material";
import { generateAIArt } from "../scripts/generateAIArt";
import { useSnackbar } from "notistack";
import { pinAIGeneratedNft } from "../scripts/pinAIGeneratedNft";
import { getMintNFTContract } from "../utils";
import Creation from "./Creation";

const NFTAIGenerated = ({
  auctionFactoryJson,
  web3,
  networkID,
  accounts,
  refetchData,
  openConfirmationModal,
}) => {
  const [prompt, setPrompt] = useState("");
  const [image, setImage] = useState(null);
  const [mintLoading, setMintLoading] = useState(false);
  const [generateLoading, setGenerateLoading] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const [tokenId, setTokenId] = useState(null);
  const [mintNFTContractAddress, setMintNFTContractAddress] = useState(null);

  const mintNFTContract = getMintNFTContract(web3, networkID);

  const handleGenerateButtonClick = async () => {
    setGenerateLoading(true);
    generateAIArt(prompt, setImage, setGenerateLoading, enqueueSnackbar);
  };

  const handleMintButtonClick = async () => {
    setMintLoading(true);

    fetch(image)
      .then((res) => res.blob())
      .then((blob) => {
        const file = new File([blob], `${prompt}.jpg`, { type: "image/jpeg" });
        pinAIGeneratedNft(
          file,
          prompt,
          setPrompt,
          enqueueSnackbar,
          web3,
          mintNFTContract,
          accounts,
          setTokenId,
          setMintNFTContractAddress,
          setMintLoading,
          openConfirmationModal
        );
      })
      .catch((error) => {
        console.error("Error during the minting process:", error);
        setMintLoading(false);
      });
  };

  return (
    <Card
      sx={{
        border: "1px solid #ccc",
        mt: "20px",
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
          <strong style={{ fontSize: "1.4rem" }}>
            Generate AI Art and Mint
          </strong>
        </Typography>
        <Box mt={2}>
          <TextField
            id="prompt"
            label="Prompt"
            fullWidth
            required
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            error={prompt.trim() === ""}
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
          <Box
            position="relative"
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            {!generateLoading && (
              <Button
                onClick={handleGenerateButtonClick}
                disabled={prompt.trim() === ""}
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
                Generate
              </Button>
            )}
            {generateLoading && (
              <CircularProgress
                size={24}
                sx={{
                  color: "#FF9900",
                }}
              />
            )}
          </Box>
        </Box>
        {image && (
          <Grid
            container
            spacing={2}
            sx={{ marginTop: "10px", justifyContent: "center" }}
          >
            <Grid item xs={10}>
              <img
                src={image}
                alt="Generated artwork"
                style={{
                  maxWidth: "100%",
                  height: "auto",
                  display: "block",
                  margin: "auto",
                }}
              />
              <Box paddingY={2}>
                {!mintLoading && (
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={() => handleMintButtonClick()}
                    sx={{
                      backgroundColor: "#FF9900",
                      display: "block",
                      margin: "auto",
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
              </Box>{" "}
              {tokenId && mintNFTContractAddress && (
                <Box mt={2} textAlign="center">
                  <Box mt={2} display="flex" justifyContent="center">
                    <Creation
                      auctionFactoryJson={auctionFactoryJson}
                      web3={web3}
                      networkID={networkID}
                      accounts={accounts}
                      refetchData={refetchData}
                      mintNFTContractAddress={mintNFTContractAddress}
                      tokenId={tokenId}
                      openConfirmationModal={openConfirmationModal}
                    />
                  </Box>
                </Box>
              )}
            </Grid>
          </Grid>
        )}
      </CardContent>
    </Card>
  );
};

export default NFTAIGenerated;
