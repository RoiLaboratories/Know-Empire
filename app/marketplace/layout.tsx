import Header from "../../components/layout/Header";

function MaketPlacelayout({ children }: { children: React.ReactNode }) {
  return (
    <section className="flex flex-col items-center min-h-screen pt-3 px-3">
      <div className="w-full max-w-lg flex flex-col flex-1">
        <Header />

        {/*market place */}
        <div className="bg-white rounded-t-xl pt-5 flex flex-col gap-y-3 pb-3 px-3">
          {children}
          {/* <Tab
            name="Marketplace"
            description="Discover and buy products securely"
          />

          <Search />

          <Category /> */}
        </div>
      </div>
    </section>
  );
}

export default MaketPlacelayout;
