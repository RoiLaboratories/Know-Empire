export const getStatusColor = (status: string) => {
  switch (status) {
    case "shipped":
      return "bg-blue-100 text-blue-600";
    case "pending":
      return "bg-yellow-100 text-yellow-600";
    case "Errored":
      return "text-error";
    case "Completed":
      return "text-success";
    case "Processing":
      return "text-amber";
    case "Incomplete":
      return "text-amber";
    default:
      return "text-black";
  }
};

export const sleep = (time: number) =>
  new Promise((res) => setTimeout(res, time));

export async function copyToClipboard(text: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(text);
    // toast.success("Copied to clipboard!");
    console.log("Text copied to clipboard!");
  } catch (err) {
    console.error("Failed to copy text: ", err);
    // toast.error("Failed to copy");
  }
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("en", {
    style: "currency",
    currency: "USD",
  }).format(value);
}
