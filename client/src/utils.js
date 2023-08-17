import axios from "axios";
require("dotenv").config();

const beMintTransactionsUrl = process.env.REACT_APP_BE_MINT_TRANSACTIONS_URL;
let cache = {};

export function getAuctionFactoryContract(web3, networkID) {
  if (web3 === null || networkID === null) {
    console.log(
      "Unable to get AuctionFactory contract. web3 or networkID is null."
    );
    return;
  }

  const auctionFactoryJson = require("./contracts/AuctionFactory.json");
  if (
    auctionFactoryJson &&
    auctionFactoryJson.networks[networkID] === undefined
  ) {
    console.log("Unable to get AuctionFactory contract. networkID is invalid.");
    return;
  }
  const auctionFactoryAddress = auctionFactoryJson.networks[networkID].address;
  const auctionFactoryContract = new web3.eth.Contract(
    auctionFactoryJson.abi,
    auctionFactoryAddress
  );
  return auctionFactoryContract;
}

export function getMintNFTContract(web3, networkID) {
  if (web3 === null) {
    console.log("Unable to get MintNFT contract, web3 is null.");
    return;
  }

  if (networkID === null) {
    console.log("Unable to get MintNFT contract, networkID is null.");
    return;
  }

  const mintNFTJson = require("./contracts/MintNFT.json");
  if (mintNFTJson && mintNFTJson.networks[networkID] === undefined) {
    console.log("Unable to get MintNFT contract. networkID is invalid.");
    return;
  }

  const mintNFTAddress = mintNFTJson.networks[networkID].address;
  const mintNFTContract = new web3.eth.Contract(
    mintNFTJson.abi,
    mintNFTAddress
  );
  return mintNFTContract;
}

export async function mintNFT(web3, mintNFTContract, accounts, metadataURI) {
  if (web3 === null || mintNFTContract === null || accounts == null) {
    console.log("Unable to get auctions. web3 or mintNFTContract is null.");
    return [];
  }
  const receipt = await mintNFTContract.methods
    .mint(metadataURI)
    .send({ from: accounts[0] });

  const transactionHash = receipt.transactionHash;
  const user = receipt.from;
  const gasUsed = receipt.gasUsed;
  const effectiveGasPrice = receipt.effectiveGasPrice;
  const status = receipt.status;

  try {
    const response = await axios.post(beMintTransactionsUrl, {
      transactionHash,
      user,
      gasUsed,
      effectiveGasPrice,
      status,
    });

    console.log("Row inserted into mint_transactions successfully");
    console.log("Response:", response.data);
  } catch (error) {
    console.error("Error inserting row into mint_transactions:", error);
  }

  const tokenId = receipt.events.Transfer.returnValues.tokenId;
  return tokenId;
}

export async function getAuctions(web3, auctionFactoryContract, accounts) {
  if (
    web3 === null ||
    auctionFactoryContract === null ||
    accounts == null ||
    auctionFactoryContract === undefined
  ) {
    console.log(
      "Unable to get auctions. web3 or auctionFactoryContract is null."
    );
    return [];
  }
  const auctionContractAddresses = await auctionFactoryContract.methods
    .getAuctions()
    .call();
  const auctionContractJson = require("./contracts/Auction.json");
  const mintNFTContractJson = require("./contracts/MintNFT.json");
  const auctions = [];
  for (let auctionContractAddress of auctionContractAddresses) {
    const auctionContract = new web3.eth.Contract(
      auctionContractJson.abi,
      auctionContractAddress
    );
    const tokenId = parseInt(await auctionContract.methods.nftId().call());
    const info = await auctionContract.methods
      .info()
      .call({ from: accounts[0] });
    try {
      const mintNFTContractAddress = await auctionContract.methods.nft().call();
      const mintNFTContract = new web3.eth.Contract(
        mintNFTContractJson.abi,
        mintNFTContractAddress
      );
      const metadataURI = await mintNFTContract.methods
        .tokenURI(tokenId)
        .call();

      let nftMetadata;

      if (cache[metadataURI]) {
        nftMetadata = cache[metadataURI];
      } else {
        nftMetadata = (
          await axios.get(metadataURI, {
            headers: {
              Accept: "text/plain",
            },
          })
        ).data;
        cache[metadataURI] = nftMetadata;
      }

      const nftMetadataJSON = JSON.parse(nftMetadata);
      const auction = {
        pinataImageUri: nftMetadataJSON.image,
        pinataMetadata: nftMetadataJSON,
        seller: info[0],
        highestBidder: info[1],
        startAt: parseInt(info[2]),
        duration: parseInt(info[3]),
        endAt: parseInt(info[4]),
        increment: parseInt(info[5]),
        highestBid: parseInt(info[6]),
        nftId: parseInt(info[7]),
        userBidAmount: parseInt(info[8]),
        started: info[9],
        ended: info[10],
        nft: info[11],
        auctionContract: auctionContract,
      };
      auctions.push(auction);
    } catch (e) {
      console.log("Unable to get NFT for auction: " + auctionContractAddress);
      continue;
    }
  }
  return auctions;
}

export function displayInGwei(wei) {
  return wei / 1000000000;
}

export function displayInHours(seconds) {
  // rounded to 2 decimal places
  return Math.round((seconds / 60 / 60) * 100) / 100;
}

export function displayTimestampInHumanReadable(timestamp) {
  if (timestamp === 0) {
    return "Not Started";
  }
  return new Date(timestamp * 1000).toLocaleString();
}

export async function getEthToUsdRate() {
  const response = await fetch(
    "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd"
  );
  const data = await response.json();
  return data.ethereum.usd;
}

export async function getEstimatedNetworkFeeInUSD(web3, estimatedGas) {
  const gasPrice = await web3.eth.getGasPrice();
  const estimatedCostInWei = web3.utils
    .toBN(estimatedGas)
    .mul(web3.utils.toBN(gasPrice));
  const estimatedCostInEther = web3.utils.fromWei(estimatedCostInWei, "ether");
  const ethToUsdRate = await getEthToUsdRate();
  return parseFloat(estimatedCostInEther) * ethToUsdRate;
}
