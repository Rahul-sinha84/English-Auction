// SPDX-License-Identifier: MIT
pragma solidity <=0.8.4;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract MyNFT is ERC721, ERC721Enumerable, Ownable {
    using Counters for Counters.Counter;

    Counters.Counter private _tokenIdCounter;

    constructor() ERC721("MyNFT", "MFT") {}

    mapping(uint256 => NFTs) public allNfts;

    struct NFTs {
        uint256 id;
        string url;
    }

    function getTokenById(uint256 _tokenId)
        public
        view
        returns (uint256 id, string memory url)
    {
        NFTs memory _nft = allNfts[_tokenId];
        id = _nft.id;
        url = _nft.url;
    }

    function safeMint(address to, string memory _url) public {
        uint256 tokenId = _tokenIdCounter.current();
        NFTs memory _nft = NFTs(tokenId, _url);
        allNfts[tokenId] = _nft;
        _tokenIdCounter.increment();

        _safeMint(to, tokenId);
    }

    // The following functions are overrides required by Solidity.

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId
    ) internal override(ERC721, ERC721Enumerable) {
        super._beforeTokenTransfer(from, to, tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
