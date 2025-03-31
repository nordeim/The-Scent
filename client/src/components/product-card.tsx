import { Product } from "@shared/schema";
import { Rating } from "./ui/rating";
import { useCart } from "@/hooks/use-cart";
import { useWishlist } from "@/hooks/use-wishlist";
import { useState } from "react";
import { useLocation } from "wouter";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const { addToCart } = useCart();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const [, navigate] = useLocation();
  
  const inWishlist = isInWishlist(product.id);
  
  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({ productId: product.id, quantity: 1 });
  };
  
  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (inWishlist) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product.id);
    }
  };
  
  const navigateToProduct = () => {
    navigate(`/products/${product.slug}`);
  };
  
  return (
    <div 
      className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition group cursor-pointer"
      onClick={navigateToProduct}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative">
        <div className="block aspect-square overflow-hidden">
          <img 
            src={product.imageUrl} 
            alt={product.name}
            className="w-full h-full object-cover transition group-hover:scale-105"
          />
        </div>
        
        <button
          onClick={handleWishlistToggle}
          className="absolute top-4 right-4 h-8 w-8 rounded-full bg-white/80 hover:bg-white flex items-center justify-center text-neutral-mid hover:text-accent transition"
        >
          <Heart 
            className={inWishlist ? "fill-accent text-accent" : ""} 
            size={16} 
          />
        </button>
        
        <div 
          className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent text-white p-4 transition-opacity ${
            isHovered ? "opacity-100" : "opacity-0"
          }`}
        >
          <span className="uppercase text-xs tracking-wider">Quick View</span>
        </div>
      </div>
      
      <div className="p-4">
        <Rating 
          value={parseFloat(product.averageRating.toString())} 
          showCount={true} 
          count={product.reviewCount} 
          className="mb-2"
        />
        
        <h3 className="font-heading text-xl mb-1">{product.name}</h3>
        <p className="text-neutral-mid text-sm mb-3">{product.shortDescription}</p>
        
        <div className="flex justify-between items-center">
          <span className="font-medium">${parseFloat(product.price.toString()).toFixed(2)}</span>
          <Button 
            onClick={handleAddToCart}
            size="sm"
            className="bg-primary hover:bg-primary-dark text-white"
          >
            Add to Cart
          </Button>
        </div>
      </div>
    </div>
  );
}
