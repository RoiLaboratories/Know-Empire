"use client";

import BackButton from "../../ui/BackButton";
import ListingForm from "../../components/form/ListingForm";
import Modal from "../../context/ModalContext";

function ListProduct() {
  return (
    <section className="flex flex-col items-center min-h-screen pb-3 bg-white">
      <div className="w-9/10 max-w-lg flex flex-col flex-1 gap-y-1">
        <div className="sticky top-0 space-y-3 py-3 bg-white">
          <BackButton />
          <div className="text-gray flex flex-col items-center">
            <p className="text-xl font-bold">List New Product</p>
          </div>
        </div>

        <Modal>
          <ListingForm />
        </Modal>
      </div>
    </section>
  );
}

export default ListProduct;
