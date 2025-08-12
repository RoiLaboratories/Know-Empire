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
