import { useFormik } from "formik";
// import Tab from "../../../components/layout/Tab";
import BuyerForm from "../../../components/form/BuyerForm";
import Modal from "../../../context/ModalContext";

function Buy() {
  return (
    <Modal>
      <div className="space-y-3">
        {/*header */}
        <div className="space-y-1">
          <h2 className="font-medium text-lg">Become a buyer</h2>
          <p className="text-gray text-sm">
            Join Know Empire and start shopping securely with verified sellers.
          </p>
        </div>

        {/*form */}
        <BuyerForm />
      </div>
    </Modal>
  );
}

export default Buy;
