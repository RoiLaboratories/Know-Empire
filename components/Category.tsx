import Image from "next/image";
import Fashion from "../assets/images/fashion.png";
import Gadgets from "../assets/images/gadget.png";
import Sports from "../assets/images/sports.png";
import Books from "../assets/images/books.png";
import Home from "../assets/images/home.png";
import Session from "./Session";
import { useRouter, useSearchParams } from "next/navigation";

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
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentCategory = searchParams.get('category');

  const handleCategoryClick = (label: string) => {
    if (currentCategory === label) {
      // If clicking the same category, remove the filter
      router.push('/marketplace');
    } else {
      // Apply the category filter
      router.push(`/marketplace?category=${label}`);
    }
  };

  return (
    <Session title="Shop by category" link="See more">
      <ul className="flex justify-between gap-x-4 overflow-x-scroll scrollbar-hide">
        {categories.map(({ icon, label }) => (
          <li 
            className="flex flex-col items-center gap-2 cursor-pointer" 
            key={label}
            onClick={() => handleCategoryClick(label)}
          >
            <div className={`grid place-items-center size-14 rounded-full border border-primary ${
              currentCategory === label ? 'bg-primary/20' : 'bg-[#f8f2fe]'
            }`}>
              <Image
                loading="lazy"
                alt={`${label} category`}
                src={icon}
                placeholder="blur"
                className="object-cover"
              />
            </div>
            <p className={`text-xs ${
              currentCategory === label ? 'text-primary font-medium' : 'text-gray'
            }`}>{label}</p>
          </li>
        ))}
      </ul>
    </Session>
  );
}

export default Category;
