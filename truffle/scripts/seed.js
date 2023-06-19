const AuctionFactory = artifacts.require("AuctionFactory");
const MintNFT = artifacts.require("MintNFT");
const Auction = artifacts.require("Auction");

const ether = (n) => {
  return new web3.utils.BN(web3.utils.toWei(n.toString(), "ether"));
};

const gwei = (n) => {
  return new web3.utils.BN(web3.utils.toWei(n.toString(), "gwei"));
};

module.exports = async function (callback) {
  try {
    // Fetch accounts from wallet - these are unlocked
    const accounts = await web3.eth.getAccounts();

    // Fetch deployed contracts
    const auctionFactory = await AuctionFactory.deployed();
    console.log("AuctionFactory fetched", auctionFactory.address);
    const mintNFT = await MintNFT.deployed();
    console.log("MintNFT fetched", mintNFT.address);

    const demoUsers = [];
    for (let i = 0; i < 7; i++) {
      demoUsers.push({
        account: accounts[i],
      });
    }

    const allDemoNFTs = [
      {
        id: 1,
        ipfsHash:
          "https://gateway.pinata.cloud/ipfs/Qmc5wpRHXxRQTncKRY8iZ1wgRAbGDLjFXKozfXo6yEAQNa",
      },
      {
        id: 2,
        ipfsHash:
          "https://gateway.pinata.cloud/ipfs/QmZCMsEfAfzbThpXRLxshZAY1T5ag4ntwCDdC7rUpnXfC9",
      },
      {
        id: 3,
        ipfsHash:
          "https://gateway.pinata.cloud/ipfs/Qmcas56WGK3HVJvTYxd82AT5grpJybgdqeYNnYQFCKyERj",
      },
      {
        id: 4,
        ipfsHash:
          "https://gateway.pinata.cloud/ipfs/Qmc9rrgXhYo8NeTFtTiHYaUiCmBFxe4Cm4S3PYL5Pkka2T",
      },
      {
        id: 5,
        ipfsHash:
          "https://gateway.pinata.cloud/ipfs/QmNeaYuMPzKRvEpCzK25VxEYBJMqBgPa2VdX12m44Jv2DS",
      },
      {
        id: 6,
        ipfsHash:
          "https://gateway.pinata.cloud/ipfs/Qma1fz2F2zGacLsTvaKzYQfqweQeJWZ63q99ZvLeC65itg",
      },
      {
        id: 7,
        ipfsHash:
          "https://gateway.pinata.cloud/ipfs/Qma6Zw6gMJfC55u1Vfna9b8wm49KHs6nz6KWbfCQZx1Yrp",
      },
      {
        id: 8,
        ipfsHash:
          "https://gateway.pinata.cloud/ipfs/QmQLdBJZv6p9GrQoNthkPBzy1hwujUADvSnC6fmDYDbap1",
      },
      {
        id: 9,
        ipfsHash:
          "https://gateway.pinata.cloud/ipfs/QmRhaCLBpGuhwXWVuRvv18G9aoj231SG2N2jCdHTN3b7Gj",
      },
      {
        id: 10,
        ipfsHash:
          "https://gateway.pinata.cloud/ipfs/QmZ5YDGxnAjtHB6apV2wAiRUAcAXeNsNfsaSHPjosGnTZT",
      },
    ];

    for (let i = 0; i < demoUsers.length; i++) {
      const user = demoUsers[i];
      const nft = allDemoNFTs[i];
      const res = await mintNFT.mint(nft.ipfsHash, { from: user.account });
      const tokenId = res.receipt.logs[0].args.tokenId.words[0];
      demoUsers[i].tokenId = tokenId;
    }

    for (let i = 0; i < demoUsers.length; i++) {
      const user = demoUsers[i];
      let duration;
      switch (i) {
        case 0:
          duration = 60;
          break;
        case 2:
          duration = 120;
          break;
        case 4:
          duration = 180;
          break;
        default:
          duration = Math.floor(Math.random() * 1440) + 1;
      }
      const auction = await auctionFactory.createNewAuction(
        mintNFT.address,
        user.tokenId,
        gwei(1000000000 + 10000000 * i),
        gwei(10000000 + 10000000 * i),
        duration, // set a random duration between 1 minute and 24 hours
        { from: user.account }
      );
      user.auctionAddress = auction.logs[0].args.newContractAddress;
    }

    // Each user approves the auction factory to spend their NFT
    for (let i = 0; i < demoUsers.length; i++) {
      const user = demoUsers[i];
      await mintNFT.approve(user.auctionAddress, user.tokenId, {
        from: user.account,
      });
    }

    // Start half of the auctions
    for (let i = 0; i < demoUsers.length; i++) {
      const user = demoUsers[i];
      if (i % 2 === 0) {
        const auction = await Auction.at(user.auctionAddress);
        await auction.start({ from: user.account });
      }
    }

    console.log("These are the demo users:\n");
    console.log(demoUsers);
  } catch (error) {
    console.log(error);
  }
  callback();
};
