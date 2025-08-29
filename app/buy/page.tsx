"use client";
import Tab from "../../components/layout/Tab";
import BuyerForm from "../../components/form/BuyerForm";
import Modal from "../../context/ModalContext";

export default function BuyPage() {
  return (
    <section className="flex flex-col items-center min-h-screen pt-3 px-3">
      <div className="w-full max-w-lg flex flex-col flex-1">
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
      </div>
    </section>
  );
}
