import * as Yup from "yup";

export const DISPUTE_SCHEMA = Yup.object({
  reason: Yup.string().required("reason is required"),
  details: Yup.string().required("details are required"),
  photos: Yup.array().of(Yup.string()),
  // .min(1, "At least one image is required")
  // .max(4, "You can upload a maximum of 4 images")
  // .required("Image is required"),
});
