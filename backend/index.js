const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { imgPath } = require("./constants");

const app = express();
var cors = require("cors");
app.use(cors());

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, imgPath);
  },
  filename: function (req, file, cb) {
    const extension = path.extname(file.originalname);
    cb(null, file.originalname);
  },
});

const upload = multer({ storage });

app.post("/pin", upload.single("file"), (req, res) => {
  if (!fs.existsSync(imgPath)) {
    fs.mkdirSync(imgPath);
  }
  console.log("Uploaded file:", req.file);
  res.send("File uploaded successfully");
});

app.listen(5000, () => {
  console.log("Server is running on port 5000");
});
