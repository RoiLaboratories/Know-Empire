import Image from "next/image";
import Fashion from "../assets/images/fashion.png";
import Gadgets from "../assets/images/gadget.png";
import Sports from "../assets/images/sports.png";
import Books from "../assets/images/books.png";
import Home from "../assets/images/home.png";
import Session from "./Session";

const categories = [
  {
    icon: Fashion,
    label: "Fashion",
  },
  {
    icon: Gadgets,
    label: "Gadgets",
  },
  {
    icon: Sports,
    label: "Sports",
  },
  {
    icon: Books,
    label: "Books",
  },
  {
    icon: Home,
    label: "Home",
  },
];

function Category() {
  return (
    <Session title="Shop by category" link="See more">
      <ul className="flex justify-between gap-x-4 overflow-x-scroll scrollbar-hide">
        {categories.map(({ icon, label }) => (
          <li className=" flex flex-col items-center gap-2" key={label}>
            <div className="grid place-items-center size-14 rounded-full border border-primary bg-[#f8f2fe]">
              <Image
                loading="lazy"
                alt="Know Empire Logo"
                src={icon}
                placeholder="blur"
                className="object-cover"
              />
            </div>
            <p className="text-xs text-gray">{label}</p>
          </li>
        ))}
      </ul>
    </Session>
  );
}

export default Category;
