"use client";
import BackButton from "../../ui/BackButton";
import Search from "../../components/Search";
import Phone from "../../assets/images/prod1.png";
import Pc from "../../assets/images/prod2.png";
import OrdersCard from "../../components/cards/OrdersCard";
// Order management page only displays orders, no purchase functionality

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

function OrderManagement() {
  return (
    <section className="flex flex-col items-center min-h-screen pb-3 bg-white">
      <div className="w-9/10 max-w-lg flex flex-col flex-1 gap-y-1">
        <div className="sticky top-0 space-y-3 py-3 bg-white">
          <BackButton />
          <div className="text-gray flex flex-col items-center">
            <p className="text-xl font-bold">Order Management</p>
          </div>
          <div className="mt-6">
            <Search placeholder="Search orders..." />
          </div>
        </div>

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
      </div>
    </section>
  );
}

export default OrderManagement;
