const Web3 = require("web3");
const TruffleContract = require("truffle-contract");
const contractArtifact = require("../contracts/MintNFT.json");

const providerUrl = "http://127.0.0.1:8545";
const web3Provider = new Web3.providers.HttpProvider(providerUrl);
const web3 = new Web3(web3Provider);

const MintNFTContract = TruffleContract(contractArtifact);
MintNFTContract.setProvider(web3.currentProvider);

async function mintNFT(ipfsHash) {
  try {
    const accounts = await web3.eth.getAccounts();
    const instance = await MintNFTContract.new({ from: accounts[0] });
    console.log("Contract deployed at address:", instance.address);

    const tokenURI = `https://gateway.pinata.cloud/ipfs/${ipfsHash}}`;
    await instance.mint(tokenURI, { from: accounts[0] });
  } catch (error) {
    console.error("Error deploying and minting contract:", error);
  }
}

module.exports = { mintNFT };
