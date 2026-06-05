// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract Agrowchain {
    address public admin;
    uint256 public batchCount;

    // --- DECENTRALIZED REPUTATION SYSTEM ---
    mapping(address => uint256) public trustScore;

    struct Batch {
        uint256 id;
        string cropName;
        string origin;
        string quality;
        uint256 price; // Price in Wei
        string status;
        address payable farmer;
        address payable distributor;
        address payable retailer;
        string imageHash;
        bool isFunded; // ESCROW TRACKER
    }

    mapping(uint256 => Batch) public batches;
    mapping(address => bool) public farmers;
    mapping(address => bool) public distributors;
    mapping(address => bool) public retailers;

    event BatchCreated(uint256 id, string cropName, address farmer, uint256 price);
    event BatchStatusUpdated(uint256 id, string status);
    event FundsLockedInEscrow(uint256 id, address retailer, uint256 amount);
    event DeliveryCompleted(uint256 id, address farmer, uint256 payout, uint256 newTrustScore);

    constructor() {
        admin = msg.sender;
    }

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can register users");
        _;
    }

    // Role Registration
    function addFarmer(address _farmer) public onlyAdmin { farmers[_farmer] = true; }
    function addDistributor(address _distributor) public onlyAdmin { distributors[_distributor] = true; }
    function addRetailer(address _retailer) public onlyAdmin { retailers[_retailer] = true; }

    function createBatch(string memory _cropName, string memory _origin, string memory _quality, uint256 _price, string memory _imageHash) public {
        require(farmers[msg.sender], "Only registered farmers can create batches");
        
        batchCount++;
        batches[batchCount] = Batch(
            batchCount, _cropName, _origin, _quality, _price, "Harvested",
            payable(msg.sender), payable(address(0)), payable(address(0)), _imageHash, false
        );

        emit BatchCreated(batchCount, _cropName, msg.sender, _price);
    }

    function orderBatch(uint256 _id) public payable {
        require(retailers[msg.sender], "Only registered retailers can order");
        require(_id > 0 && _id <= batchCount, "Invalid Batch ID");
        Batch storage batch = batches[_id];
        require(!batch.isFunded, "Batch is already funded");
        require(msg.value == batch.price, "Must send exact price to escrow");

        batch.retailer = payable(msg.sender);
        batch.status = "Ordered - Funds in Escrow";
        batch.isFunded = true;

        emit FundsLockedInEscrow(_id, msg.sender, msg.value);
    }

    function updateBatchStatus(uint256 _id, string memory _newStatus) public {
        require(distributors[msg.sender], "Only distributors can update transit status");
        Batch storage batch = batches[_id];
        require(batch.isFunded, "Cannot transport unfunded batches");

        batch.distributor = payable(msg.sender);
        batch.status = _newStatus;
        emit BatchStatusUpdated(_id, _newStatus);
    }

    function completeDelivery(uint256 _id) public {
        require(distributors[msg.sender] || retailers[msg.sender], "Unauthorized");
        Batch storage batch = batches[_id];
        require(batch.isFunded, "No funds in escrow");
        require(keccak256(bytes(batch.status)) != keccak256(bytes("Delivered")), "Already delivered");

        batch.status = "Delivered";
        
        uint256 payout = batch.price;
        batch.isFunded = false; 
        batch.farmer.transfer(payout);

        trustScore[batch.farmer] += 10;

        emit DeliveryCompleted(_id, batch.farmer, payout, trustScore[batch.farmer]);
    }
}