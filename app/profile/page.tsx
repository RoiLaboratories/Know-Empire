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
  const [user, setUser] = useState<FarcasterUser | null>(null);
  const [sellerInfo, setSellerInfo] = useState<SellerInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showWalletDropdown, setShowWalletDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [walletConnection, setWalletConnection] = useState<WalletConnection | null>(null);
  const { login, authenticated, ready, user: privyUser } = usePrivy();

  // Get user data from context or localStorage
  useEffect(() => {
    if (context?.user) {
      setUser({
        fid: context.user.fid,
        username: context.user.username || "",
        displayName: context.user.displayName || "",
        pfpUrl: context.user.pfpUrl || ""
      });
    } else {
      const storedUser = localStorage.getItem('farcaster_user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      } else {
        router.push('/onboarding');
      }
    }
  }, [context, router]);

  useEffect(() => {
    const loadSellerInfo = async () => {
      if (user?.fid) {
        // Only check for seller info in Supabase
        const { data, error } = await supabase
          .from('sellers')
          .select('*')
          .eq('fid', user.fid)
          .single();

        if (!error) {
          setSellerInfo(data);
        }
      }
      setIsLoading(false);
    };

    loadSellerInfo();
  }, [user?.fid]);

  // Handle clicking outside of dropdown to close it
  useEffect(() => {
    if (!ready) return;

    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowWalletDropdown(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [ready]);

  // Handle wallet connection and network check
  useEffect(() => {
    if (!ready || !privyUser?.wallet) {
      setWalletConnection(null);
      return;
    }
    
    if (privyUser.wallet.address) {
      const chainId = typeof privyUser.wallet.chainId === 'string' ? 
        parseInt(privyUser.wallet.chainId) : 
        privyUser.wallet.chainId;

      setWalletConnection({
        address: privyUser.wallet.address,
        chainId: chainId,
        connector: 'privy'
      });
    }
  }, [ready, privyUser?.wallet]);

  const handleWalletConnect = async () => {
    try {
      await login();
      setShowWalletDropdown(false);
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    }
  };

  const handleSwitchNetwork = async () => {
    try {
      const baseChainId = '0x2105'; // 8453 in hex

      try {
        // Try switching first using Privy's switchChain
        if (privyUser?.wallet?.switchChain) {
          await privyUser.wallet.switchChain(8453);
          return;
        }

        // Fallback to window.ethereum if Privy's switchChain is not available
        if (!window.ethereum) {
          throw new Error('No provider available');
        }

        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: baseChainId }],
        });
      } catch (switchError: any) {
        // This error code indicates that the chain has not been added to MetaMask.
        if (switchError.code === 4902 || switchError.message?.includes('Unrecognized chain ID')) {
          if (!window.ethereum) {
            throw new Error('No provider available');
          }

          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: baseChainId,
              chainName: 'Base Mainnet',
              nativeCurrency: {
                name: 'ETH',
                symbol: 'ETH',
                decimals: 18
              },
              rpcUrls: ['https://mainnet.base.org'],
              blockExplorerUrls: ['https://basescan.org']
            }]
          });
        } else {
          throw switchError;
        }
      }

      // Update wallet connection state with new chain
      if (walletConnection) {
        setWalletConnection({
          ...walletConnection,
          chainId: 8453
        });
      }
    } catch (error) {
      console.error('Failed to switch network:', error);
      throw error;
    }
  };

  const handleDisconnectWallet = async () => {
    try {
      // Try Privy disconnect if available
      if (privyUser?.wallet?.disconnect) {
        await privyUser.wallet.disconnect();
      }
      
      // Clear the wallet connection state regardless
      setWalletConnection(null);
      
      // Close the dropdown
      setShowWalletDropdown(false);
    } catch (error) {
      // Even if disconnect fails, we should clear the local state
      setWalletConnection(null);
      setShowWalletDropdown(false);
      console.error('Failed to disconnect wallet:', error);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    router.push('/');
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
              onClick={() => setShowWalletDropdown(!showWalletDropdown)}
              className="flex items-center justify-center rounded-full hover:opacity-80 transition-opacity"
            >
              <Image alt="wallet" src={Wallet} />
            </button>

            {showWalletDropdown && (
              <div className="absolute left-0 mt-2 w-72 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                <div className="p-4 border-b border-gray-100">
                  <h3 className="text-sm font-medium text-gray-900">Wallet</h3>
                </div>
                
                {walletConnection ? (
                  <>
                    <div className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className={`w-2 h-2 rounded-full ${walletConnection.chainId === 8453 ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                        <span className="text-sm font-medium text-gray-900">
                          {walletConnection.chainId === 8453 ? 'Connected to Base' : 'Wrong Network'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <span className="font-mono">{`${walletConnection.address.slice(0, 6)}...${walletConnection.address.slice(-4)}`}</span>
                        <button
                          type="button"
                          onClick={async () => {
                            try {
                              await navigator.clipboard.writeText(walletConnection.address);
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
                    {walletConnection.chainId !== 8453 && (
                      <div className="px-4 py-3 bg-yellow-50 border-y border-yellow-100">
                        <button 
                          type="button"
                          onClick={async () => {
                            try {
                              await handleSwitchNetwork();
                            } catch (error) {
                              console.error('Failed to switch network:', error);
                            }
                          }}
                          className="flex items-center gap-2 w-full text-sm text-yellow-700 hover:text-yellow-900 active:text-yellow-800 cursor-pointer"
                        >
                          <Icon icon={ICON.WARNING} className="text-yellow-500 flex-shrink-0" />
                          <span className="flex-1">Switch to Base Network</span>
                        </button>
                      </div>
                    )}
                    <div className="p-4">
                      <button
                        type="button"
                        onClick={async () => {
                          try {
                            await handleDisconnectWallet();
                          } catch (error) {
                            console.error('Failed to disconnect wallet:', error);
                          }
                        }}
                        className="w-full px-4 py-2 text-sm text-white bg-red-500 hover:bg-red-600 active:bg-red-700 rounded-lg transition-colors cursor-pointer"
                      >
                        Disconnect Wallet
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="p-4">
                    <button
                      onClick={handleWalletConnect}
                      className="w-full px-4 py-2 text-sm text-white bg-primary hover:bg-primary-dark rounded-lg transition-colors"
                    >
                      Connect Wallet
                    </button>
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

            <div className="text-sm text-[#5a5a5a] font-medium space-y-1">
              <p>@{user?.username}</p>
              <p>{user?.fid} FID</p>
            </div>
          </div>

          <div className="text-xs text-[#5a5a5a] space-y-1">
            <p className="font-bold">BADGES</p>
            <div className="flex items-center gap-x-3">
              <button className="flex items-center justify-center rounded-full py-1 px-4 border border-gray-light font-medium btn">
                Both
              </button>
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
              <p className="text-[10px] font-medium">{sellerInfo?.items_sold || 0}</p>
              <p className="text-[7px] text-nowrap">items sold</p>
            </div>
            <div className="bg-[#f4f2f8] rounded-md py-2 px-6 flex flex-col items-center  justify-center gap-[2px]">
              <Icon icon={ICON.BUY} fontSize={26} className="text-green-500" />
              <p className="text-[10px] font-medium">{sellerInfo?.items_sold || 0}</p>
              <p className="text-[7px] text-nowrap">items Bought</p>
            </div>
            <div className="bg-[#f4f2f8] rounded-md py-2 px-6 flex flex-col items-center  justify-center gap-[2px]">
              <Icon
                icon={ICON.STAR_ROUNDED}
                fontSize={26}
                className="text-yellow-500"
              />
              <p className="text-[10px] font-medium">{sellerInfo?.rating || 0}</p>
              <p className="text-[7px]">Rating</p>
            </div>
            <div className="bg-[#f4f2f8] rounded-md py-2 px-6 flex flex-col items-center  justify-center gap-[2px]">
              <Icon
                icon={ICON.VERIFIED}
                fontSize={26}
                className={sellerInfo?.is_seller ? "text-green-500" : "text-gray-400"}
              />
              <p className="text-[10px] font-medium">{sellerInfo?.is_seller ? "Verified" : "Not"}</p>
              <p className="text-[7px]">Seller</p>
            </div>
          </div>

          <p className="font-bold flex items-center text-xs text-[#5a5a5a] gap-1 mb-5">
            Reviews (3)
            <span className="bg-gray-200 h-[1px] flex-1" />
          </p>

          {/*reviews */}
          <ul className="text-[#5a5a5a] space-y-5">
            <ReviewsCard />
            <li className="space-y-2">
              <div className="flex justify-between">
                <span className="flex gap-x-1 items-center">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Icon
                      icon={ICON.STAR}
                      key={i}
                    />
                  ))}
                  {Array.from({ length: 2 }).map((_, i) => (
                    <Icon icon={ICON.STAR_EMPTY} key={i} />
                  ))}
                </span>
                <p className="text-xs">12-06-2025</p>
              </div>
              <p className="font-semibold text-sm flex items-center">
                Mike Rodriguez&nbsp;&nbsp;
                <span className="text-[10px] font-light">@mikecollector</span>
              </p>
              <span className="flex items-center justify-center rounded-full px-1 py-[1px] border-[1.5px] w-fit border-gray-light font-medium text-[10px]">
                NFT Sticker Pack
              </span>
              {/*review */}
              <div className="flex items-start gap-5 text-[10px]">
                <p className="text-gray-500">
                  Good transaction overall. Item condition was great. Packaging
                  could be better
                </p>
                <p className="text-nowrap flex items-center gap-x-1 text-green-500">
                  <span>
                    <Icon
                      icon={ICON.ARROW_CHECKED}
                      className="text-green-500"
                    />
                  </span>
                  Verified Purchase
                </p>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}

export default Profile;
