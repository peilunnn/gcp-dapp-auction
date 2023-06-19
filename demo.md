ganache-cli --defaultBalanceEther 900000000000000000000

cd truffle
truffle migrate --network development
cd ..
cd client
npm start

cd client/scripts
node runScript.js
cd ..
cd ..
cd truffle
npx truffle console --network development
const nft = await MintNFT.deployed() // get the deployed instance of the contract. Returns undefined
nft.address // address where the MintNFT contract is deployed to. Record this down for later

// Once the above are confirmed, you can mint your NFT
let res = await nft.mint('https://gateway.pinata.cloud/ipfs/Qmb6pV6i784CcH8rY7f1Hmyk536BtzVTRXuWEcWAto93U8') // the same IPFS hash you used earlier to view your pinned image
let tokenId = res.logs[0].args.tokenId.words[0] // get the token ID of the newly minted NFT. Record this down for later
await nft.ownerOf(tokenId) // should return your metamask address

cd truffle/scripts
truffle exec seed.js