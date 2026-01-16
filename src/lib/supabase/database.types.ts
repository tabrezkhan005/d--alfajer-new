export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export type Database = {
    public: {
        Tables: {
            addresses: {
                Row: {
                    address_line1: string
                    address_line2: string | null
                    city: string
                    country: string
                    created_at: string | null
                    customer_id: string | null
                    full_name: string
                    id: string
                    is_default: boolean | null
                    phone: string
                    postal_code: string
                    state: string
                    type: string | null
                }
                Insert: {
                    address_line1: string
                    address_line2?: string | null
                    city: string
                    country: string
                    created_at?: string | null
                    customer_id?: string | null
                    full_name: string
                    id?: string
                    is_default?: boolean | null
                    phone: string
                    postal_code: string
                    state: string
                    type?: string | null
                }
                Update: {
                    address_line1?: string
                    address_line2?: string | null
                    city?: string
                    country?: string
                    created_at?: string | null
                    customer_id?: string | null
                    full_name?: string
                    id?: string
                    is_default?: boolean | null
                    phone?: string
                    postal_code?: string
                    state?: string
                    type?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "addresses_customer_id_fkey"
                        columns: ["customer_id"]
                        isOneToOne: false
                        referencedRelation: "customers"
                        referencedColumns: ["id"]
                    },
                ]
            }
            categories: {
                Row: {
                    created_at: string | null
                    description: string | null
                    id: string
                    image_url: string | null
                    name: string
                    parent_id: string | null
                    slug: string
                    updated_at: string | null
                }
                Insert: {
                    created_at?: string | null
                    description?: string | null
                    id?: string
                    image_url?: string | null
                    name: string
                    parent_id?: string | null
                    slug: string
                    updated_at?: string | null
                }
                Update: {
                    created_at?: string | null
                    description?: string | null
                    id?: string
                    image_url?: string | null
                    name?: string
                    parent_id?: string | null
                    slug?: string
                    updated_at?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "categories_parent_id_fkey"
                        columns: ["parent_id"]
                        isOneToOne: false
                        referencedRelation: "categories"
                        referencedColumns: ["id"]
                    },
                ]
            }
            coupons: {
                Row: {
                    code: string
                    created_at: string | null
                    discount_type: string
                    discount_value: number
                    end_date: string | null
                    id: string
                    is_active: boolean | null
                    min_cart_value: number | null
                    start_date: string | null
                    usage_count: number | null
                    usage_limit: number | null
                }
                Insert: {
                    code: string
                    created_at?: string | null
                    discount_type: string
                    discount_value: number
                    end_date?: string | null
                    id?: string
                    is_active?: boolean | null
                    min_cart_value?: number | null
                    start_date?: string | null
                    usage_count?: number | null
                    usage_limit?: number | null
                }
                Update: {
                    code?: string
                    created_at?: string | null
                    discount_type?: string
                    discount_value?: number
                    end_date?: string | null
                    id?: string
                    is_active?: boolean | null
                    min_cart_value?: number | null
                    start_date?: string | null
                    usage_count?: number | null
                    usage_limit?: number | null
                }
                Relationships: []
            }
            customers: {
                Row: {
                    created_at: string | null
                    email: string
                    first_name: string | null
                    id: string
                    last_name: string | null
                    phone: string | null
                    updated_at: string | null
                }
                Insert: {
                    created_at?: string | null
                    email: string
                    first_name?: string | null
                    id: string
                    last_name?: string | null
                    phone?: string | null
                    updated_at?: string | null
                }
                Update: {
                    created_at?: string | null
                    email?: string
                    first_name?: string | null
                    id?: string
                    last_name?: string | null
                    phone?: string | null
                    updated_at?: string | null
                }
                Relationships: []
            }
            gift_cards: {
                Row: {
                    code: string
                    created_at: string | null
                    currency: string | null
                    current_balance: number
                    expires_at: string | null
                    id: string
                    initial_balance: number
                    is_active: boolean | null
                    message: string | null
                    purchased_by: string | null
                    recipient_email: string | null
                    recipient_name: string | null
                    updated_at: string | null
                }
                Insert: {
                    code: string
                    created_at?: string | null
                    currency?: string | null
                    current_balance: number
                    expires_at?: string | null
                    id?: string
                    initial_balance: number
                    is_active?: boolean | null
                    message?: string | null
                    purchased_by?: string | null
                    recipient_email?: string | null
                    recipient_name?: string | null
                    updated_at?: string | null
                }
                Update: {
                    code?: string
                    created_at?: string | null
                    currency?: string | null
                    current_balance?: number
                    expires_at?: string | null
                    id?: string
                    initial_balance?: number
                    is_active?: boolean | null
                    message?: string | null
                    purchased_by?: string | null
                    recipient_email?: string | null
                    recipient_name?: string | null
                    updated_at?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "gift_cards_purchased_by_fkey"
                        columns: ["purchased_by"]
                        isOneToOne: false
                        referencedRelation: "customers"
                        referencedColumns: ["id"]
                    },
                ]
            }
            loyalty_points: {
                Row: {
                    created_at: string | null
                    customer_id: string
                    description: string | null
                    expires_at: string | null
                    id: string
                    order_id: string | null
                    points: number
                    type: string
                }
                Insert: {
                    created_at?: string | null
                    customer_id: string
                    description?: string | null
                    expires_at?: string | null
                    id?: string
                    order_id?: string | null
                    points: number
                    type: string
                }
                Update: {
                    created_at?: string | null
                    customer_id?: string
                    description?: string | null
                    expires_at?: string | null
                    id?: string
                    order_id?: string | null
                    points?: number
                    type?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "loyalty_points_customer_id_fkey"
                        columns: ["customer_id"]
                        isOneToOne: false
                        referencedRelation: "customers"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "loyalty_points_order_id_fkey"
                        columns: ["order_id"]
                        isOneToOne: false
                        referencedRelation: "orders"
                        referencedColumns: ["id"]
                    },
                ]
            }
            order_items: {
                Row: {
                    created_at: string | null
                    id: string
                    order_id: string | null
                    price: number
                    product_id: string | null
                    product_name: string
                    quantity: number
                    variant_id: string | null
                    variant_weight: string | null
                }
                Insert: {
                    created_at?: string | null
                    id?: string
                    order_id?: string | null
                    price: number
                    product_id?: string | null
                    product_name: string
                    quantity: number
                    variant_id?: string | null
                    variant_weight?: string | null
                }
                Update: {
                    created_at?: string | null
                    id?: string
                    order_id?: string | null
                    price?: number
                    product_id?: string | null
                    product_name?: string
                    quantity?: number
                    variant_id?: string | null
                    variant_weight?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "order_items_order_id_fkey"
                        columns: ["order_id"]
                        isOneToOne: false
                        referencedRelation: "orders"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "order_items_product_id_fkey"
                        columns: ["product_id"]
                        isOneToOne: false
                        referencedRelation: "products"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "order_items_variant_id_fkey"
                        columns: ["variant_id"]
                        isOneToOne: false
                        referencedRelation: "product_variants"
                        referencedColumns: ["id"]
                    },
                ]
            }
            orders: {
                Row: {
                    billing_address: Json | null
                    coupon_code: string | null
                    created_at: string | null
                    currency: string | null
                    discount_amount: number | null
                    id: string
                    notes: string | null
                    payment_method: string | null
                    payment_status: string | null
                    shipping_address: Json | null
                    shipping_cost: number | null
                    shipping_method: string | null
                    status: string | null
                    tax_amount: number | null
                    total_amount: number
                    gift_message: string | null
                    tracking_id: string | null
                    updated_at: string | null
                    user_id: string | null
                }
                Insert: {
                    billing_address?: Json | null
                    coupon_code?: string | null
                    created_at?: string | null
                    currency?: string | null
                    discount_amount?: number | null
                    id?: string
                    notes?: string | null
                    payment_method?: string | null
                    payment_status?: string | null
                    shipping_address?: Json | null
                    shipping_cost?: number | null
                    shipping_method?: string | null
                    status?: string | null
                    tax_amount?: number | null
                    total_amount: number
                    tracking_id?: string | null
                    updated_at?: string | null
                    user_id?: string | null
                }
                Update: {
                    billing_address?: Json | null
                    coupon_code?: string | null
                    created_at?: string | null
                    currency?: string | null
                    discount_amount?: number | null
                    id?: string
                    notes?: string | null
                    payment_method?: string | null
                    payment_status?: string | null
                    shipping_address?: Json | null
                    shipping_cost?: number | null
                    shipping_method?: string | null
                    status?: string | null
                    tax_amount?: number | null
                    total_amount?: number
                    tracking_id?: string | null
                    updated_at?: string | null
                    user_id?: string | null
                }
                Relationships: []
            }
            product_reviews: {
                Row: {
                    comment: string | null
                    created_at: string | null
                    customer_id: string | null
                    helpful_count: number | null
                    id: string
                    is_approved: boolean | null
                    is_verified_purchase: boolean | null
                    product_id: string
                    rating: number
                    title: string | null
                    updated_at: string | null
                }
                Insert: {
                    comment?: string | null
                    created_at?: string | null
                    customer_id?: string | null
                    helpful_count?: number | null
                    id?: string
                    is_approved?: boolean | null
                    is_verified_purchase?: boolean | null
                    product_id: string
                    rating: number
                    title?: string | null
                    updated_at?: string | null
                }
                Update: {
                    comment?: string | null
                    created_at?: string | null
                    customer_id?: string | null
                    helpful_count?: number | null
                    id?: string
                    is_approved?: boolean | null
                    is_verified_purchase?: boolean | null
                    product_id?: string
                    rating?: number
                    title?: string | null
                    updated_at?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "product_reviews_customer_id_fkey"
                        columns: ["customer_id"]
                        isOneToOne: false
                        referencedRelation: "customers"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "product_reviews_product_id_fkey"
                        columns: ["product_id"]
                        isOneToOne: false
                        referencedRelation: "products"
                        referencedColumns: ["id"]
                    },
                ]
            }
            product_variants: {
                Row: {
                    compare_at_price: number | null
                    created_at: string | null
                    id: string
                    price: number
                    product_id: string | null
                    sku: string
                    stock_quantity: number | null
                    updated_at: string | null
                    weight: string
                }
                Insert: {
                    compare_at_price?: number | null
                    created_at?: string | null
                    id?: string
                    price: number
                    product_id?: string | null
                    sku: string
                    stock_quantity?: number | null
                    updated_at?: string | null
                    weight: string
                }
                Update: {
                    compare_at_price?: number | null
                    created_at?: string | null
                    id?: string
                    price?: number
                    product_id?: string | null
                    sku?: string
                    stock_quantity?: number | null
                    updated_at?: string | null
                    weight?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "product_variants_product_id_fkey"
                        columns: ["product_id"]
                        isOneToOne: false
                        referencedRelation: "products"
                        referencedColumns: ["id"]
                    },
                ]
            }
            products: {
                Row: {
                    allergen_info: string | null
                    badge: string | null
                    base_price: number | null
                    category_id: string | null
                    certifications: string[] | null
                    created_at: string | null
                    description: string | null
                    id: string
                    images: string[] | null
                    ingredients: string | null
                    is_active: boolean | null
                    long_description: string | null
                    meta_description: string | null
                    name: string
                    nutrition_facts: Json | null
                    origin: string | null
                    original_price: number | null
                    rating: number | null
                    review_count: number | null
                    slug: string
                    updated_at: string | null
                }
                Insert: {
                    allergen_info?: string | null
                    badge?: string | null
                    base_price?: number | null
                    category_id?: string | null
                    certifications?: string[] | null
                    created_at?: string | null
                    description?: string | null
                    id?: string
                    images?: string[] | null
                    ingredients?: string | null
                    is_active?: boolean | null
                    long_description?: string | null
                    meta_description?: string | null
                    name: string
                    nutrition_facts?: Json | null
                    origin?: string | null
                    original_price?: number | null
                    rating?: number | null
                    review_count?: number | null
                    slug: string
                    updated_at?: string | null
                }
                Update: {
                    allergen_info?: string | null
                    badge?: string | null
                    base_price?: number | null
                    category_id?: string | null
                    certifications?: string[] | null
                    created_at?: string | null
                    description?: string | null
                    id?: string
                    images?: string[] | null
                    ingredients?: string | null
                    is_active?: boolean | null
                    long_description?: string | null
                    meta_description?: string | null
                    name?: string
                    nutrition_facts?: Json | null
                    origin?: string | null
                    original_price?: number | null
                    rating?: number | null
                    review_count?: number | null
                    slug?: string
                    updated_at?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "products_category_id_fkey"
                        columns: ["category_id"]
                        isOneToOne: false
                        referencedRelation: "categories"
                        referencedColumns: ["id"]
                    },
                ]
            }
            subscriptions: {
                Row: {
                    amount: number
                    created_at: string | null
                    currency: string | null
                    frequency: string
                    id: string
                    next_billing_date: string | null
                    plan_name: string
                    start_date: string | null
                    status: string
                    updated_at: string | null
                    user_id: string | null
                }
                Insert: {
                    amount: number
                    created_at?: string | null
                    currency?: string | null
                    frequency: string
                    id?: string
                    next_billing_date?: string | null
                    plan_name: string
                    start_date?: string | null
                    status?: string
                    updated_at?: string | null
                    user_id?: string | null
                }
                Update: {
                    amount?: number
                    created_at?: string | null
                    currency?: string | null
                    frequency?: string
                    id?: string
                    next_billing_date?: string | null
                    plan_name?: string
                    start_date?: string | null
                    status?: string
                    updated_at?: string | null
                    user_id?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "subscriptions_user_id_fkey"
                        columns: ["user_id"]
                        isOneToOne: false
                        referencedRelation: "users"
                        referencedColumns: ["id"]
                    },
                ]
            }
            wishlists: {
                Row: {
                    created_at: string | null
                    customer_id: string
                    id: string
                    product_id: string
                }
                Insert: {
                    created_at?: string | null
                    customer_id: string
                    id?: string
                    product_id: string
                }
                Update: {
                    created_at?: string | null
                    customer_id?: string
                    id?: string
                    product_id?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "wishlists_customer_id_fkey"
                        columns: ["customer_id"]
                        isOneToOne: false
                        referencedRelation: "customers"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "wishlists_product_id_fkey"
                        columns: ["product_id"]
                        isOneToOne: false
                        referencedRelation: "products"
                        referencedColumns: ["id"]
                    },
                ]
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            [_ in never]: never
        }
        Enums: {
            [_ in never]: never
        }
        CompositeTypes: {
            [_ in never]: never
        }
    }
}

export type Tables<
    PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
    TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
    ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
        Row: infer R
    }
    ? R
    : never
    : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
    ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
        Row: infer R
    }
    ? R
    : never
    : never

export type Enums<
    PublicEnumNameOrOptions extends
    | keyof Database["public"]["Enums"]
    | { schema: keyof Database },
    EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
    ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
    : PublicEnumNameOrOptions extends keyof Database["public"]["Enums"]
    ? Database["public"]["Enums"][PublicEnumNameOrOptions]
    : never
