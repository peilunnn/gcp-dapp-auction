## Setup Instructions

You will be using the Truffle suite for Ethereum, using Ganache to run a local blockchain. The frontend uses React, and the React Truffle box to interact with deployed smart contracts on the Ethereum blockchain.

## Install Truffle Suite
You must first install Node.js >= v14.0.0 and npm >= 6.12.0

1. Install Truffle and Ganache globally

   `npm i -g truffle ganache`

2. Install the [MetaMask chrome extension](https://metamask.io/download/)

3. [Optional] Download Ganache Desktop which makes it easier to copy private keys to import accounts to MetaMask
   
4. Check the port that Ganache is running on (7545 if Ganache Desktop or 8545 if Ganache CLI, by default)
   
   ```
   ganache-cli --defaultBalanceEther 10 --networkId 1337 
   ```

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
   npm run dev
   ```

4. In another terminal, seed the app with dummy auctions
   ```
   cd truffle/scripts
   truffle exec seed.js
   ```

   If you don't see any auctions, refresh the page

## Play Around with the App
### As a Buyer
1. At the top right, connect to Metamask and make sure you use the correct account that is tied to your local Ganache blockchain. It should have 2000 ETH

2. Click Open on any of the auctions. Find one that is in progress (Auction Started Yes but Auction Ended No) and submit your bid. It must be higher than the current highest bid.

### As a Seller
1. Upload an image, fill in the name and description, and click `Upload`. Confirm the Metamask transaction.

2. Copy the NFT Address and NFT Token ID, and click `Create New Auction`. Follow the steps and once you're finished, confirm the Metamask transaction.

3. You should see details of your newly created auction under `Your Latest Auction`. Clicking `Go to Auction` will bring you to the NFT image and more auction details.

4. Using the same NFT Address and NFT Token ID, fill in the `Approve Auction Contract to Own NFT` section and click `Approve`. Confirm the Metamask transaction.

## Smart Contract Design

### Auction

### User Flow

1. NFT seller starts an auction
   1. User first deploys the auction contract
   2. User approves the auction contract to transfer his NFT from the ERC721 contract
   3. User starts the auction via `start()` function, and supplies:
      1. NFT address
      2. NFT ID
      3. Starting bid
      4. Bid increment limit
      5. Duration of auction
2. User joins the auction
   1. User views the auction details by calling `info()`
   2. User participates in the auction by calling `bid()`, and supplies:
      1. Bid amount
         1. Which must be higher than the existing bid
         2. For the second bid onwards, the amount is treated as a bid increment, and must be higher than the increment limit
   3. User can only withdraw bid amount if he is not the highest bidder
3. NFT seller ends the auction
   1. User views the auction details by calling `info()`
   2. User ends the auction by calling `end()`
      1. If the timer has not yet run out, the function will revert
      2. If the timer has run out, the function will transfer the NFT to the highest bidder, and transfer the funds to the NFT seller
4. Auction participants who are not the highest bidder can withdraw their bid amount
   1. User views the auction details by calling `info()`
   2. User withdraws the bid amount by calling `withdraw()`

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

- @dev Wrappers over Solidity's arithmetic operations.
- NOTE: `SafeMath` is generally not needed starting with Solidity 0.8, since the compiler now has built in overflow checking.

Our auction contract uses Solidity 0.8.0, which has built-in overflow checking. Therefore, we do not need to use the SafeMath library.