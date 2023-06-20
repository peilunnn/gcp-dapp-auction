const fs = require("fs").promises;
const path = require("path");

// https://stackoverflow.com/questions/36856232/write-add-data-in-json-file-using-node-js
// Accepts json data and stores in specified filePath.
// If the file does not exists in specified location, it creates it
const storeDataToFile = async (jsonData) => {
  try {
    const filePath = path.join(__dirname, "../../data/ipfsHash.json");
    const ipfsFileExists = await fileExists(filePath);
    if (!ipfsFileExists) {
      console.log("ipfsFileExists: ", ipfsFileExists);
      // First time creating an empty file with [].
      // We will be storing all ipfsHashes as array of objects
      await fs.writeFile(filePath, JSON.stringify([]));
    }
    const data = await fs.readFile(filePath, "utf8");
    const json = JSON.parse(data);
    json.push(jsonData);
    await fs.writeFile(filePath, JSON.stringify(json));
  } catch (err) {
    console.log("Error occured while storing data to file", err);
  }
};

async function fileExists(path) {
  try {
    const res = await fs.access(path);
    return true;
  } catch (err) {
    if (err.code == "ENOENT") {
      return false;
    }
    console.log("Exception fs.statSync (" + path + "): " + err);
    throw err;
  }
}

const fillIpfsHashToMetaData = async (metaDataFilePath) => {
  const ipfsFilePath = path.join(__dirname, "../../data/ipfsHash.json");
  const data = await fs.readFile(ipfsFilePath, "utf8");
  const json = JSON.parse(data);
  const ipfsHash = json[json.length - 1].IpfsHash;
  var metadata = await fs.readFile(metaDataFilePath, "utf8");
  var metadataJson = JSON.parse(metadata);
  metadataJson.image = "https://gateway.pinata.cloud/ipfs/" + ipfsHash;
  fs.writeFile(metaDataFilePath, JSON.stringify(metadataJson));
};

module.exports = {
  storeDataToFile,
  fileExists,
  fillIpfsHashToMetaData,
};
