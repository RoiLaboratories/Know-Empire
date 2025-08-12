"use client";
import { useFormik } from "formik";
import { LIST_SCHEMA } from "../../schema/seller.schema";
import FormInput from "./FormInput";
import InputField from "./InputField";
import Button from "../../ui/Button";
import { ChangeEvent, useState } from "react";
import { Icon } from "@iconify/react";
import { ICON } from "../../utils/icon-export";
import Image from "next/image";

function ListingForm() {
  const [previews, setPreviews] = useState<string[]>([]);

  const formik = useFormik<ListingInput>({
    validationSchema: LIST_SCHEMA,
    initialValues: {
      title: "",
      description: "",
      price: 0,
      delivery: "",
      photos: [],
      country: "",
    },
    onSubmit: (values) => {
      console.log(values);
    },
  });

  //   const handleImageUploadClick = () => {
  //     document.getElementById("photos")?.click();
  //   };
  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newFiles = Array.from(files);

      const currentPhotos = formik.values.photos;
      if (currentPhotos.length + newFiles.length > 4) {
        console.log("You can only upload a maximum of 3 images.");
        return;
      }

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
        <div className="flex gap-2 items-end mb-1">
          <div className="space-y-1.5">
            <p className="font-medium text-gray text-xs text-nowrap">
              Product Images (Max 3)
            </p>
            <label
              htmlFor="photos"
              //   onClick={handleImageUploadClick}
              className="rounded-lg border-dashed border-2 text-gray-400 border-gray-400 flex flex-col gap-2 items-center justify-center size-32 cursor-pointer"
            >
              <Icon icon={ICON.UPLOAD} fontSize={44} />
              <p className="text-sm text-right">Add Image</p>
            </label>
            <input
              type="file"
              accept="/image*"
              name="photos"
              id="photos"
              onChange={handleImageChange}
              //   value={formik.values.photos}
              //   onChange={(e) => {
              //     if (e.currentTarget?.files) {
              //       const files = e.target.files;
              //       if (files) {
              //         let myFiles = Array.from(files);
              //         formik.setFieldValue("photos", myFiles);
              //       }
              //     }
              //   }}
              hidden
              multiple
            />
          </div>
          {/**selected file */}
          <ul className="flex flex-wrap gap-2 w-full">
            {previews.length > 0 &&
              previews.map((previewUrl, i) => (
                <li
                  className="rounded-lg max-w-20 h-20 bg-gray-300 aspect-square relative"
                  key={i}
                >
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
        {/* )} */}
        <InputField
          config={{
            placeholder: "Iphone 15 Pro Max - Like New",
            type: "text",
            name: "title",
            value: formik.values.title,
            onChange: formik.handleChange,
            onBlur: formik.handleBlur,
          }}
          label="Product Title"
          error={Boolean(formik.errors.title && formik.touched.title)}
          errorMessage={formik.errors.title}
        />
        <InputField
          config={{
            placeholder:
              "Detailed description of your product, condition, specification...",
            type: "text",
            name: "description",
            value: formik.values.description,
            onChange: formik.handleChange,
            onBlur: formik.handleBlur,
          }}
          label="Description"
          error={Boolean(
            formik.errors.description && formik.touched.description
          )}
          errorMessage={formik.errors.description}
        />
        <InputField
          config={{
            placeholder: "999",
            type: "number",
            name: "price",
            value: formik.values.price,
            onChange: formik.handleChange,
            onBlur: formik.handleBlur,
          }}
          label="Price"
          error={Boolean(formik.errors.price && formik.touched.price)}
          errorMessage={formik.errors.price}
        />
        <InputField
          config={{
            placeholder: "Unites states",
            type: "text",
            name: "country",
            value: formik.values.country,
            onChange: formik.handleChange,
            onBlur: formik.handleBlur,
          }}
          label="Country of origin"
          error={Boolean(formik.errors.country && formik.touched.country)}
          errorMessage={formik.errors.country}
        />
        <InputField
          config={{
            placeholder:
              "Shipping method, estimated delivery time, special instructions...",
            type: "text",
            name: "delivery",
            value: formik.values.delivery,
            onChange: formik.handleChange,
            onBlur: formik.handleBlur,
          }}
          label="Delivery Details"
          error={Boolean(formik.errors.delivery && formik.touched.delivery)}
          errorMessage={formik.errors.delivery}
        />

        <Button
          type="submit"
          variant="primary_gradient"
          size="xs"
          className="text-gray-medium mt-2 disabled:bg-[#989898]"
          disabled={!formik.isValid || !formik.dirty}
        >
          Publish Listing
        </Button>
      </div>
    </FormInput>
  );
}

export default ListingForm;
