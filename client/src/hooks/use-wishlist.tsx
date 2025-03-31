import { createContext, ReactNode, useContext } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Product } from "@shared/schema";

interface WishlistItem {
  id: number;
  productId: number;
  userId: number;
  product: Product;
}

type WishlistContextType = {
  wishlist: WishlistItem[] | null;
  isLoading: boolean;
  error: Error | null;
  addToWishlist: (productId: number) => void;
  removeFromWishlist: (productId: number) => void;
  isInWishlist: (productId: number) => boolean;
};

const WishlistContext = createContext<WishlistContextType | null>(null);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const { user } = useAuth();
  
  const {
    data: wishlist,
    error,
    isLoading,
  } = useQuery<WishlistItem[]>({
    queryKey: ["/api/wishlist"],
    enabled: !!user,
  });
  
  const addToWishlistMutation = useMutation({
    mutationFn: async (productId: number) => {
      const res = await apiRequest("POST", "/api/wishlist", { productId });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/wishlist"] });
      toast({
        title: "Added to wishlist",
        description: "Item has been added to your wishlist.",
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
  
  const removeFromWishlistMutation = useMutation({
    mutationFn: async (productId: number) => {
      await apiRequest("DELETE", `/api/wishlist/${productId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/wishlist"] });
      toast({
        title: "Removed from wishlist",
        description: "Item has been removed from your wishlist.",
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
  
  // Check if a product is in the wishlist
  const isInWishlist = (productId: number): boolean => {
    if (!wishlist) return false;
    return wishlist.some(item => item.productId === productId);
  };
  
  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        isLoading,
        error,
        addToWishlist: (productId) => addToWishlistMutation.mutate(productId),
        removeFromWishlist: (productId) => removeFromWishlistMutation.mutate(productId),
        isInWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
}
