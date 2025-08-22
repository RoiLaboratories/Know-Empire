const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("KnowEmpireEscrow", function () {
    let escrow;
    let owner;
    let buyer;
    let seller;
    let addrs;
    let orderId = "TEST-ORDER-001";

    beforeEach(async function () {
        // Get signers
        [owner, buyer, seller, ...addrs] = await ethers.getSigners();

        // Deploy contract
        const KnowEmpireEscrow = await ethers.getContractFactory("KnowEmpireEscrow");
        escrow = await KnowEmpireEscrow.deploy();
        await escrow.deployed();
    });

    describe("Deployment", function () {
        it("Should set the right owner", async function () {
            expect(await escrow.owner()).to.equal(owner.address);
        });

        it("Should set initial marketplace fee to 2.5%", async function () {
            expect(await escrow.marketplaceFee()).to.equal(250);
        });
    });

    describe("Creating Escrow", function () {
        const amount = ethers.utils.parseEther("1.0");

        it("Should create escrow successfully", async function () {
            const tx = await escrow.connect(buyer).createEscrow(
                seller.address,
                amount,
                orderId,
                { value: amount }
            );

            const receipt = await tx.wait();
            const event = receipt.events.find(e => e.event === 'EscrowCreated');
            const escrowId = event.args.escrowId;

            const escrowData = await escrow.getEscrow(escrowId);
            expect(escrowData.buyer).to.equal(buyer.address);
            expect(escrowData.seller).to.equal(seller.address);
            expect(escrowData.isActive).to.be.true;
        });

        it("Should fail if sent amount doesn't match", async function () {
            await expect(
                escrow.connect(buyer).createEscrow(
                    seller.address,
                    amount,
                    orderId,
                    { value: ethers.utils.parseEther("0.5") }
                )
            ).to.be.revertedWith("Incorrect amount sent");
        });
    });

    describe("Confirming Delivery", function () {
        let escrowId;
        const amount = ethers.utils.parseEther("1.0");

        beforeEach(async function () {
            const tx = await escrow.connect(buyer).createEscrow(
                seller.address,
                amount,
                orderId,
                { value: amount }
            );
            const receipt = await tx.wait();
            escrowId = receipt.events.find(e => e.event === 'EscrowCreated').args.escrowId;
        });

        it("Should release funds to seller on confirmation", async function () {
            const initialSellerBalance = await ethers.provider.getBalance(seller.address);
            
            await escrow.connect(buyer).confirmDelivery(escrowId);
            
            const escrowData = await escrow.getEscrow(escrowId);
            expect(escrowData.state).to.equal(4); // COMPLETED
            expect(escrowData.isActive).to.be.false;

            const finalSellerBalance = await ethers.provider.getBalance(seller.address);
            expect(finalSellerBalance.sub(initialSellerBalance)).to.be.above(0);
        });

        it("Should only allow buyer to confirm", async function () {
            await expect(
                escrow.connect(seller).confirmDelivery(escrowId)
            ).to.be.revertedWith("Only buyer can confirm");
        });
    });

    describe("Dispute Resolution", function () {
        let escrowId;
        const amount = ethers.utils.parseEther("1.0");

        beforeEach(async function () {
            const tx = await escrow.connect(buyer).createEscrow(
                seller.address,
                amount,
                orderId,
                { value: amount }
            );
            const receipt = await tx.wait();
            escrowId = receipt.events.find(e => e.event === 'EscrowCreated').args.escrowId;
        });

        it("Should allow buyer to initiate dispute", async function () {
            await escrow.connect(buyer).initiateDispute(escrowId);
            const escrowData = await escrow.getEscrow(escrowId);
            expect(escrowData.state).to.equal(5); // DISPUTED
        });

        it("Should allow seller to initiate dispute", async function () {
            await escrow.connect(seller).initiateDispute(escrowId);
            const escrowData = await escrow.getEscrow(escrowId);
            expect(escrowData.state).to.equal(5); // DISPUTED
        });

        it("Should allow owner to refund buyer after dispute", async function () {
            await escrow.connect(buyer).initiateDispute(escrowId);
            const initialBuyerBalance = await ethers.provider.getBalance(buyer.address);
            
            await escrow.connect(owner).refundBuyer(escrowId);
            
            const escrowData = await escrow.getEscrow(escrowId);
            expect(escrowData.state).to.equal(3); // REFUNDED
            expect(escrowData.isActive).to.be.false;

            const finalBuyerBalance = await ethers.provider.getBalance(buyer.address);
            expect(finalBuyerBalance.sub(initialBuyerBalance)).to.be.above(0);
        });
    });

    describe("Admin Functions", function () {
        it("Should allow owner to update marketplace fee", async function () {
            await escrow.connect(owner).updateMarketplaceFee(300); // 3%
            expect(await escrow.marketplaceFee()).to.equal(300);
        });

        it("Should not allow fee above 10%", async function () {
            await expect(
                escrow.connect(owner).updateMarketplaceFee(1100)
            ).to.be.revertedWith("Fee too high");
        });

        it("Should allow owner to pause contract", async function () {
            await escrow.connect(owner).pause();
            await expect(
                escrow.connect(buyer).createEscrow(
                    seller.address,
                    ethers.utils.parseEther("1.0"),
                    orderId,
                    { value: ethers.utils.parseEther("1.0") }
                )
            ).to.be.revertedWith("Pausable: paused");
        });
    });
});
