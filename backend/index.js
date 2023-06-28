const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { uploadedImagesFolder } = require("./constants");
const { pinImage } = require("./scripts/pinImage");
const { pinMetadata } = require("./scripts/pinMetadata");

const app = express();
var cors = require("cors");
app.use(cors());

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadedImagesFolder);
  },
  filename: function (req, file, cb) {
    const extension = path.extname(file.originalname);
    cb(null, file.originalname);
  },
});

const upload = multer({ storage });

app.post("/pin", upload.single("file"), async (req, res) => {
  // Pin image
  const imgPath = path.join(uploadedImagesFolder, req.file.filename);
  const imageIpfsHash = await pinImage(imgPath);

  // Pin metadata
  const metadata = {
    ...req.body,
    image: `https://gateway.pinata.cloud/ipfs/${imageIpfsHash}`,
  };
  const metadataString = JSON.stringify(metadata);
  const metadataIpfsHash = await pinMetadata(metadataString);
  const metadataURI = `https://gateway.pinata.cloud/ipfs/${metadataIpfsHash}`;

  res.json({
    metadataURI: metadataURI,
  });
});

app.listen(5000, () => {
  console.log("Server is running on port 5000");
});
