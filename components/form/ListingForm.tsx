"use client";
import { useFormik } from "formik";
import { LIST_SCHEMA } from "../../schema/seller.schema";
import FormInput from "./FormInput";
import InputField from "./InputField";
import { uploadMultipleProductImages } from "../../utils/supabase-storage";
import Button from "../../ui/Button";
import { ChangeEvent, useContext, useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import { ICON } from "../../utils/icon-export";
import Image from "next/image";
import Modal, { ModalContext } from "../../context/ModalContext";
import GenericPopup from "../popups/generic-popup";
import { supabase } from "../../utils/supabase";
import { useRouter } from "next/navigation";

function ListingForm() {
  const [previews, setPreviews] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const modalContext = useContext(ModalContext);
  const router = useRouter();

  // Check if user is authenticated and is a seller
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          router.push('/onboarding'); // Redirect to sign in
          return;
        }

        // Check if user is a seller
        const { data: userData, error } = await supabase
          .from('users')
          .select('is_seller')
          .eq('id', session.user.id)
          .single();

        if (error || !userData?.is_seller) {
          router.push('/marketplace/sell'); // Redirect to seller registration
        }
      } catch (error) {
        console.error('Auth check error:', error);
        setError('Authentication check failed');
      }
    };

    checkAuth();
  }, [router]);

  const formik = useFormik<ListingInput>({
    validationSchema: LIST_SCHEMA,
    initialValues: {
      title: "",
      description: "",
      price: 0,
      delivery: "",
      photos: [],
      country: "",
      category: "",
    },
    onSubmit: async (values) => {
      setError(null);
      try {
        setIsLoading(true);

        // Check session
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          throw new Error('Please sign in to create a listing');
        }

        // Upload images first
        const imageUrls = await uploadMultipleProductImages(values.photos);
        
        // Submit the form data with image URLs to your API
        const productData = {
          ...values,
          photos: imageUrls  // Replace File objects with URLs
        };
        
        const response = await fetch('/api/products', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`
          },
          body: JSON.stringify(productData),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to create listing');
        }

        // Show success modal
        modalContext?.open("successful-listing-modal");
        
        // Reset form
        formik.resetForm();
        setPreviews([]);
        
        // Redirect to product page or marketplace
        router.push('/marketplace');

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || 'Failed to create product');
        }

        await response.json();
        modalContext?.open("successful-listing-modal");
      } catch (error) {
        console.error('Error submitting form:', error);
        // TODO: Add proper error handling UI here
        alert('Failed to create product. Please try again.');
      } finally {
        setIsLoading(false);
      }
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

  // Error Modal
  const ErrorModal = () => (
    <Modal.Window name="error-modal">
      <div className="p-6 bg-white rounded-lg">
        <h3 className="text-red-600 font-semibold mb-2">Error</h3>
        <p>{error}</p>
        <Button
          onClick={() => modalContext?.close()}
          className="mt-4"
        >
          Close
        </Button>
      </div>
    </Modal.Window>
  );

  if (error) {
    return <ErrorModal />;
  }

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
            placeholder: "Select product category",
            type: "text",
            name: "category",
            value: formik.values.category,
            onChange: formik.handleChange,
            onBlur: formik.handleBlur,
          }}
          label="Category"
          error={Boolean(formik.errors.category && formik.touched.category)}
          errorMessage={formik.errors.category}
        />
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
            placeholder: "United states",
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
          disabled={!formik.isValid || !formik.dirty || isLoading}
        >
          {!isLoading ? (
            "Publish Listing"
          ) : (
            <>
              <Icon
                icon={ICON.SPINNER}
                fontSize={15}
                className="animate-spin"
              />
              Publishing...
            </>
          )}
        </Button>

        {/*successful listing modal */}
        <Modal.Window
          name="successful-listing-modal"
          allowOutsideClick
          showBg={false}
        >
          <GenericPopup
            iconStyle="text-green-600"
            icon={ICON.CHECK_CIRCLE}
            text="Your product has been successfully listed"
          />
        </Modal.Window>
      </div>
    </FormInput>
  );
}

export default ListingForm;
