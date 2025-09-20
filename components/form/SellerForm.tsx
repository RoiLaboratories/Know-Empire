"use client";
import { useFormik } from "formik";
import { useContext, useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import { useMiniKit } from '@coinbase/onchainkit/minikit';
import { SELLER_SCHEMA } from "../../schema/seller.schema";
import { ICON } from "../../utils/icon-export";
import FormInput from "./FormInput";
import InputField from "./InputField";
import InputTextArea from "./InputTextArea";
import Button from "../../ui/Button";
import Modal, { ModalContext } from "../../context/ModalContext";
import LoadingCard from "../popups/loading-card";
import SellerCongratsPopup from "../popups/seller-congrats-popup";

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

interface SellerInput {
  category: string;
  email: string;
  location: string;
  description: string;
  walletAddress: string;
}

function SellerForm() {
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

  const formik = useFormik<SellerInput>({
    validationSchema: SELLER_SCHEMA,
    validateOnChange: true,
    validateOnBlur: true,
    initialValues: {
      category: "",
      email: "",
      location: "",
      description: "",
      walletAddress: "",
    },
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

        const response = await fetch('/api/seller', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...values,
            fid: user.fid,
            username: user.username,
            displayName: user.displayName,
            pfpUrl: user.pfpUrl,
            walletAddress: values.walletAddress
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || 'Failed to create seller account');
        }

        await response.json();
        
        // Close loading modal and show congrats
        modalContext?.close();
        modalContext?.open("congrats-modal");
      } catch (error) {
        console.error('Error creating seller account:', error);
        modalContext?.close();
        // Set error message
        setError(error instanceof Error ? error.message : 'Failed to create seller account. Please try again.');
      }
    },
  });

  return (
    <>
      <FormInput
        config={{
          onSubmit: (e) => {
            e.preventDefault();
            formik.handleSubmit();
          },
        }}
      >
        <div className="w-full">
          <InputField
            config={{
              placeholder: "@youremail",
              type: "email",
              name: "email",
              value: formik.values.email,
              onChange: formik.handleChange,
              onBlur: formik.handleBlur,
            }}
            label="Email Address"
            error={Boolean(formik.errors.email && formik.touched.email)}
            errorMessage={formik.errors.email}
          />
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Product Category</label>
            <select
              name="category"
              value={formik.values.category}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="w-full h-[48px] px-4 py-2 text-sm border rounded-[10px] focus:outline-none focus:ring-1 focus:ring-primary bg-white"
            >
              <option value="">Select a category</option>
              <option value="Fashion">Fashion</option>
              <option value="Gadgets">Gadgets</option>
              <option value="Sports">Sports</option>
              <option value="Books">Books</option>
              <option value="Home">Home</option>
            </select>
            {formik.touched.category && formik.errors.category && (
              <p className="mt-1 text-xs text-red-500">{formik.errors.category}</p>
            )}
          </div>
          <InputField
            config={{
              placeholder: "United States",
              type: "text",
              name: "location",
              value: formik.values.location,
              onChange: formik.handleChange,
              onBlur: formik.handleBlur,
            }}
            label="Location/Country"
            error={Boolean(formik.errors.location && formik.touched.location)}
            errorMessage={formik.errors.location}
          />
          {/* <InputField
            config={{
              placeholder: "Select description",
              type: "text",
              name: "description",
              value: formik.values.description,
              onChange: formik.handleChange,
              onBlur: formik.handleBlur,
            }}
            label="Brief Description"
            error={Boolean(
              formik.errors.description && formik.touched.description
            )}
            errorMessage={formik.errors.description}
          /> */}
          <InputTextArea
            config={{
              placeholder: "Tell buyers about yourself and what you sell...",
              name: "description",
              value: formik.values.description,
              onChange: formik.handleChange,
              onBlur: formik.handleBlur,
            }}
            label="Brief Description"
            error={Boolean(
              formik.errors.description && formik.touched.description
            )}
            errorMessage={formik.errors.description}
          />

          <InputField
            config={{
              placeholder: "Your Farcaster wallet address",
              type: "text",
              name: "walletAddress",
              value: formik.values.walletAddress,
              onChange: formik.handleChange,
              onBlur: formik.handleBlur,
            }}
            label="Payment Address*"
            error={Boolean(formik.errors.walletAddress && formik.touched.walletAddress)}
            errorMessage={formik.errors.walletAddress}
          />

          <span className="flex gap-2 mt-1 items-center">
            <Icon
              icon={!acceptedTerms ? ICON.CIRCLE : ICON.CHECK}
              onClick={() => setAcceptedTerms(!acceptedTerms)}
              className="text-primary cursor-pointer
            "
              fontSize={20}
            />
            {/* <input
            type="radio"
            checked={acceptedTerms}
            className="accent-primary size-5 rounded-full"
            onChange={() => setAcceptedTerms(!acceptedTerms)}
          /> */}
            <p className="text-xs font-medium">
              I agree to deliver as promised and understand how escrow works*
            </p>
          </span>

          {/* No need for this as its handled by formik already */}
          {/* <Modal.Open opens="loading-modal">  */}
          {error && (
            <p className="text-red-500 text-sm mt-2 mb-2">{error}</p>
          )}
          <Button
            type="submit"
            variant="primary_gradient"
            size="xs"
            className="text-gray-medium mt-2 disabled:bg-[#989898]"
            disabled={!acceptedTerms || !formik.isValid}
          >
            Create seller account
          </Button>
          {/* </Modal.Open> */}
        </div>
      </FormInput>

      {/* Modal Windows */}
      <Modal.Window name="loading-modal" showBg={false}>
        <LoadingCard message="Creating account..." />
      </Modal.Window>

      <Modal.Window name="congrats-modal" showBg={false}>
        <SellerCongratsPopup />
      </Modal.Window>
    </>
  );
}

export default SellerForm;
