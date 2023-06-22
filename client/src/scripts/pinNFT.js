require("dotenv").config({ path: `${__dirname}/.env` });
const axios = require("axios");
const fs = require("fs");
const FormData = require("form-data");
const { storeDataToFile } = require("./ipfsHelper.js");

const pinataEndpoint = process.env.PINATA_ENDPOINT;
const pinataApiKey = process.env.REACT_APP_PINATA_API_KEY;
const pinataApiSecret = process.env.REACT_APP_PINATA_API_SECRET;

const pinNFT = async (imgPath, metadata) => {
  const formData = new FormData();
  try {
    formData.append("file", fs.createReadStream(imgPath));
    formData.append("pinataMetadata", metadata);

    const request = {
      method: "post",
      url: pinataEndpoint,
      maxContentLength: "Infinity",
      headers: {
        pinata_api_key: pinataApiKey,
        pinata_secret_api_key: pinataApiSecret,
        "Content-Type": `multipart/form-data; boundary=${formData._boundary}`,
      },
      data: formData,
    };
    const response = await axios(request);
    await storeDataToFile(response.data);
    console.log("Successfully pinned image and metadata, response added to JSON file");
  } catch (err) {
    console.log("Error occurred while pinning NFT to IPFS: ", err);
  }
};

module.exports = { pinNFT };
