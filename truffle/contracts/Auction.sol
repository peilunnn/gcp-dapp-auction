// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

interface IERC721 {
    function transfer(address, uint256) external;

    function transferFrom(address, address, uint256) external;
}

contract Auction is ReentrancyGuard {
    event Start();
    event End(address highestBidder, uint256 highestBid);
    event Bid(address indexed sender, uint256 amount);
    event Withdraw(address indexed bidder, uint256 amount);

    address payable public immutable seller;

    bool public started;
    bool public ended;

    uint256 public startAt;
    uint256 public duration;
    uint256 public endAt;
    uint256 public increment;

    IERC721 public nft; // address of the NFT
    uint256 public nftId;

    uint256 public highestBid;
    address public highestBidder;
    mapping(address => uint256) public bids;

    constructor(
        address sender, // metamask address of the seller who created auction
        IERC721 _nft, // nft token object
        uint256 _nftId, // nft token id
        uint256 _startingBid,
        uint256 _increment,
        uint256 _duration
    ) {
        require(_startingBid > 0, "Starting bid must be greater than 0!");
        require(_increment > 0, "Increment must be greater than 0!");
        require(_duration > 0, "Duration must be greater than 0!");
        seller = payable(sender);
        highestBid = _startingBid;
        increment = _increment;
        duration = _duration;

        nft = _nft;
        nftId = _nftId;
        duration = _duration;
    }

    /**
     * @dev Starts the auction.
     * Only the seller can start the auction, and the auction must not have already started.
     * Transfers ownership of the NFT to the auction contract and sets the start and end timestamps.
     */
    function start() external {
        require(!started, "Auction already started!");
        require(msg.sender == seller, "You are not the owner of this auction!");

        nft.transferFrom(msg.sender, address(this), nftId);
        started = true;
        startAt = block.timestamp;
        endAt = startAt + duration;

        emit Start();
    }

    /**
     * @dev Returns the current highest bid amount.
     * @return The highest bid amount.
     */
    function getPrice() public view returns (uint256) {
        return highestBid;
    }

    /**
     * @dev Returns information about the auction.
     * @return seller The address of the seller who created the auction.
     * @return highestBidder The address of the current highest bidder.
     * @return startAt The timestamp when the auction started.
     * @return duration The duration of the auction.
     * @return endAt The timestamp when the auction will end.
     * @return increment The bid increment amount.
     * @return highestBid The highest bid amount.
     * @return nftId The ID of the NFT being auctioned.
     * @return buyerBid The bid amount of a particular buyer.
     * @return started A boolean indicating if the auction has started.
     * @return ended A boolean indicating if the auction has ended.
     * @return nftAddress The address where the MintNFT contract is deployed to.
     */
    function info()
        public
        view
        returns (
            address,
            address,
            uint256,
            uint256,
            uint256,
            uint256,
            uint256,
            uint256,
            uint256,
            bool,
            bool,
            address
        )
    {
        return (
            seller,
            highestBidder,
            startAt,
            duration,
            endAt,
            increment,
            highestBid,
            nftId,
            bids[msg.sender],
            started,
            ended,
            address(nft)
        );
    }

    /**
     * @dev Allows buyers to place bids for an auction.
     * Bids can only be placed if the auction has started, has not ended,
     * the current time is before the auction end time, and the bidder is not the seller.
     * The bid amount must be higher than the previous highest bid, or the first bid must meet the minimum bid increment.
     * Updates the highest bid and bidder.
     * Emits the Bid event.
     */
    function bid() external payable {
        require(started, "Auction not started!");
        require(!ended, "Auction ended!");
        require(block.timestamp < endAt, "Auction ended!");
        require(msg.sender != seller, "You are the seller!");

        // This check only applies to subsequent bids ie. bids after the first offer
        if (highestBidder != address(0)) {
            require(
                msg.value >= increment,
                "Insufficient bid amount increment!"
            );
        }
        require(
            msg.value + bids[msg.sender] > highestBid,
            "Bid must be greater than highest bid!"
        );

        highestBid = msg.value + bids[msg.sender];
        bids[msg.sender] = highestBid;
        highestBidder = msg.sender;

        emit Bid(highestBidder, highestBid);
    }

    /**
     * @dev Allows bidders (excluding the highest bidder) to withdraw their bids if they were outbid.
     * The auction must have started, and the caller must have a non-zero bid balance.
     * Sets the bidder's bid balance to zero and transfers the bid amount back to the bidder.
     * Emits the Withdraw event.
     */
    function withdraw() external payable nonReentrant {
        require(started, "Auction not started!");
        require(msg.sender != highestBidder, "Highest bidder cannot withdraw.");
        uint256 bal = bids[msg.sender];
        require(bal > 0, "No balance to withdraw.");

        // This is where we prevent reentrancy attack - ensure all state changes before calling external contracts
        bids[msg.sender] = 0;

        (bool sent, ) = payable(msg.sender).call{value: bal}("");
        require(sent, "Could not withdraw");

        emit Withdraw(msg.sender, bal);
    }

    /**
     * @dev Ends the auction.
     * If there was a highest bidder, transfers the NFT to the highest bidder and sends the bid amount to the seller.
     * If there was no bidder, transfers the NFT back to the seller.
     * Emits the End event.
     */
    function end() external nonReentrant {
        require(started, "You need to start first!");
        require(block.timestamp >= endAt, "Auction is still ongoing!");
        require(!ended, "Auction already ended!");

        // This is where we prevent reentrancy attack - ensure all state changes before calling external contracts
        ended = true;

        // If there was a bid
        if (highestBidder != address(0)) {
            nft.transferFrom(address(this), highestBidder, nftId);
            (bool sent, ) = seller.call{value: highestBid}("");
            require(sent, "Could not pay seller!");
        } else {
            nft.transferFrom(address(this), seller, nftId);
        }

        emit End(highestBidder, highestBid);
    }
}
