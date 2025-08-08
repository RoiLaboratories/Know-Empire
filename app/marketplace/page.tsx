import Button from "../../ui/Button";

function MarketPage() {
  return (
    <div className="flex justify-center items-center h-screen">
      <div className="w-9/10 max-w-lg flex flex-col justify-between items-center space-y-2">
        Market
        <Button>Text</Button>
        <Button variant="primary_gradient">Buy now</Button>
        <Button variant="success">Confirmed</Button>
        <Button variant="secondary">Raise a Dispute</Button>
        <Button variant="warning">Raise a Dispute</Button>
        <Button variant="tertiary">Raise a Dispute</Button>
      </div>
    </div>
  );
}

export default MarketPage;
