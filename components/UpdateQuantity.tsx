"use client";

import { useState } from "react";
import { useCart } from "../providers/cart";

function UpdateQuantity({
  quantity,
  itemId,
}: {
  quantity: number;
  itemId: string;
}) {
  const { incQuantity, decQuantity } = useCart();

  return (
    <div className="grid grid-cols-3 w-fit items-center gap-x-2">
      <button
        className="rounded-full grid place-items-center size-6.5 border border-gray-300 btn"
        onClick={() => decQuantity(itemId)}
      >
        -
      </button>
      <div className="text-sm px-2">{quantity}</div>
      <button
        className="rounded-full grid place-items-center size-6.5 border border-gray-300 btn"
        onClick={() => incQuantity(itemId)}
      >
        +
      </button>
    </div>
  );
}

export default UpdateQuantity;
