import React, { useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  TextField,
} from "@mui/material";
import axios from "axios";
import { useSnackbar } from "notistack";

function NFTUpload() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const { enqueueSnackbar } = useSnackbar();

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    setSelectedFile(file);
  };

  const handleFileUpload = () => {
    if (selectedFile && name.trim() !== "") {
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
    } else {
      enqueueSnackbar("Please select a picture and provide a name", {
        variant: "error",
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
              onClick={handleFileUpload}
              disabled={!selectedFile || name.trim() === ""}
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
