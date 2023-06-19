import React, { useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Box,
} from "@mui/material";

function FileUploadButton() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [pinataApiKey, setPinataApiKey] = useState("");
  const [pinataSecretApiKey, setPinataSecretApiKey] = useState("");

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    setSelectedFile(file);
  };

  const handleFileUpload = () => {
    if (selectedFile) {
      console.log("Uploading file:", selectedFile);
      console.log("Pinata API Key:", pinataApiKey);
      console.log("Pinata Secret API Key:", pinataSecretApiKey);
      // Reset selected file and input fields
      setSelectedFile(null);
      setPinataApiKey("");
      setPinataSecretApiKey("");
    }
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
          <TextField
            label="Pinata API Key"
            value={pinataApiKey}
            onChange={(e) => setPinataApiKey(e.target.value)}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Pinata Secret API Key"
            value={pinataSecretApiKey}
            onChange={(e) => setPinataSecretApiKey(e.target.value)}
            fullWidth
            margin="normal"
          />
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
              style={{ fontWeight: "bold", marginTop: 10 }}
            >
              Choose File
            </Button>
          </label>
          <Button
            onClick={handleFileUpload}
            disabled={!selectedFile || !pinataApiKey || !pinataSecretApiKey}
            variant="contained"
            color="primary"
            fullWidth
            size="large"
            style={{ fontWeight: "bold", marginTop: 10, backgroundColor: "green"}}
          >
            Upload
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
}

export default FileUploadButton;
