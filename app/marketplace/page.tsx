import { Suspense } from "react";
import Category from "../../components/Category";
import Header from "../../components/layout/Header";
import Tab from "../../components/layout/Tab";
import Search from "../../components/Search";
import Products from "../../components/products";

//justify-center py-3

function MarketPage() {
  return (
    <div className="space-y-3">
      {/*tab */}
      <Tab
        name="Marketplace"
        description="Discover and buy products securely"
      />

      {/*search */}
      <Search />

      {/*category */}
      <Suspense fallback={<div className="animate-pulse h-24 bg-gray-100 rounded-lg"></div>}>
        <Category />
      </Suspense>

      {/*curated */}
      <Suspense fallback={<div className="animate-pulse grid grid-cols-2 gap-2">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="aspect-square bg-gray-100 rounded-lg"></div>
        ))}
      </div>}>
        <Products />
      </Suspense>
    </div>
  );
}

export default MarketPage;
