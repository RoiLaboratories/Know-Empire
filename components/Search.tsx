import { Icon } from "@iconify/react";
import { ICON } from "../utils/icon-export";

function Search({ placeholder }: { placeholder?: string }) {
  return (
    <div className="relative flex w-[95%] mx-auto">
      <Icon
        icon={ICON.SEARCH}
        fontSize={22}
        className="absolute left-2 text-[#989898] top-1/2 -translate-y-1/2"
      />
      <input
        type="text"
        placeholder={` ${placeholder ? placeholder : "Search Products.."}`}
        className="focus:outline-none ring-1 ring-[#989898] px-10 py-2 rounded-md text-xs flex-1 focus:shadow-md duration-200 ease-in-out"
      />
    </div>
  );
}

export default Search;
