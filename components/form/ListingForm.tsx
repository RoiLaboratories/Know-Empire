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
import InputTextArea from "./InputTextArea";

interface ListingFormValues {
  category: string;
  title: string;
  description: string;
  price: string;
  country: string;
  delivery: string;
  photos: File[];
}

export default function ListingForm() {
  const [previews, setPreviews] = useState<string[]>([]);

  const formik = useFormik<ListingFormValues>({
    initialValues: {
      category: "",
      title: "",
      description: "",
      price: "",
      country: "",
      delivery: "",
      photos: []
    },
    validationSchema: LIST_SCHEMA,
    onSubmit: async (values) => {
      // For now, just log the values
      console.log("Form submitted:", values);
      // We'll implement the actual submission later
    }
  });


  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newFiles = Array.from(files);

      // Limit to 3 images
      if (formik.values.photos.length + newFiles.length > 3) {
        alert("You can only upload a maximum of 3 images.");
        return;
      }

      // Create preview URLs
      const newPreviewUrls = newFiles.map(file => URL.createObjectURL(file));
      setPreviews(prev => [...prev, ...newPreviewUrls]);

      // Update form value
      formik.setFieldValue("photos", [...formik.values.photos, ...newFiles]);
    }
  };

  const handleRemoveImage = (indexToRemove: number) => {
    // Remove the file from form values
    const newPhotos = formik.values.photos.filter((_, index) => index !== indexToRemove);
    formik.setFieldValue("photos", newPhotos);

    // Clean up preview URL
    URL.revokeObjectURL(previews[indexToRemove]);
    setPreviews(prev => prev.filter((_, index) => index !== indexToRemove));
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
              className="rounded-lg border-dashed border-2 text-gray-400 border-gray-400 flex flex-col gap-2 items-center justify-center size-32 cursor-pointer"
            >
              <Icon icon={ICON.UPLOAD} fontSize={44} />
              <p className="text-sm text-right">Add Image</p>
            </label>
            <input
              type="file"
              accept="image/*"
              name="photos"
              id="photos"
              onChange={handleImageChange}
              hidden
              multiple
            />
          </div>
          <ul className="flex flex-wrap gap-2 w-full">
            {previews.length > 0 &&
              previews.map((previewUrl, i) => (
                <li
                  className="rounded-lg max-w-20 h-20 bg-gray-300 aspect-square relative"
                  key={i}
                >
                  <Image
                    src={previewUrl}
                    alt={`Product image ${i + 1}`}
                    fill
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
        <p className="text-red-500 text-xs h-2 mb-1 text-right">
          {formik.errors.photos?.toString()}
        </p>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Category</label>
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
        <InputTextArea
          config={{
            placeholder: "Detailed description of your product, condition, specification...",
            name: "description",
            value: formik.values.description,
            onChange: formik.handleChange,
            onBlur: formik.handleBlur,
          }}
          label="Description"
          error={Boolean(formik.errors.description && formik.touched.description)}
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
            placeholder: "United States",
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
        <InputTextArea
          config={{
            placeholder: "Shipping method, estimated delivery time, special instructions...",
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
          Create Listing
        </Button>
      </div>
    </FormInput>
  );
}

