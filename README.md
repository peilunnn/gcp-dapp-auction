Flow
1. When we deploy contracts, artifacts (JSON files) are generated automatically
2. Web3 library converts that JSON file into a native JS Contract object for the FE to call its functions
3. ABI allows web3 library to know what methods and properties there are in the contract

## Setup Instructions

You will be using the Truffle suite for Ethereum, using Ganache to run a local blockchain. The frontend uses React, and the React Truffle box to interact with deployed smart contracts on the Ethereum blockchain.

## Install Truffle Suite
You must first install Node.js >= v14.0.0 and npm >= 6.12.0

1. Install Truffle and Ganache globally

   `npm i -g truffle ganache`

2. Install the [MetaMask chrome extension](https://metamask.io/download/)

3. [Optional] Download Ganache Desktop which makes it easier to copy private keys to import accounts to MetaMask
   
4. Check the port that Ganache is running on (7545 if Ganache Desktop or 8545 if Ganache CLI, by default)
   
   `ganache-cli --defaultBalanceEther 9000000000000000000000`

   Then edit `truffle-config.js` (`networks/development`) to match the port

5. On MetaMask, set up a new wallet or import an existing one
   
   Click on the network selection dropdown at the top right > Add Network > Add a network manually.

   Fill in the network details:

   - Network Name: development
   - New RPC URL: http://127.0.0.1:8545 (if you are using port 8545)
   - Chain ID: 1337 (you can find this from running `ganache-cli`)
   - Currency Symbol: ETH
      
   You have now connected to your local blockchain (localhost:8545) on Ganache
   
1. Import the Ganache account to MetaMask
   
   Click on your account at the top right > Import account
   
   Copy the private key from Ganache (you can find this from running `ganache-cli`, or if you are on Ganache Desktop, `Show Key` in `Accounts` tab)

2. Deploy the smart contracts to the local blockchain. You can double check that the contracts are deployed, in Ganache Desktop > `Contracts` tab
   ```
   cd truffle
   npm ci # install the @openzeppelin/contracts npm dependency
   truffle migrate --network development
   ```

3. Start the React web app
   ```
   cd ..
   cd client
   npm ci
   npm start
   ```

4. In another terminal, seed the app with dummy auctions
   ```
   cd truffle/scripts
   truffle exec seed.js
   ```

   If you don't see any auctions, refresh the page

## Play Around with the App
### As a Buyer
1. At the top right, connect to Metamask and make sure you use the correct account that is tied to your local Ganache blockchain. It should have 9000000000000000000000 ETH

2. Click Open on any of the auctions. Find one that is in progress (Auction Started Yes but Auction Ended No) and submit your bid. It must be higher than the current highest bid.

### As a Seller
1. You should see a `My Auction` as the first auction. This is an auction that has already been created for you. Click Open and end the auction.

If you want to mint your own NFT and create an auction for it, follow the steps below.

## Minting NFT

### Instructions
First you will pin the NFT to IPFS (uploading the image and metadata) using Pinata's REST API, then mint the NFT (creating the NFT on the local Ethereum blockchain with the NFT's unique token id)

1. [Sign up for a Pinata account](https://app.pinata.cloud/signup) and create an API key

2. The scripts require secrets to be filled, so create a `.env` file in `client` with the content of `.env.example` and fill in the secrets. For `PINATA_ENDPOINT`, it will be `https://api.pinata.cloud/pinning/pinFileToIPFS`

3. Find a picture or gif that you like and move it into `client/assets`

4. Open `client/data/metadata.json`. Change the name, description and attributes to your liking. The image link does not matter

5. Edit `runScript.js` in `client/scripts` by editing `imgPath` in line 8 to be:
    
   `const imgPath = path.join(__dirname, "../assets/{your-file-name}.{file-type}");`

6. Execute `runScript.js` from its immediate directory, which will pin your NFT to IPFS
   
   ```
   cd client/scripts
   node runScript.js
   ```

7. To view your pinned NFT, get your IPFS hash from the last entry of `ipfsHash.json` and go to https://gateway.pinata.cloud/ipfs/{your-IPFS-hash}

8. Now you need to mint the NFT on the Ganache `development` local blockchain using the metadata you have just created
```
cd truffle
truffle migrate --network development
npx truffle console --network development
const nft = await MintNFT.deployed() // get the deployed instance of the contract. Returns undefined
nft.address // address where the MintNFT contract is deployed to. Record this down for later

// Once the above are confirmed, you can mint your NFT
let res = await nft.mint('https://gateway.pinata.cloud/ipfs/{your-IPFS-hash}') // the same IPFS hash you used earlier to view your pinned image
let tokenId = res.logs[0].args.tokenId.words[0] // get the token ID of the newly minted NFT. Record this down for later
await nft.ownerOf(tokenId) // should return your metamask address
```

let res = await nft.mint('https://gateway.pinata.cloud/ipfs/QmRD1GLXJhZ1QmiPKfMr6o2joQUYsXTZCkqfuhuyqQVohX') // the same IPFS hash you used earlier to view your pinned image


## Auction Your Minted NFT

1. Now you will use `nft.address` and `tokenId` recorded down from the previous step
   
2. On the website, press `Create Auction`, and fill in the fields
   - NFT Address : nft.address
   - NFT Token Id : tokenId
   - Starting Bid / Increment : as desired

## Smart Contract Design

### Auction

### User Flow

1. NFT seller starts an auction
   1. User first deploys the auction contract
   2. User approves the auction contract to transfer his/her NFT from the ERC721 contract
   3. User starts the auction via `start()` function, and supplies:
      1. NFT address
      2. NFT ID
      3. Starting bid
      4. Bid increment limit
      5. Duration of auction
2. User joins the auction
   1. User views the auction details by calling `info()` function
   2. User participate in the auction by calling `bid()` function, and supplies:
      1. Amount to bid
         1. Which must be higher than the starting/existing bid
         2. For the second bid onwards, the amount is treated as a bid increment, and must be higher than the increment limit
   3. User can only withdraw bid amount if he/she is not the highest bidder
3. NFT seller settles the auction
   1. User views the auction details by calling `info()` function
   2. User settles the auction by calling `end()` function
      1. If the auction is not yet ended, the function will revert
      2. If the auction is ended, the function will transfer the NFT to the highest bidder, and transfer the funds to the NFT seller
4. Auction participants who are not the highest bidder can withdraw their bid amount
   1. User views the auction details by calling `info()` function
   2. User withdraws the bid amount by calling `withdraw()` function

### Prevent Reentrancy Attack

What is a reentrancy attack?

> A reentrancy attack occurs when a function makes an external call to another untrusted contract.
> Then the untrusted contract makes a recursive call back to the original function in an attempt to drain funds.

How to prevent reentrancy attack?

> To prevent a reentrancy attack in a Solidity smart contract, you should:
>
> - Ensure all state changes happen before calling external contracts, i.e., update balances or code internally before calling external code
> - Use function modifiers that prevent reentrancy

Resources:

- [Hack Solidity: Reentrancy Attack](https://hackernoon.com/hack-solidity-reentrancy-attack)
- [Re-Entrancy Attacks. How to avoid smart contract hacks and loss of funds](https://www.youtube.com/watch?v=6bQvKCKrATM)

### Prevent Overflow Bug

Mathematical operations in Solidity are subject to overflow and underflow bugs. These bugs can be exploited to drain funds from a contract.

One possible solution is to use the SafeMath library. However, the SafeMath library is not used in this project as stated in the comment:

> /\*\*
>
> - @dev Wrappers over Solidity's arithmetic operations.
> -
> - NOTE: `SafeMath` is generally not needed starting with Solidity 0.8, since the compiler
> - now has built in overflow checking.
>   \*/

Our auction contract uses Solidity 0.8.0, which has built-in overflow checking. Therefore, we do not need to use the SafeMath library.

## Credits

Images:

- Beeple, Everydays: The First 5000 Days. Sold for: $69.3 million Beeple/Christie’s
- (And all other images used in our client/assets folder)
