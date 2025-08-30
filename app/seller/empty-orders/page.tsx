"use client";
import { Icon } from "@iconify/react";
import { ICON } from "../../../utils/icon-export";
import Button from "../../../ui/Button";
import Empty from "../../../assets/images/empty.svg";
import Image from "next/image";
import { useRouter } from "next/navigation";
import BackButton from "../../../ui/BackButton";
import Tab from "../../../components/layout/Tab";

function EmptySellerOrders() {
  const router = useRouter();

  return (
    <section className="flex flex-col items-center min-h-screen pb-3">
      <div className="w-9/10 max-w-lg flex flex-col flex-1 gap-y-1">
        <div className="sticky top-0 space-y-3 bg-background py-3">
          <BackButton />
          <Tab
            name="My Orders"
            description="Track your sales and manage orders"
          />
        </div>

        <div className="flex flex-col gap-10 items-center justify-between">
          <Image alt="empty orders" src={Empty} className="" />

          <p className="text-xs font-medium text-center">
            You have no pending
            <span className="text-primary font-bold"> orders</span>, your
            orders will appear
            <span className="text-primary font-bold"> here </span>
            when customers make purchases
          </p>

          <Button
            className="text-white rounded bg-primary flex justify-center gap-x-1 items-center text-xs font-bold py-2 px-5 drop-shadow-dark btn w-fit"
            onClick={() => router.push("/marketplace")}
          >
            Go to marketplace
            <Icon icon={ICON.ARROW_CIRCLE_RIGHT} className="" />
          </Button>
        </div>
      </div>
    </section>
  );
}

export default EmptySellerOrders;
