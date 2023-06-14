require("dotenv").config();
const fs = require("fs");
const axios = require("axios");
const FormData = require("form-data");
const { storeDataToFile, fillIpfsHashToMetaData } = require("./ipfsHelper.js");
const pinMetaData = require("./pinMetaData");

const pinDataToIPFS = async (filePath, fileName) => {
  const pinataEndpoint = process.env.PINATA_ENDPOINT;
  const pinataApiKey = process.env.REACT_APP_PINATA_API_KEY;
  const pinataApiSecret = process.env.REACT_APP_PINATA_API_SECRET;
  const form_data = new FormData();

  await fillIpfsHashToMetaData(filePath);
};

module.exports = pinDataToIPFS;
