const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { uploadedImagesFolder } = require("./constants");
const { pinNFT } = require("./scripts/pinNFT");

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
  const imgPath = path.join(uploadedImagesFolder, req.file.filename);
  const metadataJSON = JSON.stringify(req.body);
  const ipfsHash = await pinNFT(imgPath, metadataJSON);
  res.json({ ipfsHash: ipfsHash });
});

app.listen(5000, () => {
  console.log("Server is running on port 5000");
});
