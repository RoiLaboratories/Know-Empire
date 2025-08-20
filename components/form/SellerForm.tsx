"use client";
import { useFormik } from "formik";
import { useContext, useEffect, useState } from "react";
import { SELLER_SCHEMA } from "../../schema/seller.schema";
import FormInput from "./FormInput";
import { supabase } from "../../utils/supabase";

interface SellerInput {
  category: string;
  email: string;
  location: string;
  description: string;
}
import InputField from "./InputField";
import { useMiniKit } from '@coinbase/onchainkit/minikit';
import Button from "../../ui/Button";
import { Icon } from "@iconify/react";
import { ICON } from "../../utils/icon-export";
import Modal, { ModalContext } from "../../context/ModalContext";
import LoadingCard from "../popups/loading-card";
import SellerCongratsPopup from "../popups/seller-congrats-popup";
import InputTextArea from "./InputTextArea";

function SellerForm() {
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const modalContext = useContext(ModalContext);



  const { context } = useMiniKit();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    if (context?.user) {
      setUser(context.user);
    } else {
      const storedUser = localStorage.getItem('farcaster_user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    }
  }, [context]);

  const formik = useFormik<SellerInput>({
    validationSchema: SELLER_SCHEMA,
    initialValues: {
      category: "",
      email: "",
      location: "",
      description: "",
    },
    onSubmit: async (values) => {
      try {
        if (!user) {
          throw new Error('Please make sure you are connected with Farcaster');
        }

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
            pfpUrl: user.pfpUrl
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
        // Show error message to user
        alert(error instanceof Error ? error.message : 'Failed to create seller account. Please try again.');
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
              className="w-full p-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
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
          <Button
            type="submit"
            variant="primary_gradient"
            size="xs"
            className="text-gray-medium mt-2 disabled:bg-[#989898]"
            disabled={!formik.isValid || !formik.dirty || !acceptedTerms}
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
