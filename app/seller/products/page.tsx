"use client";
import { Suspense } from "react";
import { useRouter } from "next/navigation";
import SellerProducts from "../../../components/seller/SellerProducts";
import Modal from "../../../context/ModalContext";
import BackButton from "../../../ui/BackButton";

export default function SellerProductsPage() {
  const router = useRouter();

  return (
    <Modal>
      <div className="space-y-6">
        <div className="px-4">
          <BackButton onClick={() => router.back()} />
        </div>

        <div className="text-center space-y-2">
          <h1 className="text-2xl font-semibold">My Products</h1>
          <p className="text-gray-600">Manage your listed products</p>
        </div>

        <Suspense>
          <SellerProducts />
        </Suspense>
      </div>
    </Modal>
  );
}
