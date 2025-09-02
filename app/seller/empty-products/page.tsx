"use client";
import { Icon } from "@iconify/react";
import { ICON } from "../../../utils/icon-export";
import Button from "../../../ui/Button";
import Empty from "../../../assets/images/empty.svg";
import Image from "next/image";
import { useRouter } from "next/navigation";
import BackButton from "../../../ui/BackButton";
import Tab from "../../../components/layout/Tab";

export default function EmptySellerProducts() {
  const router = useRouter();

  return (
    <section className="flex flex-col items-center min-h-screen pb-3">
      <div className="w-9/10 max-w-lg flex flex-col flex-1 gap-y-1">
        <div className="sticky top-0 space-y-3 bg-background py-3">
          <BackButton />
          <Tab
            name="My Products"
            description="Manage your listed products"
          />
        </div>

        <div className="flex flex-col gap-10 items-center justify-between">
          <Image alt="empty products" src={Empty} className="" />

          <p className="text-xs font-medium text-center">
            You have no
            <span className="text-primary font-bold"> products </span>
            listed yet. Start selling by listing your first
            <span className="text-primary font-bold"> product</span>!
          </p>

          <Button
            className="text-white rounded bg-primary flex justify-center gap-x-1 items-center text-xs font-bold py-2 px-5 drop-shadow-dark btn w-fit"
            onClick={() => router.push("/list_product")}
          >
            List a Product
            <Icon icon={ICON.SELL} className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </section>
  );
}
