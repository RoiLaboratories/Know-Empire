'use client';

import { SignInButton } from '@farcaster/auth-kit';
import Image from 'next/image';
import Farcaster from '../../assets/images/farcaster.png';
import Button from '../../ui/Button';

interface CustomSignInButtonProps {
  onSuccess: () => Promise<void>;
  onError: (error: any) => void;
}

export function CustomSignInButton({ onSuccess, onError }: CustomSignInButtonProps) {
  return (
    <div className="relative">
      <Button 
        variant="primary_gradient"
        size="sm"
        className="flex items-center justify-center gap-2 min-w-[200px]"
      >
        <Image
          alt="farcaster-icon"
          className="w-5 h-5"
          width={20}
          height={20}
          src={Farcaster}
        />
        Sign in with Farcaster
      </Button>
      <div className="absolute inset-0 opacity-0">
        <SignInButton
          onSuccess={onSuccess}
          onError={onError}
        />
      </div>
    </div>
  );
}
