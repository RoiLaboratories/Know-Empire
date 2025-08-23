'use client';

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
import { useFarcasterAuth } from '../../hooks/useFarcasterAuth';
import { usePrivy } from '@privy-io/react-auth';
import type { WalletConnection } from '@know-empire/types';
import { supabase } from '@/utils/supabase';
import Modal from "../../context/ModalContext";
import GenericPopup from "../../components/popups/generic-popup";
import ReferralPopup from "../../components/popups/referral-link-popup";

interface SellerInfo {
  is_seller: boolean;
  seller_since?: string;
  items_sold?: number;
  rating?: number;
}

interface FarcasterUser {
  fid: number;
  username: string | undefined;
  displayName: string | undefined;
  pfpUrl: string | undefined;
}

function Profile() {
  const router = useRouter();
  const { context } = useMiniKit();
  const { signOut } = useFarcasterAuth();
  const [user, setUser] = useState<FarcasterUser | null>(null);
  const [sellerInfo, setSellerInfo] = useState<SellerInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showWalletDropdown, setShowWalletDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [walletConnection, setWalletConnection] = useState<WalletConnection | null>(null);
  const { login, authenticated, ready, user: privyUser } = usePrivy();
  const [isWrongNetwork, setIsWrongNetwork] = useState(false);

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

  // Check if connected wallet is on Base network
  useEffect(() => {
    if (privyUser?.wallet?.chainId) {
      const chainId = typeof privyUser.wallet.chainId === 'string' 
        ? parseInt(privyUser.wallet.chainId) 
        : privyUser.wallet.chainId;
      const isBaseNetwork = chainId === 8453 || chainId === 84532; // Base mainnet or testnet
      setIsWrongNetwork(!isBaseNetwork);
      
      // Update wallet connection state
      if (privyUser.wallet.address) {
        setWalletConnection({
          address: privyUser.wallet.address,
          chainId,
          connector: 'privy'
        });
      }
    }
  }, [privyUser]);

  // Get user data from context or localStorage
  useEffect(() => {
    if (context?.user) {
      setUser({
        fid: context.user.fid,
        username: context.user.username || "",
        displayName: context.user.displayName || "",
        pfpUrl: context.user.pfpUrl || ""
      });
      // Get the signer/wallet address
      if ((context as any).signer?.ethereum?.address) {
        // Handled by Privy now
      }
    }
  }, [context]);

  // Get seller info
  useEffect(() => {
    const getSellerInfo = async () => {
      if (!user?.fid) return;

      try {
        const { data, error } = await supabase
          .from('users')
          .select('seller_handle, seller_category, seller_email, seller_location, seller_description, seller_rating, seller_total_sales, is_seller')
          .eq('farcaster_id', user.fid.toString())
          .single();

        if (error) {
          console.error('Error fetching seller info:', error);
          return;
        }

        setSellerInfo(data);
      } catch (error) {
        console.error('Error fetching seller info:', error);
      }
    };

    getSellerInfo();
  }, [user?.fid]);

  const handleSignOut = () => {
    signOut();
    router.push('/onboarding?step=4');
  };

  const handleWalletConnect = async () => {
    try {
      if (!authenticated) {
        await login();
      }
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    }
  };

  const handleDisconnectWallet = async () => {
    try {
      if (privyUser?.wallet?.disconnect) {
        await privyUser.wallet.disconnect();
        setWalletConnection(null);
      }
    } catch (error) {
      console.error('Failed to disconnect wallet:', error);
    }
  };

  const handleSwitchNetwork = async () => {
    try {
      if (privyUser?.wallet?.switchChain) {
        await privyUser.wallet.switchChain(84532); // Base Sepolia testnet
        // The chainId effect hook will handle updating the state
      }
    } catch (error) {
      console.error('Failed to switch network:', error);
    }
  };

  if (!ready || isLoading) {
    return null;
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-primary relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <BackButton className="text-white" />
            <div className="flex items-center gap-4">
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setShowWalletDropdown(!showWalletDropdown)}
                  className="flex items-center gap-2 text-white hover:opacity-80 transition-opacity"
                >
                  <Image src={Wallet} alt="Wallet" width={24} height={24} />
                  <span>{walletConnection ? 'Connected' : 'Connect Wallet'}</span>
                  <Icon icon={ICON.CHEVRON} className={`transform ${showWalletDropdown ? 'rotate-180' : ''}`} />
                </button>

                {showWalletDropdown && (
                  <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                    {walletConnection ? (
                      <>
                        <div className="p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-2 h-2 rounded-full bg-green-500"></div>
                            <span className="text-sm text-black">Connected with Privy</span>
                          </div>
                          <div className="text-xs text-gray-500 break-all">
                            {`${walletConnection.address.slice(0, 6)}...${walletConnection.address.slice(-4)}`}
                          </div>
                        </div>
                        {isWrongNetwork && (
                          <div className="px-4 py-2 border-t border-gray-200">
                            <div className="flex items-center gap-2 text-yellow-500">
                              <Icon icon={ICON.WARNING} />
                              <button 
                                onClick={handleSwitchNetwork}
                                className="text-sm hover:underline"
                              >
                                Switch to Base Network
                              </button>
                            </div>
                          </div>
                        )}
                        <button
                          onClick={handleDisconnectWallet}
                          className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-gray-100 border-t border-gray-200"
                        >
                          Disconnect
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={handleWalletConnect}
                        className="w-full text-left px-4 py-2 text-sm text-black hover:bg-gray-100"
                      >
                        Connect Wallet
                      </button>
                    )}
                  </div>
                )}
              </div>
              <Modal>
                <Modal.Open opens="share-referral-modal">
                  <Icon icon={ICON.SHARE} fontSize={24} className="text-white cursor-pointer hover:opacity-80 transition-opacity" />
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
            </div>
          </div>
        </div>
        {user && (
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2">
            <div className="relative">
              {user.pfpUrl ? (
                <Image
                  src={user.pfpUrl}
                  alt={user.displayName || 'User Profile'}
                  width={96}
                  height={96}
                  className="rounded-full border-4 border-white"
                />
              ) : (
                <div className="w-24 h-24 bg-gray-200 rounded-full border-4 border-white flex items-center justify-center">
                  <Icon icon={ICON.USER} className="w-12 h-12 text-gray-400" />
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-sm p-6 space-y-8">
          {/* User Profile */}
          <div className="flex items-start justify-between pt-8">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-gray-900">{user?.displayName}</h2>
              <div className="space-y-1">
                <p className="text-sm text-gray-500">@{user?.username}</p>
                <p className="text-sm text-gray-500">FID: {user?.fid}</p>
                {sellerInfo?.seller_since && (
                  <p className="text-sm text-gray-500">Seller since {sellerInfo.seller_since}</p>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              {sellerInfo?.is_seller && (
                <div className="flex items-center gap-2 px-3 py-1 bg-green-100 rounded-full">
                  <Image src={Verified} alt="Verified" width={16} height={16} />
                  <span className="text-sm font-medium text-green-700">Verified Seller</span>
                </div>
              )}
            </div>
          </div>

          {/* Summary Stats */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Overview</h3>
            <div className="grid grid-cols-4 gap-4">
              <div className="flex flex-col items-center p-4 bg-gray-50 rounded-lg">
                <Icon icon={ICON.PACKAGE} className="text-2xl text-primary mb-2" />
                <span className="text-sm font-medium text-gray-900">{sellerInfo?.items_sold || 0}</span>
                <span className="text-xs text-gray-500">Items Sold</span>
              </div>
              <div className="flex flex-col items-center p-4 bg-gray-50 rounded-lg">
                <Icon icon={ICON.BUY} className="text-2xl text-green-600 mb-2" />
                <span className="text-sm font-medium text-gray-900">{sellerInfo?.items_sold || 0}</span>
                <span className="text-xs text-gray-500">Items Bought</span>
              </div>
              <div className="flex flex-col items-center p-4 bg-gray-50 rounded-lg">
                <Icon icon={ICON.STAR_ROUNDED} className="text-2xl text-yellow-500 mb-2" />
                <span className="text-sm font-medium text-gray-900">{sellerInfo?.rating || 0}/5</span>
                <span className="text-xs text-gray-500">Rating</span>
              </div>
              <div className="flex flex-col items-center p-4 bg-gray-50 rounded-lg">
                <Icon 
                  icon={ICON.VERIFIED} 
                  className={`text-2xl mb-2 ${sellerInfo?.is_seller ? 'text-green-600' : 'text-gray-400'}`} 
                />
                <span className="text-sm font-medium text-gray-900">{sellerInfo?.is_seller ? 'Verified' : 'Not'}</span>
                <span className="text-xs text-gray-500">Seller Status</span>
              </div>
            </div>
          </div>

          {/* Reviews */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Reviews</h3>
            <ReviewsCard />
            <div className="mt-4 space-y-4">
              <div className="border border-gray-100 rounded-lg p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <Icon key={i} icon={ICON.STAR} className="text-yellow-400" />
                    ))}
                    {Array.from({ length: 2 }).map((_, i) => (
                      <Icon key={i} icon={ICON.STAR_EMPTY} className="text-gray-300" />
                    ))}
                  </div>
                  <span className="text-sm text-gray-500">12-06-2025</span>
                </div>
                <div>
                  <div className="flex items-center gap-2 text-gray-900">
                    <span className="font-medium">Mike Rodriguez</span>
                    <span className="text-sm text-gray-500">@mikecollector</span>
                  </div>
                  <span className="inline-flex items-center mt-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    NFT Sticker Pack
                  </span>
                </div>
                <div className="flex justify-between items-start text-sm">
                  <p className="text-gray-600 flex-1">
                    Good transaction overall. Item condition was great. Packaging could be better
                  </p>
                  <div className="flex items-center gap-1 text-green-600 ml-4">
                    <Icon icon={ICON.ARROW_CHECKED} />
                    <span className="text-xs whitespace-nowrap">Verified Purchase</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Profile;
