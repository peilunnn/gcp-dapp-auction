const express = require("express");
const multer = require("multer");
const path = require("path");
const { PINATA_BASE_URL, FOLDER_NAME } = require("./constants");
const { pinImage } = require("./scripts/pinImage");
const { pinMetadata } = require("./scripts/pinMetadata");
const { BigQuery } = require("@google-cloud/bigquery");
const { GoogleAuth } = require("google-auth-library");

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

  const datasetId = "nft_auction_dataset_sg";
  const tableId = "nft_bids_table";

  // Check if the dataset exists, and create it if it doesn't
  const [datasetExists] = await bigquery.dataset(datasetId).exists();

  if (!datasetExists) {
    const options = {
      location: "asia-southeast1",
    };
    await bigquery.createDataset(datasetId, options);
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

app.post("/insertIntoNftSales", async (req, res) => {
  const {
    nftTokenId,
    sellerWalletAddress,
    highestBidderWalletAddress,
    bidAmount,
  } = req.body;

  const datasetId = "nft_auction_dataset_sg";
  const tableId = "nft_sales_table";

  // Check if the dataset exists, and create it if it doesn't
  const [datasetExists] = await bigquery.dataset(datasetId).exists();

  if (!datasetExists) {
    const options = {
      location: "asia-southeast1",
    };
    await bigquery.createDataset(datasetId, options);
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
      { name: "seller_wallet_address", type: "STRING", mode: "REQUIRED" },
      {
        name: "highest_bidder_wallet_address",
        type: "STRING",
        mode: "REQUIRED",
      },
      { name: "bid_amount", type: "INTEGER", mode: "REQUIRED" },
    ];

    await bigquery.dataset(datasetId).createTable(tableId, { schema });
  }

  try {
    const row = {
      nft_token_id: parseInt(nftTokenId),
      seller_wallet_address: sellerWalletAddress,
      highest_bidder_wallet_address: highestBidderWalletAddress,
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
    console.log("Row inserted into nft_sales successfully");
    res.sendStatus(200);
  } catch (error) {
    console.error("Error inserting row into nft_sales:", error);
    res.sendStatus(500);
  }
});

app.post("/insertIntoMintTransactions", async (req, res) => {
  const { transactionHash, user, gasUsed, effectiveGasPrice, status } =
    req.body;

  const datasetId = "nft_auction_dataset_sg";
  const tableId = "mint_transactions_table";

  // Check if the dataset exists, and create it if it doesn't
  const [datasetExists] = await bigquery.dataset(datasetId).exists();

  if (!datasetExists) {
    const options = {
      location: "asia-southeast1",
    };
    await bigquery.createDataset(datasetId, options);
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
      { name: "transaction_hash", type: "STRING", mode: "REQUIRED" },
      { name: "user", type: "STRING", mode: "REQUIRED" },
      { name: "gas_used", type: "INTEGER", mode: "REQUIRED" },
      { name: "effective_gas_price", type: "INTEGER", mode: "REQUIRED" },
      { name: "status", type: "STRING", mode: "REQUIRED" },
    ];

    await bigquery.dataset(datasetId).createTable(tableId, { schema });
  }

  try {
    const row = {
      transaction_hash: transactionHash,
      user: user,
      gas_used: gasUsed,
      effective_gas_price: effectiveGasPrice,
      status: status.toString(),
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
    console.log("Row inserted into mint_transactions successfully");
    res.sendStatus(200);
  } catch (error) {
    console.error("Error inserting row into mint_transactions:", error);
    res.sendStatus(500);
  }
});

app.post("/generateAIArt", async (req, res) => {
  const { prompt, sampleCount } = req.body;

  const auth = new GoogleAuth({
    scopes: "https://www.googleapis.com/auth/cloud-platform",
  });

  const client = await auth.getClient();
  const projectId = await auth.getProjectId();
  const url = `https://us-central1-aiplatform.googleapis.com/v1/projects/${projectId}/locations/us-central1/publishers/google/models/imagegeneration:predict`;

  try {
    const response = await client.request({
      url,
      method: "post",
      data: {
        instances: [
          {
            prompt: prompt,
          },
        ],
        parameters: {
          sampleCount: sampleCount,
        },
      },
      headers: {
        "Content-Type": "application/json; charset=utf-8",
      },
    });

    res.send(response.data);
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  }
});

app.listen(5000, () => {
  console.log("Server is running on port 5000");
});
