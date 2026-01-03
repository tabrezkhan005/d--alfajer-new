// Mock data for admin panel

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  status: "active" | "draft" | "archived";
  image: string;
  sku: string;
}

export interface Order {
  id: string;
  customerName: string;
  email: string;
  total: number;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  date: string;
  items: number;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  totalOrders: number;
  totalSpent: number;
  status: "active" | "inactive";
  joinDate: string;
}

export const mockProducts: Product[] = [
  {
    id: "1",
    name: "Organic Honey 500g",
    category: "Food & Beverages",
    price: 24.99,
    stock: 45,
    status: "active",
    image: "/images/product-1.jpg",
    sku: "HNY-500-001",
  },
  {
    id: "2",
    name: "Premium Coffee Beans",
    category: "Food & Beverages",
    price: 32.50,
    stock: 12,
    status: "active",
    image: "/images/product-2.jpg",
    sku: "COF-250-002",
  },
  {
    id: "3",
    name: "Natural Soap Bar",
    category: "Personal Care",
    price: 8.99,
    stock: 0,
    status: "draft",
    image: "/images/product-3.jpg",
    sku: "SOAP-100-003",
  },
  {
    id: "4",
    name: "Bamboo Toothbrush",
    category: "Personal Care",
    price: 6.50,
    stock: 78,
    status: "active",
    image: "/images/product-4.jpg",
    sku: "BRUSH-001-004",
  },
  {
    id: "5",
    name: "Reusable Water Bottle",
    category: "Accessories",
    price: 18.99,
    stock: 23,
    status: "active",
    image: "/images/product-5.jpg",
    sku: "BTL-500-005",
  },
];

export const mockOrders: Order[] = [
  {
    id: "ORD-001",
    customerName: "John Doe",
    email: "john@example.com",
    total: 89.47,
    status: "pending",
    date: "2024-01-15",
    items: 3,
  },
  {
    id: "ORD-002",
    customerName: "Jane Smith",
    email: "jane@example.com",
    total: 156.23,
    status: "shipped",
    date: "2024-01-14",
    items: 5,
  },
  {
    id: "ORD-003",
    customerName: "Bob Johnson",
    email: "bob@example.com",
    total: 45.99,
    status: "delivered",
    date: "2024-01-13",
    items: 2,
  },
  {
    id: "ORD-004",
    customerName: "Alice Williams",
    email: "alice@example.com",
    total: 234.56,
    status: "processing",
    date: "2024-01-15",
    items: 8,
  },
  {
    id: "ORD-005",
    customerName: "Charlie Brown",
    email: "charlie@example.com",
    total: 67.89,
    status: "delivered",
    date: "2024-01-12",
    items: 4,
  },
];

export const mockCustomers: Customer[] = [
  {
    id: "CUST-001",
    name: "John Doe",
    email: "john@example.com",
    totalOrders: 12,
    totalSpent: 1245.67,
    status: "active",
    joinDate: "2023-06-15",
  },
  {
    id: "CUST-002",
    name: "Jane Smith",
    email: "jane@example.com",
    totalOrders: 8,
    totalSpent: 892.34,
    status: "active",
    joinDate: "2023-08-22",
  },
  {
    id: "CUST-003",
    name: "Bob Johnson",
    email: "bob@example.com",
    totalOrders: 3,
    totalSpent: 156.78,
    status: "inactive",
    joinDate: "2023-11-10",
  },
];

export const mockSalesData = [
  { month: "Jan", sales: 12500 },
  { month: "Feb", sales: 18900 },
  { month: "Mar", sales: 15200 },
  { month: "Apr", sales: 22100 },
  { month: "May", sales: 19800 },
  { month: "Jun", sales: 24500 },
];
