import Image from "next/image";

function OrderManagementCard() {
  return (
    <div
      //   key={order.id}
      className="w-full rounded-lg bg-white border border-[#989898] p-4 flex flex-col gap-4"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <div className="w-10 h-11 relative">
            {/* <Image
              className="w-full h-full object-cover rounded"
              width={40}
              height={44}
                 alt={order.product.title}
                 src={order.product.photos[0]}
            /> */}
          </div>
          <div className="flex flex-col gap-0.5">
            <div className="font-semibold text-sm text-[#414141]">
              {/* {order.product.title} */}
            </div>
            <div className="text-xs text-gray-500">
              ID:
              {/* {order.id.slice(0, 8)} */}
              ...
            </div>
            <div className="text-sm font-medium text-[#16a34a]">
              {/* {formatCurrency(order.total_amount)} */}
            </div>
            {/* {activeTab === "buyer" && (
              <div className="text-xs text-gray-500">
                Seller: @
                {
                  (order as unknown as BuyerOrder).product.user
                    .farcaster_username
                }
              </div>
            )} */}
          </div>
        </div>
        <div
          className={`px-3 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 
            `}
          //     ${
          //     order.status === "pending"
          //       ? "bg-[#fef9c3] text-[#925f21]"
          //       : order.status === "shipped"
          //       ? "bg-[#dbeafe] text-[#1e43be]"
          //       : order.status === "delivered"
          //       ? "bg-[#dcfce7] text-[#166534]"
          //       : order.status === "completed"
          //       ? "bg-[#dcfce7] text-[#15803d]"
          //       : order.status === "cancelled"
          //       ? "bg-[#fee2e2] text-[#991b1b]"
          //       : "bg-[#fef9c3] text-[#925f21]"
          //   }
        >
          <img
            width={14}
            height={15}
            alt=""
            src="/Vector.svg"
            className="w-3.5 h-[15px]"
          />
          <span>
            {/* {order.status.charAt(0).toUpperCase() + order.status.slice(1)} */}
          </span>
        </div>
      </div>
      {/* Buyer Info and Tracking ID */}
      <div className="flex flex-col gap-4 w-full text-[#6b88b5]">
        {/* Buyer Details - only show for seller orders */}
        ///////////////////////////////////////////////////
        {/* {activeTab === "seller" && ( */}
        <div className="flex flex-col gap-2">
          <div className="text-sm font-medium">Buyer Information:</div>
          <div className="space-y-1 text-sm text-gray-600">
            <p className="flex justify-between">
              <span>Buyer:</span>
              <span className="text-gray-800">
                {/* @{(order as SellerOrder).buyer.farcaster_username} */}
              </span>
            </p>
            {/* {(order as SellerOrder).buyer.phone_number && (
                <p className="flex justify-between">
                  <span>Phone:</span>
                  <span className="text-gray-800">
                    {(order as SellerOrder).buyer.phone_number}
                  </span>
                </p>
              )} */}
            {/* {(order as SellerOrder).buyer.shipping_address && (
                <>
                  <div className="border-t border-gray-200 my-2" />
                  <div>
                    <span className="block text-sm mb-1">
                      Shipping Address:
                    </span>
                    <p className="text-gray-800 text-sm whitespace-pre-line">
                      {(order as SellerOrder).buyer.shipping_address}
                    </p>
                  </div>
                </>
              )} */}
          </div>
        </div>
        {/* )} */}
        ////////////////////////////////////////////////////
        {/* Tracking ID */}
        {/* <div className="flex flex-col gap-2">
          <div className="text-sm font-medium">Tracking ID:</div>
          {order.status === "pending" ? (
            <div className="flex flex-col gap-2">
              <input
                type="text"
                placeholder="Enter tracking ID"
                value={trackingInputs[order.id] || ""}
                onChange={(e) => {
                  console.log("Input changed:", e.target.value);
                  setTrackingInputs((prev) => ({
                    ...prev,
                    [order.id]: e.target.value,
                  }));
                }}
                className="w-full p-2.5 rounded-lg border border-gray-300 text-sm"
                style={{
                  minHeight: "44px",
                  fontSize: "16px", // Prevents zoom on mobile
                }}
              />
              {trackingInputs[order.id]?.trim() && (
                <button
                  onClick={() => markAsShipped(order.id)}
                  className="w-full bg-blue-500 text-white rounded-lg py-3 text-sm font-medium"
                >
                  Mark as Shipped
                </button>
              )}
            </div>
          ) : (
            <div className="p-2.5 rounded-lg border border-gray-300 bg-gray-50 text-sm text-gray-500">
              {order.tracking_number || "No tracking ID available"}
            </div>
          )}
        </div> */}
      </div>
      /////////////////////////////////////////////////
      {/* Action Buttons */}
      {/* {activeTab === "seller" && (
        <div className="flex flex-col gap-2">
          <div className="w-full h-px bg-[#989898] my-2" />
          {order.status === "pending" && (
            <button
              className="w-full flex items-center justify-center gap-2.5 bg-[#2563eb] text-white rounded-lg py-2.5 px-5 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => markAsShipped(order.id)}
              disabled={!trackingInputs[order.id]?.trim()}
            >
              <Image
                className="w-[22px] h-[18px]"
                width={22}
                height={18}
                alt=""
                src="/Vector-11.svg"
              />
              <span className="text-sm font-semibold">Mark as shipped</span>
            </button>
          )}

          {order.status === "shipped" && (
            <button
              className="w-full flex items-center justify-center gap-2.5 bg-[#2563eb] text-white rounded-lg py-2.5 px-5 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => markAsDelivered(order.id, order.escrow_id)}
              disabled={loading || !isConnected || !context?.user?.fid}
            >
              <Image
                className="w-[22px] h-[18px]"
                width={22}
                height={18}
                alt=""
                src="/Vector-11.svg"
              />
              <span className="text-sm font-semibold">Mark as delivered</span>
            </button>
          )}

          {order.status === "delivered" && (
            <button
              className="w-full flex items-center justify-center gap-2.5 bg-[#2563eb] text-white rounded-lg py-2.5 px-5 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => markAsCompleted(order.id)}
              disabled={loading || !context?.user?.fid}
            >
              <Image
                className="w-[22px] h-[18px]"
                width={22}
                height={18}
                alt=""
                src="/check.svg"
              />
              <span className="text-sm font-semibold">Mark as completed</span>
            </button>
          )}
        </div>
      )} */}
    </div>
  );
}

export default OrderManagementCard;
