"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/src/components/ui/button";
import {
  User,
  Mail,
  MapPin,
  Phone,
  Package,
  Heart,
  Settings,
  LogOut,
  Edit2,
} from "lucide-react";
import { motion } from "framer-motion";
import { useI18n } from "@/src/components/providers/i18n-provider";
import { useAuth } from "@/src/lib/auth-context";

export default function AccountPage() {
  const router = useRouter();
  const { t } = useI18n();
  const { user, isLoggedIn, logout, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<"profile" | "orders" | "wishlist" | "settings">(
    "profile"
  );
  const [isEditing, setIsEditing] = useState(false);
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });

  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      router.push("/login");
    } else if (user) {
      setUserData({
        name: user.name,
        email: user.email,
        phone: user.phone || "+971 50 XXX XXXX",
        address: user.address || "Dubai, UAE",
      });
    }
  }, [isLoggedIn, isLoading, user, router]);

  const orders = [
    {
      id: "ORD-001",
      date: "Dec 15, 2024",
      items: "Kashmiri Red Chilli Powder",
      total: "AED 149",
      status: "Delivered",
    },
    {
      id: "ORD-002",
      date: "Dec 10, 2024",
      items: "Premium Honey",
      total: "AED 199",
      status: "Processing",
    },
    {
      id: "ORD-003",
      date: "Dec 5, 2024",
      items: "Himalayan Shilajit",
      total: "AED 299",
      status: "Shipped",
    },
  ];

  const wishlistItems = [
    {
      id: 1,
      name: "Premium Saffron",
      price: "AED 399",
      image: "/images/products/saffron.jpg",
    },
    {
      id: 2,
      name: "Organic Honey",
      price: "AED 199",
      image: "/images/products/honey.jpg",
    },
    {
      id: 3,
      name: "Kashmiri Red Chilli Powder",
      price: "AED 149",
      image: "/images/products/chillipowder.jpg",
    },
  ];

  const handleUpdateProfile = () => {
    setIsEditing(false);
    // Handle profile update
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  };

  return (
    <div className="w-full bg-white overflow-x-hidden">
      {/* Loading state */}
      {isLoading && (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-gray-200 border-t-[#009744] rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your account...</p>
          </div>
        </div>
      )}

      {!isLoading && isLoggedIn && (
        <>
      {/* Breadcrumb */}
      <div className="bg-gray-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Link href="/" className="hover:text-[#009744] transition-colors">
              {t("common.home")}
            </Link>
            <span className="text-gray-400">/</span>
            <span className="text-gray-900 font-medium">Account</span>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="bg-gradient-to-r from-[#009744] to-[#00803a] text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center gap-4"
          >
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold">
                {userData.name}
              </h1>
              <p className="text-white/90">{userData.email}</p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 border-b border-gray-200">
        <div className="flex gap-8 overflow-x-auto">
          {[
            { id: "profile", label: "Profile", icon: User },
            { id: "orders", label: "Orders", icon: Package },
            { id: "wishlist", label: "Wishlist", icon: Heart },
            { id: "settings", label: "Settings", icon: Settings },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-4 font-medium border-b-2 transition-all whitespace-nowrap flex items-center gap-2 ${
                activeTab === tab.id
                  ? "border-[#009744] text-[#009744]"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              <tab.icon size={18} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Profile Tab */}
        {activeTab === "profile" && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-8"
          >
            <motion.div
              variants={itemVariants}
              className="bg-white border border-gray-200 rounded-lg p-8"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Profile Information</h2>
                {!isEditing && (
                  <Button
                    onClick={() => setIsEditing(true)}
                    className="bg-[#009744] hover:bg-[#007A37] text-white flex items-center gap-2"
                  >
                    <Edit2 size={16} />
                    Edit Profile
                  </Button>
                )}
              </div>

              {isEditing ? (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#009744] focus:border-transparent outline-none transition"
                      value={userData.name}
                      onChange={(e) =>
                        setUserData({ ...userData, name: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#009744] focus:border-transparent outline-none transition"
                      value={userData.email}
                      onChange={(e) =>
                        setUserData({ ...userData, email: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#009744] focus:border-transparent outline-none transition"
                      value={userData.phone}
                      onChange={(e) =>
                        setUserData({ ...userData, phone: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Address
                    </label>
                    <textarea
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#009744] focus:border-transparent outline-none transition resize-none"
                      value={userData.address}
                      onChange={(e) =>
                        setUserData({ ...userData, address: e.target.value })
                      }
                    />
                  </div>
                  <div className="flex gap-4">
                    <Button
                      onClick={handleUpdateProfile}
                      className="bg-[#009744] hover:bg-[#007A37] text-white font-semibold px-8 py-2 rounded-lg"
                    >
                      Save Changes
                    </Button>
                    <Button
                      onClick={() => setIsEditing(false)}
                      className="bg-gray-200 hover:bg-gray-300 text-gray-900 font-semibold px-8 py-2 rounded-lg"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-start gap-4 pb-4 border-b border-gray-200">
                    <Mail className="w-5 h-5 text-[#009744] mt-1" />
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="font-medium text-gray-900">{userData.email}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 pb-4 border-b border-gray-200">
                    <Phone className="w-5 h-5 text-[#009744] mt-1" />
                    <div>
                      <p className="text-sm text-gray-600">Phone Number</p>
                      <p className="font-medium text-gray-900">{userData.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <MapPin className="w-5 h-5 text-[#009744] mt-1" />
                    <div>
                      <p className="text-sm text-gray-600">Address</p>
                      <p className="font-medium text-gray-900">{userData.address}</p>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}

        {/* Orders Tab */}
        {activeTab === "orders" && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Order History</h2>
            {orders.map((order, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-3">
                      <span className="font-semibold text-gray-900">{order.id}</span>
                      <span
                        className={`px-3 py-1 text-sm rounded-full font-medium ${
                          order.status === "Delivered"
                            ? "bg-green-100 text-green-800"
                            : order.status === "Shipped"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {order.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{order.items}</p>
                    <p className="text-xs text-gray-500">{order.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900 mb-2">
                      {order.total}
                    </p>
                    <Button className="bg-[#009744] hover:bg-[#007A37] text-white text-sm px-4 py-2 rounded-lg">
                      View Details
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Wishlist Tab */}
        {activeTab === "wishlist" && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">My Wishlist</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {wishlistItems.map((item, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="h-48 bg-gray-200 relative">
                    <Heart className="w-6 h-6 text-red-500 absolute top-3 right-3 fill-red-500" />
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-2">{item.name}</h3>
                    <p className="text-[#009744] font-bold text-lg mb-4">{item.price}</p>
                    <div className="flex gap-2">
                      <Button className="flex-1 bg-[#009744] hover:bg-[#007A37] text-white rounded-lg py-2">
                        Add to Cart
                      </Button>
                      <Button className="flex-1 border border-gray-300 text-gray-900 hover:bg-gray-50 rounded-lg py-2">
                        Remove
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Settings Tab */}
        {activeTab === "settings" && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Settings</h2>

            <motion.div
              variants={itemVariants}
              className="bg-white border border-gray-200 rounded-lg p-6"
            >
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Mail size={20} className="text-[#009744]" />
                Notifications
              </h3>
              <div className="space-y-3">
                {[
                  "Order updates",
                  "Promotional emails",
                  "New product launches",
                  "Special offers",
                ].map((item, i) => (
                  <label key={i} className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      defaultChecked
                      className="w-4 h-4 rounded border-gray-300 text-[#009744]"
                    />
                    <span className="text-gray-700">{item}</span>
                  </label>
                ))}
              </div>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="bg-white border border-gray-200 rounded-lg p-6"
            >
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Settings size={20} className="text-[#009744]" />
                Privacy & Security
              </h3>
              <div className="space-y-3">
                <Button className="w-full border border-gray-300 text-gray-900 hover:bg-gray-50 py-2 rounded-lg">
                  Change Password
                </Button>
                <Button className="w-full border border-gray-300 text-gray-900 hover:bg-gray-50 py-2 rounded-lg">
                  Two-Factor Authentication
                </Button>
              </div>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="bg-white border border-gray-200 rounded-lg p-6"
            >
              <h3 className="font-semibold text-gray-900 mb-4">Danger Zone</h3>
              <Button
                onClick={() => {
                  logout();
                  router.push("/");
                }}
                className="bg-[#AB1F23] hover:bg-[#8a1819] text-white font-semibold px-6 py-2 rounded-lg flex items-center gap-2"
              >
                <LogOut size={18} />
                Logout
              </Button>
            </motion.div>
          </motion.div>
        )}
      </div>
        </>
      )}
    </div>
  );
}
