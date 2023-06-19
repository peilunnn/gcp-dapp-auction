// SPDX-License-Identifier: MIT
pragma solidity >=0.7.0 <0.9.0;

import "./Auction.sol";

contract AuctionFactory {
    Auction[] public auctions;
    event ContractCreated(address newContractAddress);

    /**
     * @dev Creates a new auction contract.
     * @param _nft The address where the MintNFT contract is deployed to.
     * @param _nftId The ID of the NFT to be auctioned.
     * @param _startingBid The starting bid amount for the auction.
     * @param _increment The bid increment amount for each bid.
     * @param _duration The duration of the auction in seconds.
     */
    function createNewAuction(
        address _nft,
        uint256 _nftId,
        uint256 _startingBid,
        uint256 _increment,
        uint256 _duration
    ) public {
        Auction auction = new Auction(
            msg.sender,
            IERC721(_nft),
            _nftId,
            _startingBid,
            _increment,
            _duration
        );
        auctions.push(auction);
        emit ContractCreated(address(auction));
    }

    /**
     * @dev Returns an array of all created auction contracts.
     * @return _auctions An array of Auction contracts.
     */
    function getAuctions() external view returns (Auction[] memory _auctions) {
        _auctions = new Auction[](auctions.length);
        for (uint256 i = 0; i < auctions.length; i++) {
            _auctions[i] = auctions[i];
        }
    }
}
