// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MintNFT is Ownable, ERC721 {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;
    using Strings for uint256;

    event MintedToken(uint256 tokenId);

    // Optional mapping for token URIs
    mapping(uint256 => string) private _tokenURIs;

    string private _baseURIextended;

    constructor() ERC721("MintNFT", "MintNFT") {}

    /**
     * @dev Sets the base URI for all token IDs.
     * Only the contract owner can set the base URI.
     * @param baseURI_ The base URI to be set.
     */
    function setBaseURI(string memory baseURI_) external onlyOwner {
        _baseURIextended = baseURI_;
    }

    /**
     * @dev Internal function to set the token URI for a given token ID.
     * Reverts if the token ID does not exist.
     * @param tokenId The ID of the token.
     * @param _tokenURI The token URI to be set.
     */
    function _setTokenURI(
        uint256 tokenId,
        string memory _tokenURI
    ) internal virtual {
        require(
            _exists(tokenId),
            "ERC721Metadata: URI set of nonexistent token"
        );
        _tokenURIs[tokenId] = _tokenURI;
    }

    /**
     * @dev Returns the base URI for all token IDs.
     * Override the internal function in ERC721.
     * @return The base URI.
     */
    function _baseURI() internal view virtual override returns (string memory) {
        return _baseURIextended;
    }

    /**
     * @dev Returns the token URI for a given token ID.
     * Reverts if the token ID does not exist.
     * @param tokenId The ID of the token.
     * @return The token URI.
     */
    function tokenURI(
        uint256 tokenId
    ) public view virtual override returns (string memory) {
        require(
            _exists(tokenId),
            "ERC721Metadata: URI query for nonexistent token"
        );

        string memory _tokenURI = _tokenURIs[tokenId];
        string memory base = _baseURI();

        // If there is no base URI, return the token URI
        if (bytes(base).length == 0) {
            return _tokenURI;
        }

        // If both are set, concatenate the baseURI and tokenURI
        if (bytes(_tokenURI).length > 0) {
            return string(abi.encodePacked(base, _tokenURI));
        }

        // If there is a baseURI but no tokenURI, concatenate tokenId to the baseURI
        return string(abi.encodePacked(base, tokenId.toString()));
    }

    /**
     * @dev Mints a new NFT and assigns it to the sender's address.
     * Increments the token ID counter, mints the token, sets its token URI,
     * and returns the new token ID.
     * @param tokenURIInput The token URI to be associated with the new token.
     * @return The new token ID.
     */
    function mint(string memory tokenURIInput) public returns (uint256) {
        _tokenIds.increment();
        uint256 newItemId = _tokenIds.current();
        _safeMint(msg.sender, newItemId);
        _setTokenURI(newItemId, tokenURIInput);
        emit MintedToken(newItemId);
        return newItemId;
    }

    /**
     * @dev Returns the total number of NFTs that have been minted.
     * @return The total supply of NFTs.
     */
    function totalSupply() public view returns (uint256) {
        return _tokenIds.current();
    }
}
