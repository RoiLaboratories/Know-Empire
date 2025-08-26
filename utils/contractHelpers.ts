import { BaseError, parseUnits, createWalletClient, custom } from "viem";
import { ESCROW_CONTRACT_ADDRESS, USDC_CONTRACT_ADDRESS, USDC_DECIMALS } from "./constants";
import { base } from "viem/chains";
import { escrowABI, usdcABI } from "./contractABIs";
import { createPublicClient, http } from "viem";
import { getAccount } from "wagmi/actions";
import { config } from "../providers/wagmi";

// Initialize public client
const publicClient = createPublicClient({
  chain: base,
  transport: http('https://mainnet.base.org')
});

async function getViemWalletClient() {
  if (typeof window === 'undefined') throw new Error('Not in browser environment');
  if (!window.ethereum) throw new Error('No ethereum provider found');
  
  const account = getAccount(config);
  if (!account?.address) throw new Error('No account connected');

  return createWalletClient({
    account: account.address,
    chain: base,
    transport: custom(window.ethereum)
  });
}

export async function approveUSDC(amount: string) {
  try {
    const walletClient = await getViemWalletClient();

    // Convert amount to USDC decimals
    const usdcAmount = parseUnits(amount, USDC_DECIMALS);

    // Approve USDC spending
    const hash = await walletClient.writeContract({
      address: USDC_CONTRACT_ADDRESS,
      abi: usdcABI,
      functionName: 'approve',
      args: [ESCROW_CONTRACT_ADDRESS, usdcAmount],
    });

    await publicClient.waitForTransactionReceipt({ hash });

    return true;
  } catch (error) {
    if (error instanceof BaseError) {
      throw new Error(`Failed to approve USDC: ${error.shortMessage}`);
    }
    throw error;
  }
}

export async function createEscrow(seller: string, amount: string, orderId: string) {
  try {
    const walletClient = await getViemWalletClient();

    // Convert amount to USDC decimals
    const usdcAmount = parseUnits(amount, USDC_DECIMALS);

    // Create escrow
    const hash = await walletClient.writeContract({
      address: ESCROW_CONTRACT_ADDRESS,
      abi: escrowABI,
      functionName: 'createEscrow',
      args: [seller, usdcAmount, orderId],
    });

    const receipt = await publicClient.waitForTransactionReceipt({ hash });

    // Find the EscrowCreated event
    const escrowEvent = receipt.logs.find(
      log => log.address.toLowerCase() === ESCROW_CONTRACT_ADDRESS.toLowerCase()
    );

    if (!escrowEvent) throw new Error("Escrow creation event not found");

    return { 
      hash,
      escrowId: escrowEvent.topics[1] // The escrowId is the first indexed parameter
    };
  } catch (error) {
    if (error instanceof BaseError) {
      throw new Error(`Failed to create escrow: ${error.shortMessage}`);
    }
    throw error;
  }
}

export async function confirmDelivery(escrowId: string) {
  try {
    const walletClient = await getViemWalletClient();

    const hash = await walletClient.writeContract({
      address: ESCROW_CONTRACT_ADDRESS,
      abi: escrowABI,
      functionName: 'confirmDelivery',
      args: [escrowId],
    });

    await publicClient.waitForTransactionReceipt({ hash });

    return hash;
  } catch (error) {
    if (error instanceof BaseError) {
      throw new Error(`Failed to confirm delivery: ${error.shortMessage}`);
    }
    throw error;
  }
}

export async function initiateDispute(escrowId: string) {
  try {
    const walletClient = await getViemWalletClient();

    const hash = await walletClient.writeContract({
      address: ESCROW_CONTRACT_ADDRESS,
      abi: escrowABI,
      functionName: 'initiateDispute',
      args: [escrowId],
    });

    await publicClient.waitForTransactionReceipt({ hash });

    return hash;
  } catch (error) {
    if (error instanceof BaseError) {
      throw new Error(`Failed to initiate dispute: ${error.shortMessage}`);
    }
    throw error;
  }
}

export async function confirmDeliveryBySeller(escrowId: string) {
  try {
    const walletClient = await getViemWalletClient();

    const hash = await walletClient.writeContract({
      address: ESCROW_CONTRACT_ADDRESS,
      abi: escrowABI,
      functionName: 'confirmDeliveryBySeller',
      args: [escrowId],
    });

    await publicClient.waitForTransactionReceipt({ hash });

    return hash;
  } catch (error) {
    if (error instanceof BaseError) {
      throw new Error(`Failed to confirm delivery by seller: ${error.shortMessage}`);
    }
    throw error;
  }
}

export async function isEligibleForAutoRelease(escrowId: string) {
  try {
    const isEligible = await publicClient.readContract({
      address: ESCROW_CONTRACT_ADDRESS,
      abi: escrowABI,
      functionName: 'isEligibleForAutoRelease',
      args: [escrowId],
    });

    return isEligible;
  } catch (error) {
    if (error instanceof BaseError) {
      throw new Error(`Failed to check auto-release eligibility: ${error.shortMessage}`);
    }
    throw error;
  }
}

export async function checkAndAutoRelease(escrowId: string) {
  try {
    const walletClient = await getViemWalletClient();

    const hash = await walletClient.writeContract({
      address: ESCROW_CONTRACT_ADDRESS,
      abi: escrowABI,
      functionName: 'checkAndAutoRelease',
      args: [escrowId],
    });

    await publicClient.waitForTransactionReceipt({ hash });

    return hash;
  } catch (error) {
    if (error instanceof BaseError) {
      throw new Error(`Failed to auto-release escrow: ${error.shortMessage}`);
    }
    throw error;
  }
}
