// Invoice status
export const getStatusColor = (status: string) => {
  switch (status) {
    case "paid":
      return "bg-green-100 text-green-800 hover:bg-green-100";
    case "pending":
      return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100";
    case "overdue":
      return "bg-red-100 text-red-800 hover:bg-red-100";
    case "draft":
      return "bg-gray-100 text-gray-800 hover:bg-gray-100";
    default:
      return "bg-gray-100 text-gray-800 hover:bg-gray-100";
  }
};

// Mock data for recent invoices
export const recentInvoices = [
  {
    id: "INV-001",
    client: "Acme Corp",
    amount: "$2,500.00",
    status: "paid",
    date: "2024-01-15",
  },
  {
    id: "INV-002",
    client: "TechStart Inc",
    amount: "$1,800.00",
    status: "pending",
    date: "2024-01-12",
  },
  {
    id: "INV-003",
    client: "Design Studio",
    amount: "$3,200.00",
    status: "overdue",
    date: "2024-01-08",
  },
  {
    id: "INV-004",
    client: "Marketing Pro",
    amount: "$950.00",
    status: "paid",
    date: "2024-01-05",
  },
  {
    id: "INV-005",
    client: "Web Solutions",
    amount: "$4,100.00",
    status: "draft",
    date: "2024-01-03",
  },
];
