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
  AlertCircle,
  Loader2,
} from "lucide-react";
import { motion } from "framer-motion";
import { useI18n } from "@/src/components/providers/i18n-provider";
import { LanguageSelector } from "@/src/components/announcement-bar/LanguageSelector";
import { CurrencySelector } from "@/src/components/announcement-bar/CurrencySelector";
import { useAuth } from "@/src/lib/auth-context";
import { useWishlistStore, type WishlistItem } from "@/src/lib/wishlist-store";
import {
  getUserOrders,
  requestOrderReturn,
  type OrderWithItems
} from "@/src/lib/supabase/orders";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/src/components/ui/dialog";
import { Textarea } from "@/src/components/ui/textarea";

export default function AccountPage() {
  const router = useRouter();
  const { user, isLoggedIn, logout, isLoading: authLoading } = useAuth();
  const { language, setLanguage, currency, setCurrency, t } = useI18n();
  const { items: wishlistItems, removeItem: removeFromWishlist } = useWishlistStore();

  const [activeTab, setActiveTab] = useState<"profile" | "orders" | "wishlist">("profile");
  const [isEditing, setIsEditing] = useState(false);
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });

  const [userOrders, setUserOrders] = useState<OrderWithItems[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<OrderWithItems | null>(null);
  const [showOrderModal, setShowOrderModal] = useState(false);

  // Return functionality
  const [showReturnDialog, setShowReturnDialog] = useState(false);
  const [returnReason, setReturnReason] = useState("");
  const [isSubmittingReturn, setIsSubmittingReturn] = useState(false);

  useEffect(() => {
    if (!authLoading && !isLoggedIn) {
      router.push("/login");
    } else if (user) {
      setUserData({
        name: user.name,
        email: user.email,
        phone: user.phone || "",
        address: user.address || "",
      });

      // Get user's orders from Supabase
      const fetchOrders = async () => {
        setOrdersLoading(true);
        try {
          const orders = await getUserOrders(user.id);
          setUserOrders(orders);
        } catch (error) {
          console.error("Failed to fetch orders", error);
          toast.error("Failed to load your orders");
        } finally {
          setOrdersLoading(false);
        }
      };

      fetchOrders();
    }
  }, [isLoggedIn, authLoading, user, router]);

  const handleUpdateProfile = () => {
    // In a real app, you would update this in Supabase
    // For now, we'll just update local state and show a toast
    toast.success("Profile updated successfully");
    setIsEditing(false);
  };

  const handleViewOrderDetails = (order: OrderWithItems) => {
    setSelectedOrder(order);
    setShowOrderModal(true);
  };

  const handleCloseOrderModal = () => {
    setShowOrderModal(false);
    setTimeout(() => setSelectedOrder(null), 300);
  };

  const handleRequestReturn = () => {
    setShowReturnDialog(true);
  };

  const submitReturnRequest = async () => {
    if (!selectedOrder) return;
    if (!returnReason.trim()) {
      toast.error("Please provide a reason for the return");
      return;
    }

    setIsSubmittingReturn(true);
    try {
      const success = await requestOrderReturn(selectedOrder.id, returnReason);
      if (success) {
        toast.success("Return request submitted successfully");
        setShowReturnDialog(false);
        setReturnReason("");
        // Refresh orders
        const orders = await getUserOrders(user!.id);
        setUserOrders(orders);

        // Update selected order or close modal
        const updatedOrder = orders.find(o => o.id === selectedOrder.id);
        if (updatedOrder) {
          setSelectedOrder(updatedOrder);
        }
      } else {
        toast.error("Failed to submit return request");
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred");
    } finally {
      setIsSubmittingReturn(false);
    }
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

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="w-full bg-white overflow-x-hidden">
      {/* Loading state */}
      {authLoading && (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-gray-200 border-t-[#009744] rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">{t('account.loading')}</p>
          </div>
        </div>
      )}

      {!authLoading && isLoggedIn && (
        <>
          {/* Language & Currency Selector */}
          <div className="bg-white border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4 flex justify-end gap-3">
              <LanguageSelector language={language} onLanguageChange={setLanguage} />
              <CurrencySelector currency={currency} onCurrencyChange={setCurrency} />
            </div>
          </div>

          {/* Breadcrumb */}
          <div className="bg-gray-50 border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 py-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Link href="/" className="hover:text-[#009744] transition-colors">
                  {t("common.home")}
                </Link>
                <span className="text-gray-400">/</span>
                <span className="text-gray-900 font-medium">
                  {activeTab === "profile" && t('account.profile')}
                  {activeTab === "orders" && t('account.orders')}
                  {activeTab === "wishlist" && t('account.wishlist')}
                </span>
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
                { id: "profile", label: t("account.profile"), icon: User },
                { id: "orders", label: t("account.orders"), icon: Package },
                { id: "wishlist", label: t("account.wishlist"), icon: Heart },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-4 py-4 font-medium border-b-2 transition-all whitespace-nowrap flex items-center gap-2 ${activeTab === tab.id
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
                <div className="bg-white border border-gray-200 rounded-lg p-8">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">{t('account.editProfile')}</h2>
                    {!isEditing && (
                      <Button
                        onClick={() => setIsEditing(true)}
                        className="bg-[#009744] hover:bg-[#007A37] text-white flex items-center gap-2"
                      >
                        <Edit2 size={16} />
                        {t('account.editProfile')}
                      </Button>
                    )}
                  </div>

                  {isEditing ? (
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {t('account.name')}
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
                          {t('account.email')}
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
                          {t('account.phone')}
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
                          {t('account.address')}
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
                          {t('account.saveChanges')}
                        </Button>
                        <Button
                          onClick={() => setIsEditing(false)}
                          className="bg-gray-200 hover:bg-gray-300 text-gray-900 font-semibold px-8 py-2 rounded-lg"
                        >
                          {t('common.cancel')}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-start gap-4 pb-4 border-b border-gray-200">
                        <Mail className="w-5 h-5 text-[#009744] mt-1" />
                        <div>
                          <p className="text-sm text-gray-600">{t('account.email')}</p>
                          <p className="font-medium text-gray-900">{userData.email}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-4 pb-4 border-b border-gray-200">
                        <Phone className="w-5 h-5 text-[#009744] mt-1" />
                        <div>
                          <p className="text-sm text-gray-600">{t('account.phone')}</p>
                          <p className="font-medium text-gray-900">{userData.phone || 'Not provided'}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-4">
                        <MapPin className="w-5 h-5 text-[#009744] mt-1" />
                        <div>
                          <p className="text-sm text-gray-600">{t('account.address')}</p>
                          <p className="font-medium text-gray-900">{userData.address || 'Not provided'}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
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
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">{t('account.orders')}</h2>
                </div>

                {ordersLoading ? (
                   <div className="flex justify-center p-12">
                     <Loader2 className="w-8 h-8 animate-spin text-[#009744]" />
                   </div>
                ) : userOrders && userOrders.length > 0 ? (
                  userOrders.map((order) => (
                    <motion.div
                      key={order.id}
                      variants={itemVariants}
                      className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                    >
                      <div className="p-6">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6 pb-6 border-b border-gray-200">
                          <div className="flex-1">
                            <div className="flex items-center gap-4 mb-3">
                              <span className="font-semibold text-gray-900 text-lg">
                                {order.order_number || order.id.slice(0, 8)}
                              </span>
                              <span
                                className={`px-3 py-1 text-sm rounded-full font-medium capitalize ${
                                  order.status === "delivered"
                                    ? "bg-green-100 text-green-800"
                                    : order.status === "shipped"
                                      ? "bg-blue-100 text-blue-800"
                                      : order.status === "cancelled" || order.status === "return_rejected"
                                        ? "bg-red-100 text-red-800"
                                        : order.status === "returned" || order.status === "return_requested"
                                          ? "bg-purple-100 text-purple-800"
                                          : "bg-yellow-100 text-yellow-800"
                                  }`}
                              >
                                {(order.status || "pending").replace('_', ' ')}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600">{t('account.orderDate')}: {formatDate(order.created_at)}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-gray-900 mb-2">
                              AED {Number(order.total || 0).toFixed(2)}
                            </p>
                          </div>
                        </div>

                        {/* Order Items Preview */}
                        <div className="space-y-4 mb-6">
                           <h3 className="font-semibold text-gray-900 text-sm uppercase tracking-wider">{t('account.orderDetails')}</h3>
                           <div className="space-y-3">
                             {order.items?.slice(0, 2).map((item, itemIndex) => (
                               <div
                                 key={`${order.id}-item-${itemIndex}`}
                                 className="flex gap-4 p-3 bg-gray-50 rounded-lg border border-gray-200"
                               >
                                 <div className="flex-1">
                                   <h4 className="font-semibold text-gray-900 mb-1">{item.name}</h4>
                                   <div className="flex items-center justify-between">
                                     <span className="text-sm text-gray-600">
                                       {t('account.quantity')}: <span className="font-semibold">{item.quantity}</span>
                                     </span>
                                     <span className="font-semibold text-[#009744]">
                                       AED {((item.price || 0) * item.quantity).toFixed(2)}
                                     </span>
                                   </div>
                                 </div>
                               </div>
                             ))}
                             {order.items && order.items.length > 2 && (
                               <p className="text-sm text-gray-500 italic">+ {order.items.length - 2} more items</p>
                             )}
                           </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2 pt-4 border-t border-gray-200">
                          <Button
                            onClick={() => handleViewOrderDetails(order)}
                            className="bg-[#009744] hover:bg-[#007A37] text-white px-4 py-2 rounded-lg"
                          >
                            {t('account.viewDetails')}
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600 text-lg">{t('account.noOrders')}</p>
                    <Link href="/shop">
                      <Button className="mt-4 bg-[#009744] hover:bg-[#007A37] text-white px-6 py-2 rounded-lg">
                        {t('common.allProducts')}
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
                <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('account.wishlist')}</h2>
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
                              {t('account.addToCart')}
                            </Button>
                            <Button
                              onClick={() => removeFromWishlist(item.id)}
                              className="flex-1 border border-red-300 text-red-700 hover:bg-red-50 rounded-lg py-2 flex items-center justify-center gap-1"
                            >
                              <Trash2 size={16} />
                              {t('account.removeFromWishlist')}
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600 text-lg">{t('account.emptyWishlist')}</p>
                    <Link href="/shop">
                      <Button className="mt-4 bg-[#009744] hover:bg-[#007A37] text-white px-6 py-2 rounded-lg">
                        {t('common.allProducts')}
                      </Button>
                    </Link>
                  </div>
                )}
              </motion.div>
            )}

            {/* Logout Section */}
            <div className="mt-8 border-t pt-8">
              <Button
                onClick={() => {
                  logout();
                  router.push("/");
                }}
                className="bg-[#AB1F23] hover:bg-[#8a1819] text-white font-semibold px-6 py-2 rounded-lg flex items-center gap-2"
              >
                <LogOut size={18} />
                {t('account.logout')}
              </Button>
            </div>
          </div>

          {/* Order Details Modal */}
          {showOrderModal && selectedOrder && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={handleCloseOrderModal}>
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              >
                <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">{t('account.orderDetails')}</h2>
                  <button onClick={handleCloseOrderModal} className="text-gray-500 hover:text-gray-700">
                    <X size={24} />
                  </button>
                </div>

                <div className="p-6 space-y-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">{t('account.orderDate')}</p>
                      <p className="font-semibold text-gray-900">{formatDate(selectedOrder.created_at)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">{t('account.orderStatus')}</p>
                      <span className="font-semibold capitalize text-gray-900">
                        {(selectedOrder.status || "pending").replace('_', ' ')}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Total</p>
                      <p className="font-semibold text-lg text-[#009744]">
                        AED {Number(selectedOrder.total || 0).toFixed(2)}
                      </p>
                    </div>
                  </div>

                  {/* Return Button */}
                  {selectedOrder.status === 'delivered' && (
                     <div className="bg-gray-50 p-4 rounded-lg flex items-center justify-between">
                       <div>
                         <h4 className="font-medium">Need to return items?</h4>
                         <p className="text-sm text-gray-600">You can request a return within 7 days of delivery.</p>
                       </div>
                       <Button onClick={handleRequestReturn} variant="outline" className="border-gray-300">
                         Request Return
                       </Button>
                     </div>
                  )}

                  {/* Status if return requested */}
                  {(selectedOrder.status === 'return_requested' || selectedOrder.status === 'returned' || selectedOrder.status === 'return_rejected') && (
                    <div className={`p-4 rounded-lg flex items-start gap-3 ${
                      selectedOrder.status === 'return_rejected' ? 'bg-red-50 text-red-800' : 'bg-blue-50 text-blue-800'
                    }`}>
                      <AlertCircle className="w-5 h-5 mt-0.5" />
                      <div>
                        <h4 className="font-medium capitalize">{selectedOrder.status.replace('_', ' ')}</h4>
                        {selectedOrder.notes && <p className="text-sm mt-1">{selectedOrder.notes}</p>}
                      </div>
                    </div>
                  )}

                  <div className="border-t pt-6">
                    <h3 className="font-semibold text-gray-900 mb-4 text-lg">{t('account.orderDetails')}</h3>
                    <div className="space-y-4">
                      {selectedOrder.items?.map((item, index) => (
                        <div key={index} className="flex gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                          {item.image_url && (
                             <img src={item.image_url} alt={item.name || ""} className="w-20 h-20 object-cover rounded-md bg-white" />
                          )}
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900">{item.name}</h4>
                            <div className="flex justify-between mt-2">
                              <span>Qty: {item.quantity}</span>
                              <span className="font-medium">AED {((item.price || 0) * item.quantity).toFixed(2)}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="border-t pt-6">
                     <div className="flex justify-between items-center mb-2">
                       <span className="text-gray-600">Subtotal</span>
                       <span>AED {Number(selectedOrder.subtotal || 0).toFixed(2)}</span>
                     </div>
                     <div className="flex justify-between items-center mb-2">
                       <span className="text-gray-600">Shipping</span>
                       <span>AED {Number(selectedOrder.shipping_cost || 0).toFixed(2)}</span>
                     </div>
                     <div className="flex justify-between items-center font-bold text-lg pt-2 border-t mt-2">
                       <span>Total</span>
                       <span className="text-[#009744]">AED {Number(selectedOrder.total || 0).toFixed(2)}</span>
                     </div>
                  </div>
                </div>
              </motion.div>
            </div>
          )}

          {/* Return Request Dialog */}
          <Dialog open={showReturnDialog} onOpenChange={setShowReturnDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Request Return</DialogTitle>
                <DialogDescription>
                  Please tell us why you want to return this order.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <Textarea
                  placeholder="Reason for return..."
                  value={returnReason}
                  onChange={(e) => setReturnReason(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowReturnDialog(false)} disabled={isSubmittingReturn}>
                  Cancel
                </Button>
                <Button onClick={submitReturnRequest} disabled={isSubmittingReturn || !returnReason.trim()}>
                  {isSubmittingReturn && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Submit Request
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  );
}
