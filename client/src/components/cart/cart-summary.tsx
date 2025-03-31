import { useCart } from "@/hooks/use-cart";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { ArrowRight, ShoppingCart } from "lucide-react";
import { motion } from "framer-motion";

interface CartSummaryProps {
  showCheckoutButton?: boolean;
}

export function CartSummary({ showCheckoutButton = true }: CartSummaryProps) {
  const { cart, isLoading, itemCount, subtotal, isEmpty } = useCart();
  const [, navigate] = useLocation();
  
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/2 mb-6"></div>
        <div className="space-y-4 mb-6">
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-4/5"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
        <div className="h-px bg-gray-200 my-4"></div>
        <div className="flex justify-between mb-6">
          <div className="h-5 bg-gray-200 rounded w-1/3"></div>
          <div className="h-5 bg-gray-200 rounded w-1/4"></div>
        </div>
        <div className="h-10 bg-gray-200 rounded w-full"></div>
      </div>
    );
  }
  
  if (isEmpty) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-heading mb-4">Your Cart</h2>
        <div className="py-8 text-center">
          <ShoppingCart className="mx-auto h-8 w-8 text-neutral-mid mb-4" />
          <p className="text-neutral-mid">Your cart is empty</p>
          <Button
            onClick={() => navigate("/shop")}
            className="mt-4 bg-primary hover:bg-primary-dark"
          >
            Start Shopping
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-lg shadow-sm p-6"
    >
      <h2 className="text-xl font-heading mb-4">Order Summary</h2>
      
      {/* Cart Items Summary */}
      <div className="space-y-3 mb-4">
        {cart?.items.slice(0, 3).map(item => (
          <div key={item.id} className="flex justify-between text-sm">
            <span className="flex-1">
              {item.product.name} <span className="text-neutral-mid">x{item.quantity}</span>
            </span>
            <span className="font-medium">
              ${(parseFloat(item.product.price.toString()) * item.quantity).toFixed(2)}
            </span>
          </div>
        ))}
        
        {cart?.items.length > 3 && (
          <div className="text-sm text-neutral-mid">
            and {cart.items.length - 3} more {cart.items.length - 3 === 1 ? 'item' : 'items'}
          </div>
        )}
      </div>
      
      {/* Subtotals */}
      <div className="border-t border-gray-200 pt-4 mt-4">
        <div className="flex justify-between mb-2">
          <span className="text-neutral-mid">Subtotal</span>
          <span className="font-medium">${subtotal.toFixed(2)}</span>
        </div>
        
        <div className="flex justify-between mb-2">
          <span className="text-neutral-mid">Shipping</span>
          <span>{subtotal >= 50 ? "Free" : "$5.99"}</span>
        </div>
        
        {subtotal >= 50 && (
          <div className="text-accent text-sm mb-2">
            You've qualified for free shipping!
          </div>
        )}
        
        {!subtotal || subtotal < 50 ? (
          <div className="text-sm mb-2">
            Add ${(50 - subtotal).toFixed(2)} more to qualify for free shipping
          </div>
        ) : null}
        
        <div className="border-t border-gray-200 pt-4 mt-4">
          <div className="flex justify-between mb-2">
            <span className="font-medium">Total</span>
            <span className="font-medium text-lg">
              ${(subtotal + (subtotal >= 50 ? 0 : 5.99)).toFixed(2)}
            </span>
          </div>
        </div>
      </div>
      
      {/* Checkout Button */}
      {showCheckoutButton && (
        <Button
          className="w-full mt-6 bg-primary hover:bg-primary-dark"
          onClick={() => navigate("/checkout")}
          disabled={isEmpty}
        >
          Proceed to Checkout
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      )}
    </motion.div>
  );
}
