import Tab from "../../components/layout/Tab";
import Search from "../../components/Search";
import OrdersCard from "../../components/cards/OrdersCard";
import Phone from "../../assets/images/prod1.png";
import Pc from "../../assets/images/prod2.png";
import BackButton from "../../ui/BackButton";
import { Icon } from "@iconify/react";
import { ICON } from "../../utils/icon-export";
import Button from "../../ui/Button";
import Empty from "../../assets/images/empty.svg";
import Image from "next/image";

//Turn order to an empty array to test empty state

const orders = [
  {
    name: "Iphone 15 Pro Max",
    status: "shipped",
    img: Phone,
    seller: "TechSeller",
    price: "999",
    id: "1Z123456789",
  },
  {
    name: "Asus Geoforce- RX 4080",
    status: "pending",
    img: Pc,
    seller: "TechSeller",
    price: "1,299",
    id: "1Z123456789",
  },
];

function Orders() {
  return (
    <section className="flex flex-col items-center min-h-screen pb-3">
      <div className="w-9/10 max-w-lg flex flex-col flex-1 gap-y-1">
        <div className="sticky top-0 space-y-3 bg-background py-3">
          <BackButton />
          <Tab
            name="My Orders"
            description="Track your purchases and leave reviews"
          />
          {/*search */}
          {orders.length !== 0 && <Search />}
        </div>

        {/*main content */}
        {orders.length !== 0 ? (
          <ul className="grid grid-cols-1 gap-5 mt-2.5">
            {orders.map((order, i) => (
              <OrdersCard
                key={i}
                status={order.status}
                name={order.name}
                img={order.img}
                seller={order.seller}
                price={order.price}
                id={order.id}
              />
            ))}
          </ul>
        ) : (
          <div className="flex flex-col gap-10 items-center justify-between">
            <Image alt="empty orders" src={Empty} className="" />

            <p className="text-xs font-medium text-center">
              You have no{" "}
              <span className="text-primary font-bold">orders </span>
              placed yet, place an order to see your order list
              <span className="text-primary font-bold"> here</span>
            </p>

            <Button className="text-white rounded bg-primary flex justify-center gap-x-1 items-center text-xs font-bold py-2 px-5 drop-shadow-dark btn w-fit">
              Go to marketplace
              <Icon icon={ICON.ARROW_CIRCLE_RIGHT} className="" />
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}

export default Orders;
