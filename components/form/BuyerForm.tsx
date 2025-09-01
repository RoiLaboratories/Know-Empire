"use client";
import React from "react";
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

interface MiniKitUserContext {
  fid: number;
  username?: string;
  displayName?: string;
  pfpUrl?: string;
  verified_accounts?: MiniKitAccount[];
}

interface FarcasterUser {
  fid: number;
  username?: string;
  displayName?: string;
  pfpUrl?: string;
  verifiedAccounts?: Array<{
    address: string;
    chain: string;
  }>;
}

interface BuyerInput {
  email: string;
  phone_number: string;
  shipping_address: string;
}

export default function BuyerForm(): React.ReactElement {
  const [isSuccess, setIsSuccess] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { context } = useMiniKit();
  const modalContext = useContext(ModalContext);
  const [user, setUser] = useState<FarcasterUser | null>(null);

  const userContext = context?.user as MiniKitUserContext | undefined;
  const verifiedAccounts = userContext?.verified_accounts || [];
  const verifiedAddress = verifiedAccounts[0]?.address;

  useEffect(() => {
    if (userContext) {
      // Log the full context for debugging
      console.log('Farcaster Context:', context);
      console.log('User Context:', userContext);
      console.log('Verified Accounts:', verifiedAccounts);

      const farcasterUser: FarcasterUser = {
        fid: userContext.fid,
        username: userContext.username,
        displayName: userContext.displayName,
        pfpUrl: userContext.pfpUrl,
        verifiedAccounts: verifiedAccounts
      };
      setUser(farcasterUser);
    } else {
      // Try to get from localStorage as fallback
      const storedUser = localStorage.getItem('farcaster_user');
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser) as FarcasterUser;
        setUser(parsedUser);
      }
    }
  }, [userContext, context]);

  const formik = useFormik<BuyerInput>({
    initialValues: {
      email: "",
      phone_number: "",
      shipping_address: "",
    },
    validationSchema: BUYER_SCHEMA,
    onSubmit: async (values) => {
      console.log("Form submission started", { 
        values, 
        user, 
        verifiedAddress,
        context: context,
        userContext: userContext,
        verifiedAccounts: verifiedAccounts
      });
      
      // Check if we have the Farcaster context
      if (!context) {
        setError("Please make sure you're accessing this page through Warpcast's in-app browser.");
        console.log("Missing Farcaster context:", { context });
        return;
      }

      // Check if user is connected
      if (!userContext) {
        setError("Please connect your Farcaster account. If already connected, try refreshing the page.");
        console.log("Missing user context:", { userContext, context });
        return;
      }

      // Check for verified accounts
      if (!verifiedAccounts || verifiedAccounts.length === 0) {
        setError("Please verify your wallet in Warpcast before creating a buyer account.");
        console.log("Missing verified accounts:", { verifiedAccounts, userContext });
        return;
      }

      // Check for specific user data
      if (!user || !user.fid) {
        setError("Invalid Farcaster account data. Please refresh and try again.");
        return;
      }

      try {
        // Clear any previous errors
        setError(null);
        // Show loading state
        modalContext?.open("loading-modal");

        const response = await fetch(`/api/buyer?fid=${user.fid}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...values,
            fid: user.fid,
            farcaster_username: user.username,
            display_name: user.displayName,
            avatar_url: user.pfpUrl,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to create buyer account");
        }

        // Close loading modal
        modalContext?.close();
        // Show success modal
        setIsSuccess(true);
        modalContext?.open("buyer-congrats-modal");
      } catch (error) {
        console.error("Error creating buyer account:", error);
        modalContext?.close();
        setError(error instanceof Error ? error.message : "Failed to create buyer account");
      }
    },
  });

  // Debug effect to monitor form state changes
  useEffect(() => {
    console.log('Form State:', {
      acceptedTerms,
      verifiedAddress,
      email: formik.values.email,
      phone: formik.values.phone_number,
      address: formik.values.shipping_address,
      isValid: formik.isValid,
      touched: formik.touched
    });
  }, [acceptedTerms, verifiedAddress, formik.values, formik.isValid, formik.touched]);

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

      {modalContext?.openNames.includes("loading-modal") && <LoadingCard />}
      {modalContext?.openNames.includes("buyer-congrats-modal") && (
        <Modal>
          <BuyerCongratsPopup />
        </Modal>
      )}
    </form>
  );
}
