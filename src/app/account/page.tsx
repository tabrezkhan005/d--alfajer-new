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
  LogOut,
  Edit2,
  Trash2,
  X,
} from "lucide-react";
import { motion } from "framer-motion";
import { useI18n } from "@/src/components/providers/i18n-provider";
import { useAuth } from "@/src/lib/auth-context";
import { useWishlistStore, type WishlistItem } from "@/src/lib/wishlist-store";
import { useOrders } from "@/src/lib/orders-store";

export default function AccountPage() {
  const router = useRouter();
  const { t } = useI18n();
  const { user, isLoggedIn, logout, isLoading } = useAuth();
  const { items: wishlistItems, removeItem: removeFromWishlist } = useWishlistStore();
  const { getOrdersByUser, removeOrder } = useOrders();
  const [activeTab, setActiveTab] = useState<"profile" | "orders" | "wishlist">(
    "profile"
  );
  const [isEditing, setIsEditing] = useState(false);
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });
  const [userOrders, setUserOrders] = useState<any[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [showOrderModal, setShowOrderModal] = useState(false);

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
      // Get user's orders
      const orders = getOrdersByUser(user.id);
      setUserOrders(orders);
    }
  }, [isLoggedIn, isLoading, user, router, getOrdersByUser]);

  const handleUpdateProfile = () => {
    // Update user in localStorage
    const updatedUser = {
      ...user,
      ...userData,
    };
    localStorage.setItem("user", JSON.stringify(updatedUser));
    setIsEditing(false);
  };

  const handleViewOrderDetails = (order: any) => {
    setSelectedOrder(order);
    setShowOrderModal(true);
  };

  const handleCloseOrderModal = () => {
    setShowOrderModal(false);
    setTimeout(() => setSelectedOrder(null), 300);
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
      <div className="bg-gradient-to-r from-[#009744] to-[#00803a] text-white py-12 pt-16 sm:pt-20 lg:pt-24">
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
            {userOrders && userOrders.length > 0 ? (
              userOrders.map((order, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6 pb-6 border-b border-gray-200">
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-3">
                          <span className="font-semibold text-gray-900 text-lg">{order.id}</span>
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
                        <p className="text-sm text-gray-600">{order.date}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-gray-900 mb-2">
                          AED {order.total.toFixed(2)}
                        </p>
                      </div>
                    </div>

                    {/* Order Items */}
                    <div className="space-y-4 mb-6">
                      <h3 className="font-semibold text-gray-900 text-sm uppercase tracking-wider">Items Ordered</h3>
                      {order.items && order.items.length > 0 ? (
                        <div className="space-y-3">
                          {order.items.map((item: any, itemIndex: number) => (
                            <div
                              key={itemIndex}
                              className="flex gap-4 p-3 bg-gray-50 rounded-lg border border-gray-200"
                            >
                              {item.image && (
                                <div className="w-24 h-24 flex-shrink-0 bg-gray-200 rounded-md overflow-hidden">
                                  <img
                                    src={item.image}
                                    alt={item.name}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              )}
                              <div className="flex-1">
                                <h4 className="font-semibold text-gray-900 mb-1">{item.name}</h4>
                                <p className="text-sm text-gray-600 mb-2">
                                  {item.packageSize && <span className="mr-3">{item.packageSize}</span>}
                                </p>
                                <div className="flex items-center justify-between">
                                  <span className="text-sm text-gray-600">
                                    Qty: <span className="font-semibold">{item.quantity}</span>
                                  </span>
                                  <span className="font-semibold text-[#009744]">
                                    AED {(item.price * item.quantity).toFixed(2)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-600 text-sm">No items in this order</p>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-4 border-t border-gray-200">
                      <Button
                        onClick={() => handleViewOrderDetails(order)}
                        className="flex-1 bg-[#009744] hover:bg-[#007A37] text-white px-4 py-2 rounded-lg"
                      >
                        View Details
                      </Button>
                      <Button
                        onClick={() => removeOrder(order.id)}
                        className="bg-red-100 hover:bg-red-200 text-red-700 px-4 py-2 rounded-lg"
                      >
                        Remove Order
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-12">
                <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 text-lg">No orders yet</p>
                <Link href="/shop">
                  <Button className="mt-4 bg-[#009744] hover:bg-[#007A37] text-white px-6 py-2 rounded-lg">
                    Start Shopping
                  </Button>
                </Link>
              </div>
            )}
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
            {wishlistItems && wishlistItems.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {wishlistItems.map((item: WishlistItem, index: number) => (
                  <motion.div
                    key={index}
                    variants={itemVariants}
                    className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    <div className="h-48 bg-gray-200 relative overflow-hidden">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-300">
                          <Heart className="w-12 h-12 text-gray-400" />
                        </div>
                      )}
                      <Heart className="w-6 h-6 text-red-500 absolute top-3 right-3 fill-red-500" />
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 mb-2">{item.name}</h3>
                      <div className="flex items-center justify-between mb-4">
                        <p className="text-[#009744] font-bold text-lg">
                          AED {item.price.toFixed(2)}
                        </p>
                        {item.rating && (
                          <div className="text-sm text-gray-600">
                            ★ {item.rating} ({item.reviews} reviews)
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button className="flex-1 bg-[#009744] hover:bg-[#007A37] text-white rounded-lg py-2">
                          Add to Cart
                        </Button>
                        <Button
                          onClick={() => removeFromWishlist(item.id)}
                          className="flex-1 border border-red-300 text-red-700 hover:bg-red-50 rounded-lg py-2 flex items-center justify-center gap-1"
                        >
                          <Trash2 size={16} />
                          Remove
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 text-lg">Your wishlist is empty</p>
                <Link href="/shop">
                  <Button className="mt-4 bg-[#009744] hover:bg-[#007A37] text-white px-6 py-2 rounded-lg">
                    Continue Shopping
                  </Button>
                </Link>
              </div>
            )}
          </motion.div>
        )}

        {/* Settings Tab - Logout */}
        <div className="mt-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-white border border-red-200 rounded-lg p-6 bg-red-50"
          >
            <h3 className="font-semibold text-gray-900 mb-4">Account Actions</h3>
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
        </div>
      </div>

      {/* Order Details Modal */}
      {showOrderModal && selectedOrder && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={handleCloseOrderModal}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Order Details</h2>
              <button
                onClick={handleCloseOrderModal}
                className="text-gray-500 hover:text-gray-700 transition"
              >
                <X size={24} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Order Header Info */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Order ID</p>
                  <p className="font-semibold text-gray-900">{selectedOrder.id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Order Date</p>
                  <p className="font-semibold text-gray-900">{selectedOrder.date}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Status</p>
                  <span
                    className={`inline-block px-3 py-1 text-sm rounded-full font-medium ${
                      selectedOrder.status === "Delivered"
                        ? "bg-green-100 text-green-800"
                        : selectedOrder.status === "Shipped"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {selectedOrder.status}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total</p>
                  <p className="font-semibold text-lg text-[#009744]">AED {selectedOrder.total.toFixed(2)}</p>
                </div>
              </div>

              {/* Ordered Items */}
              <div className="border-t pt-6">
                <h3 className="font-semibold text-gray-900 mb-4 text-lg">Items Ordered</h3>
                <div className="space-y-4">
                  {selectedOrder.items && selectedOrder.items.length > 0 ? (
                    selectedOrder.items.map((item: any, index: number) => (
                      <div
                        key={index}
                        className="flex gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200"
                      >
                        {item.image && (
                          <div className="w-28 h-28 flex-shrink-0 bg-gray-200 rounded-md overflow-hidden">
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 text-lg mb-2">{item.name}</h4>
                          {item.packageSize && (
                            <p className="text-sm text-gray-600 mb-2">Size: {item.packageSize}</p>
                          )}
                          <div className="grid grid-cols-3 gap-4 mt-3">
                            <div>
                              <p className="text-xs text-gray-600 uppercase tracking-wide">Unit Price</p>
                              <p className="font-semibold text-gray-900">AED {item.price.toFixed(2)}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-600 uppercase tracking-wide">Quantity</p>
                              <p className="font-semibold text-gray-900">{item.quantity}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-600 uppercase tracking-wide">Subtotal</p>
                              <p className="font-semibold text-[#009744]">AED {(item.price * item.quantity).toFixed(2)}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-600">No items in this order</p>
                  )}
                </div>
              </div>

              {/* Order Summary */}
              <div className="border-t pt-6">
                <h3 className="font-semibold text-gray-900 mb-4">Order Summary</h3>
                <div className="space-y-2 bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Subtotal</span>
                    <span className="font-semibold text-gray-900">AED {selectedOrder.total.toFixed(2)}</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between items-center">
                    <span className="text-lg font-semibold text-gray-900">Total</span>
                    <span className="text-xl font-bold text-[#009744]">AED {selectedOrder.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="border-t pt-6 flex gap-3">
                <Button
                  onClick={handleCloseOrderModal}
                  className="flex-1 border border-gray-300 text-gray-900 hover:bg-gray-50 py-3 rounded-lg font-semibold"
                >
                  Close
                </Button>
                <Button
                  className="flex-1 bg-[#009744] hover:bg-[#007A37] text-white py-3 rounded-lg font-semibold"
                >
                  Track Order
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
        </>
      )}
    </div>
  );
}
