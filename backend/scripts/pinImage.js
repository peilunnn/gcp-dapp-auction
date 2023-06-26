require("dotenv").config({ path: `${__dirname}/.env` });
const axios = require("axios");
const fs = require("fs");
const FormData = require("form-data");

const pinataEndpoint = process.env.PINATA_IMAGE_ENDPOINT;
const pinataApiKey = process.env.REACT_APP_PINATA_API_KEY;
const pinataApiSecret = process.env.REACT_APP_PINATA_API_SECRET;

const pinImage = async (imgPath) => {
  const formData = new FormData();
  try {
    formData.append("file", fs.createReadStream(imgPath));

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
    const data = (await axios(request)).data;
    console.log("Successfully pinned image");
    return data.IpfsHash;
  } catch (err) {
    console.log("Error occurred while pinning image to IPFS: ", err);
  }
};

module.exports = { pinImage };
