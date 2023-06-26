require("dotenv").config({ path: `${__dirname}/.env` });
const axios = require("axios");

const pinataEndpoint = process.env.PINATA_JSON_ENDPOINT;
const pinataApiKey = process.env.REACT_APP_PINATA_API_KEY;
const pinataApiSecret = process.env.REACT_APP_PINATA_API_SECRET;

const pinMetadata = async (metadata) => {
  try {
    var data = JSON.stringify({
      pinataContent: metadata
    });

    const request = {
      method: "post",
      url: pinataEndpoint,
      headers: {
        pinata_api_key: pinataApiKey,
        pinata_secret_api_key: pinataApiSecret,
        "Content-Type": "application/json",
      },
      data: data,
    };
    debugger;
    const responseData = (await axios(request)).data;
    console.log("Successfully pinned metadata");
    return responseData.IpfsHash;
  } catch (err) {
    console.log("Error occurred while pinning metadata to IPFS: ", err);
  }
};

module.exports = { pinMetadata };
