// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract ArtisanNFT is ERC721URIStorage, AccessControl {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;
    
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant ARTISAN_ROLE = keccak256("ARTISAN_ROLE");
    
    // Mapping from token ID to item metadata
    struct ItemMetadata {
        string description;
        string materials;
        string artisanDetails;
        uint256 creationDate;
        bool isForSale;
        uint256 price;
    }
    
    mapping(uint256 => ItemMetadata) private _itemMetadata;
    mapping(uint256 => address[]) private _provenance;
    
    // Events
    event ArtisanRegistered(address indexed artisan);
    event NFTMinted(uint256 indexed tokenId, address indexed artisan, string description);
    event ItemListed(uint256 indexed tokenId, uint256 price);
    event ItemSold(uint256 indexed tokenId, address indexed seller, address indexed buyer, uint256 price);
    
    constructor() ERC721("Chennai Artisan NFT", "CART") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
    }
    
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721URIStorage, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
    
    function registerArtisan(address artisan) public onlyRole(ADMIN_ROLE) {
        grantRole(ARTISAN_ROLE, artisan);
        emit ArtisanRegistered(artisan);
    }
    
    function mintNFT(
        string memory description,
        string memory materials,
        string memory artisanDetails,
        string memory ipfsLink
    ) public onlyRole(ARTISAN_ROLE) returns (uint256) {
        _tokenIds.increment();
        uint256 newItemId = _tokenIds.current();
        
        _mint(msg.sender, newItemId);
        _setTokenURI(newItemId, ipfsLink);
        
        _itemMetadata[newItemId] = ItemMetadata({
            description: description,
            materials: materials,
            artisanDetails: artisanDetails,
            creationDate: block.timestamp,
            isForSale: false,
            price: 0
        });
        
        _provenance[newItemId].push(msg.sender);
        
        emit NFTMinted(newItemId, msg.sender, description);
        
        return newItemId;
    }
    
    function getItemMetadata(uint256 tokenId) public view returns (
        string memory description,
        string memory materials,
        string memory artisanDetails,
        uint256 creationDate,
        bool forSale,
        uint256 price
    ) {
        require(_exists(tokenId), "Token does not exist");
        ItemMetadata storage metadata = _itemMetadata[tokenId];
        
        return (
            metadata.description,
            metadata.materials,
            metadata.artisanDetails,
            metadata.creationDate,
            metadata.isForSale,
            metadata.price
        );
    }
    
    function listForSale(uint256 tokenId, uint256 price) public {
        require(_isApprovedOrOwner(msg.sender, tokenId), "Not owner nor approved");
        require(price > 0, "Price must be greater than zero");
        
        _itemMetadata[tokenId].isForSale = true;
        _itemMetadata[tokenId].price = price;
        
        emit ItemListed(tokenId, price);
    }
    
    function cancelListing(uint256 tokenId) public {
        require(_isApprovedOrOwner(msg.sender, tokenId), "Not owner nor approved");
        require(_itemMetadata[tokenId].isForSale, "Item not for sale");
        
        _itemMetadata[tokenId].isForSale = false;
        _itemMetadata[tokenId].price = 0;
    }
    
    function purchaseNFT(uint256 tokenId) public payable {
        address owner = ownerOf(tokenId);
        require(msg.sender != owner, "Owner cannot buy own NFT");
        require(_itemMetadata[tokenId].isForSale, "Item not for sale");
        require(msg.value >= _itemMetadata[tokenId].price, "Insufficient funds");
        
        address seller = owner;
        uint256 price = _itemMetadata[tokenId].price;
        
        _itemMetadata[tokenId].isForSale = false;
        _itemMetadata[tokenId].price = 0;
        
        _transfer(seller, msg.sender, tokenId);
        
        // Transfer funds to seller
        (bool success, ) = payable(seller).call{value: msg.value}("");
        require(success, "Transfer failed");
        
        _provenance[tokenId].push(msg.sender);
        
        emit ItemSold(tokenId, seller, msg.sender, price);
    }
    
    function isForSale(uint256 tokenId) public view returns (bool, uint256) {
        require(_exists(tokenId), "Token does not exist");
        return (_itemMetadata[tokenId].isForSale, _itemMetadata[tokenId].price);
    }
    
    function totalSupply() public view returns (uint256) {
        return _tokenIds.current();
    }
    
    function getProvenance(uint256 tokenId) public view returns (address[] memory) {
        require(_exists(tokenId), "Token does not exist");
        return _provenance[tokenId];
    }
    
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId,
        uint256 batchSize
    ) internal override {
        if (from != address(0)) {
            _provenance[tokenId].push(to);
        }
        super._beforeTokenTransfer(from, to, tokenId, batchSize);
    }
}
