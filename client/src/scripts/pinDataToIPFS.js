require("dotenv").config();
const fs = require("fs");
const axios = require("axios");
const FormData = require("form-data");
const { storeDataToFile, fillIpfsHashToMetaData } = require("./ipfsHelper.js");
const pinMetaData = require("./pinMetaData");

const pinDataToIPFS = async (filePath, fileName) => {
  await fillIpfsHashToMetaData(filePath);
};

module.exports = pinDataToIPFS;
