"use client";
import { useFormik } from "formik";
import { DISPUTE_SCHEMA } from "../../schema/dispute.schema";
import { sleep } from "../../utils/helpers";
import { ChangeEvent, useState } from "react";
import FormInput from "./FormInput";
import InputField from "./InputField";
import InputTextArea from "./InputTextArea";
import { Icon } from "@iconify/react";
import { ICON } from "../../utils/icon-export";
import Image from "next/image";
import Button from "../../ui/Button";

function DisputeForm() {
  const [previews, setPreviews] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const formik = useFormik<DisputeInput>({
    validationSchema: DISPUTE_SCHEMA,
    initialValues: {
      reason: "",
      details: "",
      photos: [],
    },
    onSubmit: async (values) => {
      setIsLoading(true);
      console.log(values);
      await sleep(2000);
      setIsLoading(false);
      //   handleCreateAccount();
    },
  });

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newFiles = Array.from(files);

      const currentPhotos = formik.values.photos;
      //   if (currentPhotos.length + newFiles.length > 4) {
      //     console.log("You can only upload a maximum of 3 images.");
      //     return;
      //   }

      const newPreviewUrls = newFiles.map((file) => URL.createObjectURL(file));

      formik.setFieldValue("photos", [...currentPhotos, ...newFiles]);
      setPreviews([...previews, ...newPreviewUrls]);
    }
  };

  const handleRemoveImage = (indexToRemove: number) => {
    const newPhotos = formik.values.photos.filter(
      (_, index) => index !== indexToRemove
    );
    formik.setFieldValue("photos", newPhotos);

    URL.revokeObjectURL(previews[indexToRemove]);

    const newPreviews = previews.filter((_, index) => index !== indexToRemove);
    setPreviews(newPreviews);
  };

  return (
    <FormInput
      config={{
        onSubmit: formik.handleSubmit,
      }}
    >
      <div className="w-full">
        <InputTextArea
          config={{
            placeholder:
              "Please describe the issue (e.g item not received, item not as described, changed item etc,)",
            value: formik.values.reason,
            name: "reason",
            onChange: formik.handleChange,
            onBlur: formik.handleBlur,
          }}
          label="Reason for Dispute*"
          error={Boolean(formik.errors.reason && formik.touched.reason)}
          errorMessage={formik.errors.reason}
        />
        <InputTextArea
          config={{
            placeholder: "Tell buyers about yourself and what you sell...",
            value: formik.values.details,
            name: "details",
            onChange: formik.handleChange,
            onBlur: formik.handleBlur,
          }}
          label="Additional Details"
          error={Boolean(formik.errors.details && formik.touched.details)}
          errorMessage={formik.errors.details}
        />
        {/*photos */}
        <div className="">
          <div className="space-y-1.5 w-full">
            <p className="font-medium text-gray text-xs ">
              Upload Evidence (Optional)
            </p>
            <label
              htmlFor="photos"
              //   onClick={handleImageUploadClick}
              className="rounded-lg border-dashed border-2 text-gray-400 border-[#c084fc] bg-[#faf6ff] flex flex-col gap-2 items-center h-32 justify-center cursor-pointer min-w-full"
            >
              <Icon
                icon={ICON.UPLOAD}
                fontSize={30}
                className="text-[#c084fc]"
              />
              <p className="text-xs text-right font-semibold text-[#414141]">
                Click to upload photos or documents
              </p>
              <p className="text-[10px] text-[#989898]">
                PNG, JPG, PDF up to 10MB each
              </p>
            </label>
            <input
              type="file"
              accept="/image*"
              name="photos"
              id="photos"
              onChange={handleImageChange}
              hidden
              multiple
            />
          </div>
          {/**selected file */}
          <ul className="grid grid-cols-3 gap-3 mt-2">
            {previews.length > 0 &&
              previews.map((previewUrl, i) => (
                <li className="rounded-lg h-20 bg-gray-300  relative" key={i}>
                  <Image
                    src={previewUrl}
                    alt={`img-${i}`}
                    fill
                    //   width={40}
                    //   height={20}
                    className="object-cover rounded-lg w-full h-full"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(i)}
                    className="absolute top-1 right-1 rounded-full p-[2px] bg-gray-800/70 text-white cursor-pointer"
                  >
                    <Icon icon={ICON.CLOSE} />
                  </button>
                </li>
              ))}
          </ul>
        </div>
        {/* {formik.errors.photos && formik.touched.photos && ( */}
        <p className="text-red-500 text-xs h-2 mb-1 text-right">
          {formik.errors.photos}
        </p>

        <div className="text-[#8732d2] space-y-1 font-medium">
          <p className="text-xs flex items-center gap-x-1">
            <Icon icon={ICON.PROTECT} className="" fontSize={20} />
            Dispute Protection
          </p>
          <p className="text-[9px]">
            Our moderators will review your dispute within 24 hours. Both
            parties will be notified of the decision. During this time, Escrow
            funds will reain secure.
          </p>
        </div>

        <div className="flex gap-x-6 mt-2">
          <Button
            type="button"
            variant="back"
            size="xs"
            className="rounded-[10px] font-medium"
          >
            Cancel
          </Button>

          <Button
            variant="warning_gradient"
            size="xs"
            type="submit"
            className="rounded-[10px] font-medium"
            disabled={!formik.isValid || !formik.dirty || isLoading}
          >
            {!isLoading ? (
              "Submit Dispute"
            ) : (
              <>
                <Icon
                  icon={ICON.SPINNER}
                  fontSize={15}
                  className="animate-spin"
                />
                Submitting...
              </>
            )}
          </Button>
        </div>
      </div>
    </FormInput>
  );
}

export default DisputeForm;
