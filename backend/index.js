const express = require("express");
const multer = require("multer");
const path = require("path");
const { PINATA_BASE_URL, FOLDER_NAME } = require("./constants");
const { pinImage } = require("./scripts/pinImage");
const { pinMetadata } = require("./scripts/pinMetadata");
const { BigQuery } = require("@google-cloud/bigquery");

const bigquery = new BigQuery();

const app = express();
var cors = require("cors");
app.use(cors());
app.use(express.json()); // Add this line to parse request body as JSON

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

app.post("/insertIntoNftBids", async (req, res) => {
  const { nftTokenId, bidderWalletAddress, bidAmount } = req.body;

  const datasetId = "nft_auction_dataset";
  const tableId = "nft_bids_table";

  // Check if the dataset exists, and create it if it doesn't
  const [datasetExists] = await bigquery.dataset(datasetId).exists();

  if (!datasetExists) {
    await bigquery.createDataset(datasetId);
  }

  // Check if the table exists, and create it if it doesn't
  const [tableExists] = await bigquery
    .dataset(datasetId)
    .table(tableId)
    .exists();
  if (!tableExists) {
    // Define your table schema
    // This should match the structure of the data in the 'data' parameter
    const schema = [
      { name: "nft_token_id", type: "INTEGER", mode: "REQUIRED" },
      { name: "bidder_wallet_address", type: "STRING", mode: "REQUIRED" },
      { name: "bid_amount", type: "INTEGER", mode: "REQUIRED" },
    ];

    await bigquery.dataset(datasetId).createTable(tableId, { schema });
  }

  try {
    const row = {
      nft_token_id: parseInt(nftTokenId),
      bidder_wallet_address: bidderWalletAddress,
      bid_amount: parseInt(bidAmount),
    };

    const options = {
      datasetId,
      tableId,
      rows: [row],
    };

    await bigquery
      .dataset(options.datasetId)
      .table(options.tableId)
      .insert(options.rows);
    console.log("Row inserted into nft_bids successfully");
    res.sendStatus(200);
  } catch (error) {
    console.error("Error inserting row into nft_bids:", error);
    res.sendStatus(500);
  }
});

app.listen(5000, () => {
  console.log("Server is running on port 5000");
});
