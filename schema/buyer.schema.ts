import * as Yup from "yup";

export const BUYER_SCHEMA = Yup.object({
  email: Yup.string().email("Invalid email").required("Email is required"),
  phone_number: Yup.string().required("Phone number is required"),
  shipping_address: Yup.string().required("Shipping address is required"),
});
