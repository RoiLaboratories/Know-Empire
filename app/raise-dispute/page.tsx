import { Icon } from "@iconify/react";
import { ICON } from "../../utils/icon-export";
import DisputeForm from "../../components/form/DisputeForm";

function Page() {
  return (
    <section className="flex flex-col items-center min-h-screen pb-3">
      <div className="w-9/10 max-w-lg flex flex-col gap-y-3 py-3">
        <div className="flex items-center gap-x-2">
          <Icon icon={ICON.CAUTION2} fontSize={26} color="#f87b14" />
          <p className="text-xs md:text-sm font-medium">Raise a dispute</p>
        </div>

        <div className="bg-white rounded-md p-2 space-y-2">
          <div className="border border-[#fee7cb] bg-[#fffaec] p-5 text-sm font-medium  text-[#1f2937] rounded-md space-y-1 ">
            <p className="italic">Gaming Laptop- RTX 4080 </p>
            <p className="text-xs">Seller: @gamepro</p>
            <p className="text-xs">
              Order:{" "}
              <span className="rounded-full bg-[#f4f2f8] py-[2px] text-[10px] px-2">
                #3
              </span>
            </p>
          </div>

          {/*form */}
          <DisputeForm />
        </div>
      </div>
    </section>
  );
}

export default Page;
