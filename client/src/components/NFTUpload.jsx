import React, { useState } from "react";
import { Card, CardContent, Typography, Button, Box } from "@mui/material";
import axios from "axios";

function NFTUpload() {
  const [selectedFile, setSelectedFile] = useState(null);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    setSelectedFile(file);
  };

  const handleFileUpload = () => {
    if (selectedFile) {
      const formData = new FormData();
      formData.append("file", selectedFile);

      axios
        .post("http://your-backend-url/upload", formData)
        .then((response) => {
          console.log("File uploaded successfully");
          setSelectedFile(null);
        })
        .catch((error) => {
          console.log("Error uploading file:", error);
        });
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
            <Button
              onClick={handleFileUpload}
              disabled={!selectedFile}
              variant="contained"
              color="primary"
              fullWidth
              size="large"
              style={{
                fontWeight: "bold",
                backgroundColor: "green",
              }}
            >
              Upload
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}

export default NFTUpload;
