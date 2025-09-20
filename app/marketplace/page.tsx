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
      <Suspense>
        <Category />
      </Suspense>

      {/*curated */}
      <Suspense>
        <Products />
      </Suspense>
    </div>
  );
}

export default MarketPage;
