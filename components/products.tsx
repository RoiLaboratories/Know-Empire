import ProductCard from "./cards/ProductCard";
import Session from "./Session";
import Phone from "../assets/images/prod1.png";
import Pc from "../assets/images/prod2.png";
import Modal from "../context/ModalContext";

// name: string;
// productId: string;
// img: string;
// quantity: number;
// unitPrice: number;
// totalPrice: number;

const products = [
  {
    name: "Iphone 15 Pro max Black | 1TB",
    unitPrice: 999,
    img: Phone,
    location: "United States",
    seller: "TechSeller",
    productId: 1,
  },
  {
    name: "Asus Geoforce- RX 4080",
    unitPrice: 1299,
    img: Pc,
    location: "United States",
    seller: "TechSeller",
    productId: 2,
  },
];

function Products() {
  return (
    <Modal>
      <Session title="Curated for you" link="See more">
        <ul className="grid grid-cols-2 gap-2">
          {products.map((product, i) => (
            <ProductCard product={product} key={i} />
          ))}
        </ul>
      </Session>
    </Modal>
  );
}

export default Products;
