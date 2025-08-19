import * as Yup from "yup";

export const SELLER_SCHEMA = Yup.object({
  handle: Yup.string().required("handle is required"),
  category: Yup.string().required("category is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  location: Yup.string().required("loaction is required"),
  description: Yup.string().required("description is required"),
});

export const LIST_SCHEMA = Yup.object({
  title: Yup.string().required("title is required"),
  description: Yup.string().required("description is required"),
  price: Yup.number().required("price is required"),
  country: Yup.string().required("country is required"),
  delivery: Yup.string().required("delivery address is required"),
  category: Yup.string().required("category is required"),
  photos: Yup.array()
    .of(Yup.string())
    .min(1, "At least one image is required")
    .max(4, "You can upload a maximum of 4 images")
    .required("Image is required"),
});

// export const VERIFY_EMAIL_SCHEMA = Yup.object({
//   email: Yup.string().email("Invalid email").required("Email is required"),
//   otp: Yup.string()
//     .required("Input Otp")
//     .min(6, "Invalid otp")
//     .max(6, "Tnvalid otp"),
// });

// export const FORGOT_PASSWORD = Yup.object({
//   email: Yup.string().email("Invalid email").required("Email is required"),
// });

// export const CREATE_NEW_PASSWORD = Yup.object({
//   password: Yup.string()
//     .min(6, "Password must be at least 6 characters")
//     .required("Password is required"),
//   confirmPassword: Yup.string()
//     .oneOf([Yup.ref("password")], "Passwords must match")
//     .required("Confirm password is required"),
// });
