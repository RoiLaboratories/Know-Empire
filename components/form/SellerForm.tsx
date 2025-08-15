"use client";
import { useFormik } from "formik";
import { useContext, useEffect, useState } from "react";
import { SELLER_SCHEMA } from "../../schema/seller.schema";
import FormInput from "./FormInput";
import InputField from "./InputField";
import Button from "../../ui/Button";
import { Icon } from "@iconify/react";
import { ICON } from "../../utils/icon-export";
import Modal, { ModalContext } from "../../context/ModalContext";
import LoadingCard from "../popups/loading-card";
import SellerCongratsPopup from "../popups/seller-congrats-popup";

function SellerForm() {
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const modalContext = useContext(ModalContext);

  const handleCreateAccount = () => {
    // Already wrapped parent of sellerform with Modal context so no need for this

    // if (!modalContext) {
    //   console.log("No modal context available");
    //   return;
    // }

    console.log("Opening loading modal");
    // Open loading modal immediately
    modalContext?.open("loading-modal");

    // After 5 seconds, show congrats
    setTimeout(() => {
      modalContext?.close();
      console.log("Transitioning to congrats");
      console.log("Opening congrats modal");
      modalContext?.open("congrats-modal");
      // modalContext?.close(); // Close loading modal
    }, 5000);
  };

  const formik = useFormik<SellerInput>({
    validationSchema: SELLER_SCHEMA,
    initialValues: {
      handle: "",
      category: "",
      email: "",
      location: "",
      description: "",
    },
    onSubmit: () => {
      console.log("Form submitted");
      handleCreateAccount();
    },
  });

  return (
    <>
      <FormInput
        config={{
          onSubmit: (e) => {
            e.preventDefault();
            handleCreateAccount();
          },
        }}
      >
        <div className="w-full">
          <InputField
            config={{
              placeholder: "@yourhandle",
              type: "text",
              name: "handle",
              value: formik.values.handle,
              onChange: formik.handleChange,
              onBlur: formik.handleBlur,
            }}
            label="Farcaster Handle"
            error={Boolean(formik.errors.handle && formik.touched.handle)}
            errorMessage={formik.errors.handle}
          />
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
          <InputField
            config={{
              placeholder: "Select category",
              type: "text",
              name: "category",
              value: formik.values.category,
              onChange: formik.handleChange,
              onBlur: formik.handleBlur,
            }}
            label="Product Category"
            error={Boolean(formik.errors.category && formik.touched.category)}
            errorMessage={formik.errors.category}
          />
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
          <InputField
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
        <SellerCongratsPopup
        // onCloseModal={() => {
        //   console.log("Closing congrats modal");
        //   modalContext?.close();
        // }}
        // onMount={() => console.log("Congrats modal mounted")}
        // onUnmount={() => console.log("Congrats modal unmounted")}
        />
      </Modal.Window>
    </>
  );
}

export default SellerForm;
