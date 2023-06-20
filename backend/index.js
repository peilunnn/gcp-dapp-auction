const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { folderName } = require("./constants");
const { pinImage } = require("../client/src/scripts/pinImage");

const app = express();
var cors = require("cors");
app.use(cors());

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, folderName);
  },
  filename: function (req, file, cb) {
    const extension = path.extname(file.originalname);
    cb(null, file.originalname);
  },
});

const upload = multer({ storage });

app.post("/pin", upload.single("file"), (req, res) => {
  if (!fs.existsSync(folderName)) {
    fs.mkdirSync(folderName);
  }

  const imgPath = path.join(folderName, req.file.filename);
  pinImage(imgPath);
});

app.listen(5000, () => {
  console.log("Server is running on port 5000");
});
