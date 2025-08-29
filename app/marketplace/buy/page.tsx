import { useFormik } from "formik";
import Tab from "../../../components/layout/Tab";
import BuyerForm from "../../../components/form/BuyerForm";
import Modal from "../../../context/ModalContext";

function Buy() {
  return (
    <Modal>
      <div className="space-y-3">
        {/*tab */}
        <Tab
          name="Become a buyer"
          description="Join Know Empire and start shopping securely with verified sellers."
        />

        {/*form */}
        <BuyerForm />
      </div>
    </Modal>
  );
}

export default Buy;
