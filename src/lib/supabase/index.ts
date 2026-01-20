// Supabase client exports
export { createClient } from "./client";
export { createClient as createServerClient, createAdminClient } from "./server";
export type { Database } from "@/src/lib/supabase/database.types";

// Product queries
export {
    getProducts,
    getProductBySlug,
    getProductById,
    searchProducts,
    getCategories,
    getCategoryBySlug,
    getFeaturedProducts,
    getSaleProducts,
    type ProductWithVariants,
} from "./products";

// Order queries
export {
    getUserOrders,
    getOrderById,
    getAllOrders,
    updateOrderStatus,
    updateTrackingNumber,
    getOrderStats,
    type OrderWithItems,
} from "./orders";

// Address queries
export {
    getAddresses,
    createAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
} from "./addresses";

// Admin queries
export {
    createProduct,
    updateProduct,
    deleteProduct,
    createVariant,
    updateVariant,
    deleteVariant,
    updateStock,
    getAdminProducts,
    uploadProductImage,
    deleteProductImage,
} from "./admin";

// Wishlist queries
export {
    getWishlist,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    syncWishlist,
    type WishlistWithProduct,
} from "./wishlist";

// Marketing queries
export {
    createGiftCard,
    getGiftCardByCode,
    applyGiftCard,
    getCustomerGiftCards,
    getLoyaltyPointsBalance,
    getLoyaltyPointsHistory,
    addLoyaltyPoints,
    redeemLoyaltyPoints,
    pointsToCurrency,
    currencyToPoints,
} from "./marketing";
