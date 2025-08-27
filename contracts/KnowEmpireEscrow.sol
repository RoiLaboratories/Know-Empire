// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title KnowEmpireEscrow
 * @dev Escrow contract for Know Empire marketplace that handles secure transactions between buyers and sellers
 */
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract KnowEmpireEscrow is ReentrancyGuard, Ownable, Pausable {
    // USDC contract on Base
    IERC20 public immutable USDC;
    
    // Platform wallet to receive escrow fees
    address public platformWallet;
    
    // Escrow fee percentage in basis points (default 5% = 500)
    uint256 public escrowFeeBasisPoints = 500;
    
    // Time after which escrow can auto-release (3 days in seconds)
    uint256 public constant AUTO_RELEASE_DELAY = 3 days;

    event PlatformWalletUpdated(address indexed newWallet);
    event EscrowFeeUpdated(uint256 newFeeBasisPoints);
    event DeliveryConfirmedBySeller(bytes32 indexed escrowId, uint256 deliveredAt);
    
    // Escrow states
    enum EscrowState { 
        CREATED,      // Escrow has been created
        FUNDED,       // Buyer has deposited funds
        SHIPPED,      // Seller has marked as shipped/delivered
        CONFIRMED,    // Buyer has confirmed receipt
        REFUNDED,     // Funds have been refunded to buyer
        COMPLETED,    // Funds have been released to seller
        DISPUTED      // Transaction is under dispute
    }

    struct Escrow {
        address buyer;
        address seller;
        uint256 amount;      // Product price in USDC (includes delivery)
        uint256 createdAt;
        uint256 deliveredAt; // Timestamp when seller marks as delivered
        EscrowState state;
        string orderId;      // Reference to off-chain order
        bool isActive;
    }

    // Mapping from escrow ID to Escrow struct
    mapping(bytes32 => Escrow) public escrows;
    
    // Events
    event EscrowCreated(
        bytes32 indexed escrowId,
        address indexed buyer,
        address indexed seller,
        uint256 amount,
        string orderId
    );
    
    event EscrowFunded(bytes32 indexed escrowId, uint256 amount);
    event EscrowConfirmed(bytes32 indexed escrowId);
    event EscrowDisputed(bytes32 indexed escrowId);
    event EscrowRefunded(bytes32 indexed escrowId);
    event EscrowCompleted(bytes32 indexed escrowId);
    event FeeUpdated(uint16 newFee);

    constructor(address _usdc, address _platformWallet) Ownable(msg.sender) {
        require(_usdc != address(0), "Invalid USDC address");
        require(_platformWallet != address(0), "Invalid platform wallet address");
        USDC = IERC20(_usdc);
        platformWallet = _platformWallet;
    }

    /**
     * @dev Updates the platform wallet address
     * @param _newWallet New platform wallet address
     */
    function updatePlatformWallet(address _newWallet) external onlyOwner {
        require(_newWallet != address(0), "Invalid platform wallet address");
        platformWallet = _newWallet;
        emit PlatformWalletUpdated(_newWallet);
    }



    /**
     * @dev Updates the escrow fee percentage
     * @param _newFeeBasisPoints New fee in basis points (1% = 100, 5% = 500)
     */
    function updateEscrowFee(uint256 _newFeeBasisPoints) external onlyOwner {
        require(_newFeeBasisPoints > 0, "Fee must be greater than 0");
        require(_newFeeBasisPoints <= 1000, "Fee cannot exceed 10%");
        escrowFeeBasisPoints = _newFeeBasisPoints;
        emit EscrowFeeUpdated(_newFeeBasisPoints);
    }

    /**
     * @dev Creates a new escrow
     * @param _seller Address of the seller
     * @param _amount Amount to be held in escrow
     * @param _orderId Reference to the off-chain order
     */
    function createEscrow(
        address _seller,
        uint256 _amount,
        string memory _orderId
    ) external whenNotPaused nonReentrant returns (bytes32) {
        require(_seller != address(0), "Invalid seller address");
        require(_amount > 0, "Amount must be greater than 0");
        
        // Transfer USDC from buyer to contract
        require(
            USDC.transferFrom(msg.sender, address(this), _amount),
            "USDC transfer failed"
        );

        // Generate escrow ID
        bytes32 escrowId = keccak256(
            abi.encodePacked(
                block.timestamp,
                msg.sender,
                _seller,
                _amount,
                _orderId
            )
        );

        // Create new escrow
        escrows[escrowId] = Escrow({
            buyer: msg.sender,
            seller: _seller,
            amount: _amount,
            createdAt: block.timestamp,
            deliveredAt: 0,
            state: EscrowState.FUNDED,
            orderId: _orderId,
            isActive: true
        });

        emit EscrowCreated(escrowId, msg.sender, _seller, _amount, _orderId);
        emit EscrowFunded(escrowId, _amount);

        return escrowId;
    }

    /**
     * @dev Confirms delivery and releases funds to seller
     * @param escrowId ID of the escrow
     */
    function confirmDelivery(bytes32 escrowId) external nonReentrant whenNotPaused {
        // Checks
        Escrow storage escrow = escrows[escrowId];
        require(escrow.isActive, "Escrow not found");
        require(escrow.buyer == msg.sender, "Only buyer can confirm");
        require(escrow.state == EscrowState.FUNDED, "Invalid escrow state");

        // Calculate amounts
        uint256 escrowFee = (escrow.amount * escrowFeeBasisPoints) / 10000;
        uint256 sellerAmount = escrow.amount - escrowFee;
        
        // Effects
        escrow.state = EscrowState.COMPLETED;
        escrow.isActive = false;
        
        // Interactions
        require(
            USDC.transfer(escrow.seller, sellerAmount),
            "Transfer to seller failed"
        );
        require(
            USDC.transfer(platformWallet, escrowFee),
            "Fee transfer failed"
        );

        emit EscrowConfirmed(escrowId);
        emit EscrowCompleted(escrowId);
    }

    /**
     * @dev Initiates a dispute for an escrow
     * @param escrowId ID of the escrow
     */
    function initiateDispute(bytes32 escrowId) external {
        Escrow storage escrow = escrows[escrowId];
        require(escrow.isActive, "Escrow not found");
        require(
            msg.sender == escrow.buyer || msg.sender == escrow.seller,
            "Only buyer or seller can dispute"
        );
        require(escrow.state == EscrowState.FUNDED, "Invalid escrow state");

        escrow.state = EscrowState.DISPUTED;
        emit EscrowDisputed(escrowId);
    }

    /**
     * @dev Refunds the buyer (only callable by owner after dispute)
     * @param escrowId ID of the escrow
     */
    function refundBuyer(bytes32 escrowId) external onlyOwner nonReentrant {
        // Checks
        Escrow storage escrow = escrows[escrowId];
        require(escrow.isActive, "Escrow not found");
        require(
            escrow.state == EscrowState.DISPUTED,
            "Escrow must be disputed"
        );

        // Store amount before state changes
        uint256 totalAmount = escrow.amount;
        
        // Effects
        escrow.state = EscrowState.REFUNDED;
        escrow.isActive = false;

        // Interactions
        require(
            USDC.transfer(escrow.buyer, totalAmount),
            "Refund transfer failed"
        );

        emit EscrowRefunded(escrowId);
    }

    /**
     * @dev Called by seller to confirm delivery/shipment
     * @param escrowId ID of the escrow
     */
    function confirmDeliveryBySeller(bytes32 escrowId) external nonReentrant whenNotPaused {
        // Checks
        Escrow storage escrow = escrows[escrowId];
        require(escrow.isActive, "Escrow not found");
        require(escrow.seller == msg.sender, "Only seller can confirm delivery");
        require(escrow.state == EscrowState.FUNDED, "Invalid escrow state");
        
        // Effects
        escrow.state = EscrowState.SHIPPED;
        escrow.deliveredAt = block.timestamp;
        
        emit DeliveryConfirmedBySeller(escrowId, block.timestamp);
    }

    /**
     * @dev Checks if an escrow is eligible for auto-release and releases funds if conditions are met
     * @param escrowId ID of the escrow
     */
    function checkAndAutoRelease(bytes32 escrowId) external nonReentrant {
        // Checks
        Escrow storage escrow = escrows[escrowId];
        require(escrow.isActive, "Escrow not found");
        require(escrow.state == EscrowState.SHIPPED, "Delivery not confirmed by seller");
        require(escrow.deliveredAt > 0, "Delivery timestamp not set");
        require(
            block.timestamp >= escrow.deliveredAt + AUTO_RELEASE_DELAY,
            "Auto-release delay not met"
        );

        // Calculate amounts
        uint256 escrowFee = (escrow.amount * escrowFeeBasisPoints) / 10000;
        uint256 sellerAmount = escrow.amount - escrowFee;
        
        // Effects
        escrow.state = EscrowState.COMPLETED;
        escrow.isActive = false;
        
        // Interactions
        require(
            USDC.transfer(escrow.seller, sellerAmount),
            "Transfer to seller failed"
        );
        require(
            USDC.transfer(platformWallet, escrowFee),
            "Fee transfer failed"
        );

        escrow.state = EscrowState.COMPLETED;
        escrow.isActive = false;

        emit EscrowConfirmed(escrowId);
        emit EscrowCompleted(escrowId);
    }

    /**
     * @dev Returns whether an escrow is eligible for auto-release
     * @param escrowId ID of the escrow
     */
    function isEligibleForAutoRelease(bytes32 escrowId) external view returns (bool) {
        Escrow memory escrow = escrows[escrowId];
        return (
            escrow.isActive &&
            escrow.state == EscrowState.SHIPPED &&
            escrow.deliveredAt > 0 &&
            block.timestamp >= escrow.deliveredAt + AUTO_RELEASE_DELAY
        );
    }

    /**
     * @dev Pauses the contract
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @dev Unpauses the contract
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    /**
     * @dev Gets escrow details
     * @param escrowId ID of the escrow
     */
    function getEscrow(bytes32 escrowId) external view returns (
        address buyer,
        address seller,
        uint256 amount,
        uint256 createdAt,
        EscrowState state,
        string memory orderId,
        bool isActive
    ) {
        Escrow memory escrow = escrows[escrowId];
        return (
            escrow.buyer,
            escrow.seller,
            escrow.amount,
            escrow.createdAt,
            escrow.state,
            escrow.orderId,
            escrow.isActive
        );
    }
}
