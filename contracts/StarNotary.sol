// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract StarNotary is ERC721 {
    // Star data
    struct Star {
        string name;
    }

    // mapping the Star with the Owner Address
    mapping(uint256 => Star) public tokenIdToStarInfo;

    // mapping the TokenId and price
    mapping(uint256 => uint256) public starsForSale;

    // Initializes the contract by setting a `name` and a `symbol` to the token collection.
    constructor(string memory name_, string memory symbol_)
        ERC721(name_, symbol_)
    {}

    // Create Star using the Struct
    function createStar(string memory _name, uint256 _tokenId) public {
        Star memory newStar = Star(_name);
        tokenIdToStarInfo[_tokenId] = newStar;
        _mint(msg.sender, _tokenId);
    }

    // Putting an Star for sale (Adding the star tokenid into the mapping starsForSale, first verify that the sender is the owner)
    function putStarUpForSale(uint256 _tokenId, uint256 _price) public {
        require(
            ownerOf(_tokenId) == msg.sender,
            "You can't sell the Star you don't own"
        );
        starsForSale[_tokenId] = _price;
    }

    // Buy an Star (Removing the star tokenid from the mapping starsForSale, first verify that the star is up for sale)
    function buyStar(uint256 _tokenId) public payable {
        require(starsForSale[_tokenId] > 0, "The Star should be up for sale");

        uint256 starCost = starsForSale[_tokenId];
        require(msg.value > starCost, "You need to have enough Ether");

        address ownerAddress = ownerOf(_tokenId);
        _transfer(ownerAddress, msg.sender, _tokenId);
        payable(ownerAddress).transfer(starCost);

        if (msg.value > starCost) {
            payable(msg.sender).transfer(msg.value - starCost);
        }

        delete (starsForSale[_tokenId]);
    }

    // Returns the Star name with given tokenId
    function lookUptokenIdToStarInfo(uint256 _tokenId)
        public
        view
        returns (string memory)
    {
        return tokenIdToStarInfo[_tokenId].name;
    }

    // Exchange stars between two addresses (first verify that the sender is the owner of at least one star)
    function exchangeStars(uint256 _tokenId1, uint256 _tokenId2) public {
        address owner1 = ownerOf(_tokenId1);
        address owner2 = ownerOf(_tokenId2);

        require(
            owner1 == msg.sender || owner2 == msg.sender,
            "You can't exchange the Star you don't owned"
        );

        _transfer(owner1, owner2, _tokenId1);
        _transfer(owner2, owner1, _tokenId2);
    }

    // Transfers the ownership of a star to a new address
    function transferStar(address _to, uint256 _tokenId) public {
        require(
            ownerOf(_tokenId) == msg.sender,
            "You can't transfer the Star you don't own"
        );

        transferFrom(msg.sender, _to, _tokenId);
    }
}
