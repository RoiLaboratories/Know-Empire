"use client";
import { Suspense } from "react";
import Tab from "../../../components/layout/Tab";
import SellerProducts from "../../../components/seller/SellerProducts";
import Modal from "../../../context/ModalContext";

export default function SellerProductsPage() {
  return (
    <Modal>
      <div className="space-y-3">
        <Tab
          name="My Products"
          description="Manage your listed products"
        />

        <Suspense>
          <SellerProducts />
        </Suspense>
      </div>
    </Modal>
  );
}
