"use client";
import CartItem from "../../components/cart/CartItem";
import Tab from "../../components/layout/Tab";
import BackButton from "../../ui/BackButton";
import Invite from "../../assets/images/invite.png";
import Image from "next/image";
import Button from "../../ui/Button";
import { Icon } from "@iconify/react";
import { ICON } from "../../utils/icon-export";
import { useCart } from "../../providers/cart";
import { formatCurrency } from "../../utils/helpers";
import { useState, useContext } from "react";
import { ProductWithSeller } from "../../types/product";
import Link from "next/link";
import Modal, { ModalContext } from "../../context/ModalContext";
import CartSummaryPopup from "../../components/popups/cart-summary-popup";
import PurchasePopup from "../../components/popups/purchase-popup";
import EmptyCart from "../../components/cart/EmptyCart";

function Cart() {
  const {
    cart,
    costBreakDown: { total },
  } = useCart();
  const modalContext = useContext(ModalContext);
  const taxesAndFees = 10;
  const deliveryFee = 5;
  const [selectedProduct, setSelectedProduct] = useState<ProductWithSeller | null>(null);

  const grandTotal = total + taxesAndFees + deliveryFee;

  return (
    <Modal>
      <section className="flex flex-col items-center min-h-screen pb-3">
        <div className="w-9/10 max-w-lg flex flex-col gap-y-5">
          <div className="sticky top-0 space-y-3 bg-background py-3">
            <BackButton />
            <Tab
              name="My Cart"
              description="View selected items"
              showRoutes={false}
            />
          </div>
          {cart.length !== 0 ? (
            <>
              {/*main content */}
              <ul className="space-y-5">
                {cart.map((product, i) => (
                  <CartItem item={product} key={i} />
                ))}
              </ul>

              {/*add more item */}
              <div className="mx-auto flex flex-col items-center gap-y-1">
                <Link
                  href="/marketplace"
                  className="rounded-lg relative size-16 cursor-pointer"
                >
                  <Image
                    alt="invite"
                    fill
                    src={Invite}
                    placeholder="blur"
                    className="object-cover -z-1"
                  />
                </Link>
                <p className="text-sm font-bold text-[#5b5b5b]">
                  Add more items to your cart
                </p>
              </div>

              {/* all totals */}
              <div className=" space-y-5">
                <ul className="text-sm space-y-3">
                  <li className="flex justify-between items-center">
                    <p>Sub total</p>
                    <p className="text-[#5b5b5b]">{formatCurrency(total)}</p>
                  </li>
                  <li className="flex justify-between items-center">
                    <p>Taxes & Fees</p>
                    <p className="text-[#5b5b5b]">
                      {formatCurrency(taxesAndFees)}
                    </p>
                  </li>
                  <li className="flex justify-between items-center">
                    <p>Delivery Fee</p>
                    <p className="text-[#5b5b5b]">
                      {formatCurrency(deliveryFee)}
                    </p>
                  </li>
                  <li className="flex justify-between font-bold items-center">
                    <p>Taxes and Fees</p>
                    <p className="text-[#5b5b5b]">
                      {formatCurrency(grandTotal)}
                    </p>
                  </li>
                </ul>
                <Modal.Open opens="cart-summary-popup">
                  <Button variant="success" size="xs" className="rounded-lg">
                    <Icon icon={ICON.ARROW_CHECKED} fontSize={16} />
                    Checkout
                  </Button>
                </Modal.Open>
              </div>
            </>
          ) : (
            <EmptyCart />
          )}
        </div>

        {/*all purchase modals */}
        <Modal.Window name="purchase-product-popup" showBg={false}>
          {selectedProduct ? (
            <PurchasePopup 
              product={selectedProduct}
              onCloseModal={() => {
                setSelectedProduct(null);
                modalContext?.close("purchase-product-popup");
              }} 
            />
          ) : undefined}
        </Modal.Window>
        <Modal.Window name="cart-summary-popup" showBg={false}>
          <CartSummaryPopup setSelectedProduct={setSelectedProduct} onCloseModal={() => modalContext?.close("cart-summary-popup")} />
        </Modal.Window>
      </section>
    </Modal>
  );
}

export default Cart;
