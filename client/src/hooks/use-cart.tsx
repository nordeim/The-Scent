import { createContext, ReactNode, useContext } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Product } from "@shared/schema";

interface CartItem {
  id: number;
  productId: number;
  quantity: number;
  product: Product;
}

interface Cart {
  id: number;
  userId: number;
  items: CartItem[];
}

interface AddToCartData {
  productId: number;
  quantity: number;
}

interface UpdateCartItemData {
  id: number;
  quantity: number;
}

type CartContextType = {
  cart: Cart | null;
  isLoading: boolean;
  error: Error | null;
  addToCart: (data: AddToCartData) => void;
  updateCartItem: (data: UpdateCartItemData) => void;
  removeCartItem: (id: number) => void;
  clearCart: () => void;
  itemCount: number;
  subtotal: number;
  isEmpty: boolean;
};

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const { user } = useAuth();
  
  const {
    data: cart,
    error,
    isLoading,
  } = useQuery<Cart | null>({
    queryKey: ["/api/cart"],
    enabled: !!user,
    staleTime: 60000, // 1 minute
  });
  
  const addToCartMutation = useMutation({
    mutationFn: async (data: AddToCartData) => {
      const res = await apiRequest("POST", "/api/cart/items", data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      toast({
        title: "Added to cart",
        description: "Item has been added to your cart.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const updateCartItemMutation = useMutation({
    mutationFn: async ({ id, quantity }: UpdateCartItemData) => {
      const res = await apiRequest("PUT", `/api/cart/items/${id}`, { quantity });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const removeCartItemMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/cart/items/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      toast({
        title: "Removed from cart",
        description: "Item has been removed from your cart.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Calculate total items in cart
  const itemCount = cart?.items?.reduce((total, item) => total + item.quantity, 0) || 0;
  
  // Calculate subtotal
  const subtotal = cart?.items?.reduce(
    (total, item) => total + parseFloat(item.product.price.toString()) * item.quantity, 
    0
  ) || 0;
  
  // Check if cart is empty
  const isEmpty = !cart?.items || cart.items.length === 0;
  
  // Function to clear cart (remove all items)
  const clearCart = () => {
    if (!cart?.items) return;
    
    cart.items.forEach(item => {
      removeCartItemMutation.mutate(item.id);
    });
  };
  
  return (
    <CartContext.Provider
      value={{
        cart,
        isLoading,
        error,
        addToCart: (data) => addToCartMutation.mutate(data),
        updateCartItem: (data) => updateCartItemMutation.mutate(data),
        removeCartItem: (id) => removeCartItemMutation.mutate(id),
        clearCart,
        itemCount,
        subtotal,
        isEmpty,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
