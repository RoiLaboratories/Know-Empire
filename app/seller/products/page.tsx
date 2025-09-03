"use client";
import { Suspense } from "react";
import { useRouter } from "next/navigation";
import Tab from "../../../components/layout/Tab";
import SellerProducts from "../../../components/seller/SellerProducts";
import Modal from "../../../context/ModalContext";
import BackButton from "../../../ui/BackButton";

export default function SellerProductsPage() {
  const router = useRouter();

  const handleTabClick = (path: string) => {
    router.push(path);
  };

  return (
    <Modal>
      <div className="space-y-3">
        <div className="flex items-center mb-4">
          <BackButton onClick={() => router.back()} />
          <h1 className="text-2xl font-semibold ml-2">Seller Products</h1>
        </div>

        <div className="flex space-x-2 mb-6 border-b border-gray-200">
          <button
            onClick={() => handleTabClick("/marketplace")}
            className="px-4 py-2 text-gray-600 hover:text-gray-900 border-b-2 border-transparent hover:border-gray-300"
          >
            Discover
          </button>
          <button
            onClick={() => handleTabClick("/orders")}
            className="px-4 py-2 text-gray-600 hover:text-gray-900 border-b-2 border-transparent hover:border-gray-300"
          >
            Orders
          </button>
          <button
            onClick={() => handleTabClick("/seller/products")}
            className="px-4 py-2 text-primary border-b-2 border-primary"
          >
            My Products
          </button>
        </div>

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
