import { useFormik } from "formik";
import Tab from "../../../components/layout/Tab";
import SellerForm from "../../../components/form/SellerForm";

function Sell() {
  return (
    <div className="space-y-3">
      {/*tab */}
      <Tab
        name="Become a seller"
        description="Join Know Empire and start selling your products securely."
      />

      {/*form */}
      <SellerForm />
    </div>
  );
}

export default Sell;
