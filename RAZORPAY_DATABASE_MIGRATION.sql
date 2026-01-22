-- Migration: Add Razorpay payment tracking columns to orders table
-- Run this SQL in your Supabase SQL Editor or via migration tool

-- Add Razorpay order ID column (stores Razorpay's order ID)
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS razorpay_order_id TEXT;

-- Add Razorpay payment ID column (stores Razorpay's payment ID after successful payment)
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS razorpay_payment_id TEXT;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_orders_razorpay_order_id ON orders(razorpay_order_id);
CREATE INDEX IF NOT EXISTS idx_orders_razorpay_payment_id ON orders(razorpay_payment_id);

-- Add comment for documentation
COMMENT ON COLUMN orders.razorpay_order_id IS 'Razorpay order ID created when initiating payment';
COMMENT ON COLUMN orders.razorpay_payment_id IS 'Razorpay payment ID after successful payment verification';
