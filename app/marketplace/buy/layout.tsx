"use client";

function BuyFormLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-t-xl pt-5 flex flex-col gap-y-3 pb-3 px-3">
      {children}
    </div>
  );
}

export default BuyFormLayout;
