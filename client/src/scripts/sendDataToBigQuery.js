import axios from "axios";

const beNftBidsUrl = process.env.REACT_APP_BE_NFT_BIDS_URL;
const beNftSalesUrl = process.env.REACT_APP_BE_NFT_SALES_URL;

const insertIntoNftBids = async (
  nftTokenId,
  bidderWalletAddress,
  bidAmount
) => {
  try {
    const response = await axios.post(beNftBidsUrl, {
      nftTokenId,
      bidderWalletAddress,
      bidAmount,
    });

    console.log("Row inserted into nft_bids successfully");
    console.log("Response:", response.data);
  } catch (error) {
    console.error("Error inserting row into nft_bids:", error);
  }
};

const insertIntoNftSales = async (
  nftTokenId,
  sellerWalletAddress,
  highestBidderWalletAddress,
  bidAmount
) => {
  try {
    const response = await axios.post(beNftSalesUrl, {
      nftTokenId,
      sellerWalletAddress,
      highestBidderWalletAddress,
      bidAmount,
    });

    console.log("Row inserted into nft_sales successfully");
    console.log("Response:", response.data);
  } catch (error) {
    console.error("Error inserting row into nft_sales:", error);
  }
};

export { insertIntoNftBids, insertIntoNftSales };
