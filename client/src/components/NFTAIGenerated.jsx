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

const NFTAIGenerated = () => {
  const [prompt, setPrompt] = useState("");
  const [image, setImage] = useState(null);
  const [mintLoading, setMintLoading] = useState(false);
  const [generateLoading, setGenerateLoading] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  const handleGenerateButtonClick = async () => {
    setGenerateLoading(true);
    await generateAIArt(prompt, setImage, setGenerateLoading, enqueueSnackbar);
  };

  const mintImage = () => {
    // Implement your minting functionality here.
    // This will be specific to the blockchain and smart contract you are using.
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
                style={{ maxWidth: "100%", display: "block", margin: "auto" }}
              />
              <Box paddingY={2}>
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={() => mintImage()}
                  sx={{
                    backgroundColor: "#FF9900",
                    display: "block",
                    margin: "auto",
                  }}
                >
                  Mint
                </Button>
              </Box>{" "}
            </Grid>
          </Grid>
        )}
      </CardContent>
    </Card>
  );
};

export default NFTAIGenerated;
