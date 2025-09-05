"use client";
import Image from "next/image";
import { Icon } from "@iconify/react";
import { ICON } from "../../utils/icon-export";
import Wallet from "../../assets/icons/wallet.svg";
import Verified from "../../assets/icons/verified.svg";
import ReviewsCard from "../../components/cards/ReviewsCard";
import BackButton from "../../ui/BackButton";
import { useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import { useMiniKit } from '@coinbase/onchainkit/minikit';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { Review } from '../../types/review';
import { supabase } from '@/utils/supabase';
import Modal from "../../context/ModalContext";
import GenericPopup from "../../components/popups/generic-popup";
import ReferralPopup from "../../components/popups/referral-link-popup";

interface SuiteContext {
  user?: {
    fid: number;
    username?: string;
    displayName?: string;
    pfpUrl?: string;
    verified_accounts?: Array<{ wallet_address: string }>;
  };
  getSigner?: () => Promise<any>;
  isTestnet?: boolean;
}

interface SellerInfo {
  is_seller: boolean;
  seller_since?: string;
  items_sold?: number;
  items_bought?: number;
  rating?: number;
  is_verified?: boolean;
}

interface FarcasterUser {
  fid: number;
  username: string | undefined;
  displayName: string | undefined;
  pfpUrl: string | undefined;
}

function Profile() {
  const router = useRouter();
  const { context } = useMiniKit() as { context: SuiteContext };
  const [user, setUser] = useState<FarcasterUser | null>(null);
  const [sellerInfo, setSellerInfo] = useState<SellerInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showWalletDropdown, setShowWalletDropdown] = useState(false);
  const [walletError, setWalletError] = useState<string | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const { address, isConnecting, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();

  // Handle wallet connection and user initialization
  useEffect(() => {
    const initializeUserAndWallet = async () => {
      if (!context?.user) {
        console.log('No minikit context user found');
        const storedUser = localStorage.getItem("farcaster_user");
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        } else {
          router.push("/onboarding");
        }
        return;
      }

      // Set user data
      setUser({
        fid: context.user.fid,
        username: context.user.username || "",
        displayName: context.user.displayName || "",
        pfpUrl: context.user.pfpUrl || "",
      });

      // Handle wallet connection if needed
      const verifiedWallet = context.user.verified_accounts?.[0]?.wallet_address;
      if (verifiedWallet && !isConnected && connectors.length > 0) {
        const farcasterConnector = connectors.find(c => c.id === 'farcaster');
        if (farcasterConnector) {
          try {
            await connect({ connector: farcasterConnector });
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to connect wallet';
            console.error('Wallet connection error:', errorMessage);
            setWalletError(errorMessage);
          }
        }
      }
    };

    if (!isConnecting) {
      initializeUserAndWallet();
    }
  }, [context, router, connectors, connect, isConnected, isConnecting]);

  useEffect(() => {
    const loadSellerInfo = async () => {
      if (user?.fid) {
        // Get user info and successful trades count
        const [userResponse, sellerOrdersResponse, buyerOrdersResponse, reviewsResponse] = await Promise.all([
          // Get user info
          supabase
            .from('users')
            .select('is_seller, seller_since, seller_category, seller_email, seller_location, seller_description')
            .eq('farcaster_id', user.fid)
            .single(),
          // Count successful seller orders
          supabase
            .from('orders')
            .select('id', { count: 'exact' })
            .eq('seller_id', user.fid)
            .eq('status', 'completed'),
          // Count successful buyer orders
          supabase
            .from('orders')
            .select('id', { count: 'exact' })
            .eq('buyer_id', user.fid)
            .eq('status', 'completed'),
          // Get reviews for the user
          supabase
            .from('reviews')
            .select(`
              *,
              reviewer:users!reviews_reviewer_id_fkey(farcaster_username, display_name),
              product:products!reviews_product_id_fkey(title)
            `)
            .eq('reviewed_user_id', user.fid)
            .order('created_at', { ascending: false })
        ]);

        if (!userResponse.error && userResponse.data) {
          const totalSuccessfulTrades = (sellerOrdersResponse.count || 0) + (buyerOrdersResponse.count || 0);
          setSellerInfo({
            ...userResponse.data,
            items_sold: sellerOrdersResponse.count || 0,
            items_bought: buyerOrdersResponse.count || 0,
            is_verified: totalSuccessfulTrades >= 6 // Set verified status based on total trades
          });

          if (!reviewsResponse.error && reviewsResponse.data) {
            setReviews(reviewsResponse.data);
          }
        }
      }
      setIsLoading(false);
    };

    loadSellerInfo();
  }, [user?.fid]);

  // Handle clicking outside of dropdown to close it
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowWalletDropdown(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDisconnectWallet = async () => {
    try {
      // Inside a miniapp, users can't disconnect their Farcaster wallet
      if (context?.user) {
        const verifiedWallet = context.user.verified_accounts?.[0]?.wallet_address;
        if (verifiedWallet === address) {
          setShowWalletDropdown(false);
          return;
        }
      }

      // Only disconnect non-Farcaster wallets
      disconnect();
      setShowWalletDropdown(false);
    } catch (error) {
      console.error('Failed to disconnect wallet:', error);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!user && !isLoading && !localStorage.getItem('farcaster_user')) {
    router.push("/onboarding");
    return null;
  }

  return (
    <section className="flex flex-col items-center min-h-screen">
      <div className="w-full max-w-lg flex flex-1 flex-col relative">
        <div className="absolute top-5 left-5 z-10">
          <BackButton className="text-white" />
        </div>
        <div className="bg-primary h-50 flex justify-between items-center p-5 text-white relative">
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowWalletDropdown(!showWalletDropdown);
              }}
              className="flex items-center justify-center rounded-full hover:opacity-80 transition-opacity"
            >
              <Image alt="wallet" src={Wallet} />
            </button>

            {showWalletDropdown && (
              <div className="absolute left-0 mt-2 w-72 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                <div className="p-4 border-b border-gray-100">
                  <h3 className="text-sm font-medium text-gray-900">Farcaster Wallet</h3>
                </div>
                {walletError && (
                  <div className="p-4 text-sm text-red-500 text-center">
                    {walletError}
                  </div>
                )}
                
                {isConnected && address && !walletError ? (
                  <>
                    <div className="p-4">
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Image src={Verified} alt="Verified" width={16} height={16} />
                            <span className="text-sm text-gray-700">Verified Farcaster Wallet</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 p-2 rounded">
                          <span className="font-mono">{`${address.slice(0, 6)}...${address.slice(-4)}`}</span>
                          <button
                            type="button"
                            onClick={async () => {
                              try {
                                await navigator.clipboard.writeText(address);
                                // You might want to show a toast or notification here
                              } catch (error) {
                                console.error('Failed to copy address:', error);
                              }
                            }}
                            className="p-1 hover:text-gray-900 cursor-pointer active:scale-95 transition-transform"
                          >
                            <Icon icon={ICON.COPY} className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </>
                ) : context?.user ? (
                  <div className="p-4">
                    <button
                      type="button"
                      onClick={async (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (connectors.length > 0) {
                          try {
                            // Find the Farcaster connector specifically
                            const farcasterConnector = connectors.find(c => c.id === 'farcaster');
                            if (!farcasterConnector) {
                              setWalletError('Farcaster connector not found');
                              console.error('Farcaster connector not found');
                              return;
                            }
                            console.log('Starting connection with:', farcasterConnector);
                            setShowWalletDropdown(false); // Close dropdown immediately
                            await connect({ connector: farcasterConnector });
                            setWalletError(null);
                            setTimeout(() => {
                              console.log('isConnected:', isConnected, 'address:', address);
                              if (!isConnected || !address) {
                                setWalletError('Farcaster wallet did not connect. Please make sure you are in Warpcast and have a verified wallet.');
                              }
                            }, 1000);
                            console.log('Connected successfully');
                          } catch (error: any) {
                            setWalletError('Connection error: ' + (error?.message || 'Unknown error'));
                            console.error('Detailed connection error:', {
                              message: error.message,
                              name: error.name,
                              details: error.details,
                              stack: error.stack
                            });
                          }
                        } else {
                          setWalletError('No connectors available');
                          console.log('No connectors available');
                        }
                      }}
                      className="w-full px-4 py-2 text-sm text-white bg-primary hover:bg-primary-dark rounded-lg transition-colors"
                    >
                      {isConnecting ? 'Connecting...' : 'Connect Farcaster Wallet'}
                    </button>
                  </div>
                ) : (
                  <div className="p-4 text-sm text-gray-500 text-center">
                    Please open this app in Warpcast to use your Farcaster wallet
                  </div>
                )}
              </div>
            )}
          </div>

          <Modal>
            <Modal.Open opens="share-referral-modal">
              <Icon
                icon={ICON.SHARE}
                fontSize={30}
                className="cursor-pointer"
              />
            </Modal.Open>
            <Modal.Window name="share-referral-modal" showBg={false}>
              <ReferralPopup />
            </Modal.Window>
            <Modal.Window name="referral-link-copied-popup" showBg={false}>
              <GenericPopup
                iconStyle="text-green-600"
                icon={ICON.CHECK_CIRCLE}
                text="Your referal link has been copied"
              />
            </Modal.Window>
          </Modal>

          <div className="absolute rounded-full size-24 border-3 border-white bottom-0 translate-y-1/2">
            <Image
              alt={user?.displayName || "User profile"}
              src={user?.pfpUrl || ""}
              width={96}
              height={96}
              className="w-full h-full object-cover rounded-full"
            />
          </div>
        </div>

        {/*user details */}
        <div className="px-5 py-12 bg-white space-y-3">
          <div className="space-y-1">
            <p className="font-bold text-2xl">{user?.displayName}</p>
          </div>

          <div className="text-xs text-[#5a5a5a] space-y-1">
            <p className="font-bold">BADGES</p>
            <div className="flex items-center gap-x-3">
              {/* <button className="flex items-center justify-center rounded-full py-1 px-4 border border-gray-light font-medium btn">
                Both
              </button> */}
              <button className="flex items-center justify-center gap-x-1 rounded-full py-1 px-3 bg-green-500 font-medium btn text-white border border-green-500">
                <Image alt="wallet" src={Verified} />
                Verified
              </button>
            </div>
          </div>

          <p className="font-bold flex items-center text-xs text-[#5a5a5a] gap-1">
            Summary Stats
            <span className="bg-gray-200 h-[1px] flex-1" />
          </p>

          <div className="grid grid-cols-4 gap-3 sm:gap-4 md:gap-6">
            <div className="bg-[#f4f2f8] rounded-md py-2 px-6 flex flex-col items-center  justify-center gap-[2px]">
              <Icon icon={ICON.PACKAGE} fontSize={26} className="text-orange" />
              <p className="text-[10px] font-medium">
                {sellerInfo?.items_sold || 0}
              </p>
              <p className="text-[7px] text-nowrap">items sold</p>
            </div>
            <div className="bg-[#f4f2f8] rounded-md py-2 px-6 flex flex-col items-center  justify-center gap-[2px]">
              <Icon icon={ICON.BUY} fontSize={26} className="text-green-500" />
              <p className="text-[10px] font-medium">
                {sellerInfo?.items_bought || 0}
              </p>
              <p className="text-[7px] text-nowrap">items Bought</p>
            </div>
            <div className="bg-[#f4f2f8] rounded-md py-2 px-6 flex flex-col items-center  justify-center gap-[2px]">
              <Icon
                icon={ICON.STAR_ROUNDED}
                fontSize={26}
                className="text-yellow-500"
              />
              <p className="text-[10px] font-medium">
                {sellerInfo?.rating || 0}
              </p>
              <p className="text-[7px]">Rating</p>
            </div>
            <div 
              className="bg-[#f4f2f8] rounded-md py-2 px-6 flex flex-col items-center justify-center gap-[2px] relative group"
              title="Complete 6 successful trades to become verified"
            >
              <Icon
                icon={ICON.VERIFIED}
                fontSize={26}
                className={
                  sellerInfo?.is_verified ? "text-green-500" : "text-gray-400"
                }
              />
              <p className="text-[10px] font-medium">
                {sellerInfo?.is_verified ? "Verified" : "Not"}
              </p>
              <p className="text-[7px]">Trader</p>
              <div className="hidden group-hover:block absolute bottom-full left-1/2 transform -translate-x-1/2 bg-black text-white text-xs rounded py-1 px-2 mb-2 whitespace-nowrap">
                {sellerInfo?.is_verified 
                  ? "Verified trader (6+ successful trades)"
                  : `${((sellerInfo?.items_sold || 0) + (sellerInfo?.items_bought || 0))} / 6 trades completed`}
              </div>
            </div>
          </div>

          <p className="font-bold flex items-center text-xs text-[#5a5a5a] gap-1 mb-5">
            Reviews ({reviews.length})
            <span className="bg-gray-200 h-[1px] flex-1" />
          </p>

          {/*reviews */}
          <ul className="text-[#5a5a5a] space-y-5">
            {reviews.map((review) => (
              <ReviewsCard key={review.id} review={review} />
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

export default Profile;
