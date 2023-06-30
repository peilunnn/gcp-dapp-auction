const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { PINATA_BASE_URL, FOLDER_NAME } = require("./constants");
const { pinImage } = require("./scripts/pinImage");
const { pinMetadata } = require("./scripts/pinMetadata");

const app = express();
var cors = require("cors");
app.use(cors());

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, FOLDER_NAME);
  },
  filename: function (req, file, cb) {
    const extension = path.extname(file.originalname);
    cb(null, file.originalname);
  },
});

const upload = multer({ storage });

app.post("/pin", upload.single("file"), async (req, res) => {
  // Pin image
  const imgPath = path.join(FOLDER_NAME, req.file.filename);
  const imageIpfsHash = await pinImage(imgPath);

  // Pin metadata
  const metadata = {
    ...req.body,
    image: `${PINATA_BASE_URL}/${imageIpfsHash}`,
  };
  const metadataString = JSON.stringify(metadata);
  const metadataIpfsHash = await pinMetadata(metadataString);
  const metadataURI = `${PINATA_BASE_URL}/${metadataIpfsHash}`;

  res.json({
    metadataURI: metadataURI,
  });
});

app.listen(5000, () => {
  console.log("Server is running on port 5000");
});
