"use client";
import { useFormik } from "formik";
import { useContext, useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import { useMiniKit } from '@coinbase/onchainkit/minikit';
import { BUYER_SCHEMA } from "../../schema/buyer.schema";
import { ICON } from "../../utils/icon-export";
import InputField from "./InputField";
import InputTextArea from "./InputTextArea";
import Button from "../../ui/Button";
import Modal, { ModalContext } from "../../context/ModalContext";
import LoadingCard from "../popups/loading-buyer-card";
import BuyerCongratsPopup from "../popups/buyer-congrats-popup";

interface MiniKitAccount {
  address: string;
  chain: string;
}

interface MiniKitUser {
  fid: number;
  username?: string;
  displayName?: string;
  pfpUrl?: string;
  verified_accounts?: MiniKitAccount[];
}

interface VerifiedAccount {
  address: string;
}

interface FarcasterUser {
  fid: number;
  username?: string;
  displayName?: string;
  pfpUrl?: string;
  verifiedAccounts?: VerifiedAccount[];
}

interface BuyerInput {
  email: string;
  phone_number: string;
  shipping_address: string;
}

export default function BuyerForm(): React.ReactElement {
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const modalContext = useContext(ModalContext);
  const { context } = useMiniKit();
  const [user, setUser] = useState<FarcasterUser | null>(null);

  useEffect(() => {
    if (context?.user) {
      const contextUser = context.user as MiniKitUser;
      const farcasterUser: FarcasterUser = {
        fid: contextUser.fid,
        username: contextUser.username,
        displayName: contextUser.displayName,
        pfpUrl: contextUser.pfpUrl
      };
      setUser(farcasterUser);
    } else {
      const storedUser = localStorage.getItem('farcaster_user');
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser) as FarcasterUser;
        setUser(parsedUser);
      }
    }
  }, [context]);

  const formik = useFormik<BuyerInput>({
    initialValues: {
      email: "",
      phone_number: "",
      shipping_address: "",
    },
    validationSchema: BUYER_SCHEMA,
    onSubmit: async (values) => {
      if (!formik.isValid) {
        return;
      }

      try {
        if (!user) {
          throw new Error('Please make sure you are connected with Farcaster');
        }

        // Open loading modal first
        modalContext?.open("loading-modal");

        const response = await fetch('/api/buyer', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...values,
            fid: user.fid,
            username: user.username,
            displayName: user.displayName,
            pfpUrl: user.pfpUrl
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to create buyer account');
        }

        const result = await response.json();
        
        // Close loading modal and show congrats
        modalContext?.close();
        modalContext?.open("buyer-congrats-modal");
      } catch (error) {
        console.error("Error creating buyer account:", error);
        modalContext?.close();
        setError(error instanceof Error ? error.message : "Failed to create buyer account");
      }
    },
  });

  return (
    <form onSubmit={formik.handleSubmit} className="w-full space-y-4">
      <InputField
        label="Email"
        config={{
          name: "email",
          type: "email",
          placeholder: "Enter your email",
          value: formik.values.email,
          onChange: formik.handleChange,
          onBlur: formik.handleBlur
        }}
        error={!!formik.touched.email && !!formik.errors.email}
        errorMessage={formik.touched.email ? formik.errors.email : undefined}
      />

      <InputField
        label="Phone Number"
        config={{
          name: "phone_number",
          type: "tel",
          placeholder: "Enter your phone number",
          value: formik.values.phone_number,
          onChange: formik.handleChange,
          onBlur: formik.handleBlur
        }}
        error={!!formik.touched.phone_number && !!formik.errors.phone_number}
        errorMessage={formik.touched.phone_number ? formik.errors.phone_number : undefined}
      />

      <InputTextArea
        label="Shipping Address"
        config={{
          name: "shipping_address",
          placeholder: "Enter your shipping address",
          value: formik.values.shipping_address,
          onChange: formik.handleChange,
          onBlur: formik.handleBlur
        }}
        error={!!formik.touched.shipping_address && !!formik.errors.shipping_address}
        errorMessage={formik.touched.shipping_address ? formik.errors.shipping_address : undefined}
      />

      <span className="flex gap-2 mt-1 items-center">
        <Icon
          icon={!acceptedTerms ? ICON.CIRCLE : ICON.CHECK}
          onClick={() => setAcceptedTerms(!acceptedTerms)}
          className="text-primary cursor-pointer"
          fontSize={20}
        />
        <p className="text-xs font-medium">
          I agree to the terms and conditions for purchases and understand how escrow works*
        </p>
      </span>

      {error && (
        <div className="text-red-500 text-sm mt-2">
          {error}
        </div>
      )}

      <Button
        type="submit"
        disabled={!acceptedTerms || !formik.isValid}
        className="w-full"
        onClick={() => {
          if (!formik.isValid) {
            // Show validation errors
            Object.keys(formik.values).forEach(key => {
              formik.setFieldTouched(key);
            });
          }
        }}
      >
        Create Buyer Account
      </Button>

      {modalContext?.openNames.includes("loading-modal") && (
        <Modal>
          <LoadingCard />
        </Modal>
      )}
      {modalContext?.openNames.includes("buyer-congrats-modal") && (
        <Modal>
          <BuyerCongratsPopup />
        </Modal>
      )}
    </form>
  );
}
