"use client";
import { Suspense } from "react";
import { useRouter } from "next/navigation";
import Tab from "../../../components/layout/Tab";
import SellerProducts from "../../../components/seller/SellerProducts";
import Modal from "../../../context/ModalContext";
import BackButton from "../../../ui/BackButton";

export default function SellerProductsPage() {
  const router = useRouter();
  
  return (
    <Modal>
      <div className="space-y-3">
        <div className="flex items-center mb-4">
          <BackButton onClick={() => router.back()} />
        </div>

        <Tab
          name="My Products"
          description="Manage your listed products"
          showRoutes={true}
        />

        <Suspense>
          <SellerProducts />
        </Suspense>
      </div>
    </Modal>
  );
}
