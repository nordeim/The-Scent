import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Helmet } from "react-helmet";
import { Rating } from "@/components/ui/rating";
import { ScentProfileChart } from "@/components/scent-profile-chart";
import { Button } from "@/components/ui/button";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { ProductCard } from "@/components/product-card";
import { useCart } from "@/hooks/use-cart";
import { useWishlist } from "@/hooks/use-wishlist";
import { Heart, Minus, Plus, Check, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

export default function ProductDetailPage() {
  const { slug } = useParams();
  const [, navigate] = useLocation();
  const { addToCart } = useCart();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const { toast } = useToast();
  
  const [quantity, setQuantity] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  
  // Product query
  const { 
    data: product, 
    isLoading, 
    error 
  } = useQuery({
    queryKey: [`/api/products/${slug}`],
  });
  
  // Related products query (based on category)
  const { data: relatedProducts } = useQuery({
    queryKey: ["/api/products/category", product?.categoryId],
    enabled: !!product?.categoryId,
  });
  
  const handleQuantityChange = (amount: number) => {
    const newQuantity = quantity + amount;
    if (newQuantity >= 1 && newQuantity <= 10) {
      setQuantity(newQuantity);
    }
  };
  
  const handleAddToCart = () => {
    if (!product) return;
    
    addToCart({ productId: product.id, quantity });
    toast({
      title: "Added to cart",
      description: `${product.name} (${quantity}) has been added to your cart.`,
    });
  };
  
  const handleWishlistToggle = () => {
    if (!product) return;
    
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product.id);
    }
  };
  
  if (isLoading) {
    return (
      <div className="container mx-auto py-12 px-6">
        <div className="flex flex-col lg:flex-row gap-12">
          <div className="lg:w-1/2 animate-pulse">
            <div className="aspect-square bg-gray-200 rounded-lg mb-4"></div>
            <div className="grid grid-cols-4 gap-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="aspect-square bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
          <div className="lg:w-1/2 animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-6 bg-gray-200 rounded w-1/3 mb-6"></div>
            <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-6"></div>
            <div className="h-10 bg-gray-200 rounded w-40 mb-6"></div>
            <div className="flex gap-4 mb-6">
              <div className="h-12 bg-gray-200 rounded w-32"></div>
              <div className="h-12 bg-gray-200 rounded w-32"></div>
            </div>
            <div className="h-60 bg-gray-200 rounded mb-6"></div>
          </div>
        </div>
      </div>
    );
  }
  
  if (error || !product) {
    return (
      <div className="container mx-auto py-12 px-6 text-center">
        <h1 className="text-3xl font-heading mb-4">Product Not Found</h1>
        <p className="text-neutral-mid mb-6">
          We couldn't find the product you're looking for. It may have been removed or the URL is incorrect.
        </p>
        <Button onClick={() => navigate("/shop")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Shop
        </Button>
      </div>
    );
  }
  
  // Combine main image with additional images
  const allImages = [product.imageUrl, ...(product.images || [])];
  const activeImage = allImages[activeImageIndex];
  
  // Is product in wishlist
  const inWishlist = isInWishlist(product.id);
  
  return (
    <>
      <Helmet>
        <title>{product.name} | The Scent</title>
        <meta name="description" content={product.shortDescription} />
      </Helmet>
      
      <div className="container mx-auto py-12 px-6">
        {/* Breadcrumbs */}
        <div className="mb-8 text-sm">
          <nav className="flex" aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-1 md:space-x-3">
              <li className="inline-flex items-center">
                <button 
                  onClick={() => navigate("/")}
                  className="inline-flex items-center text-neutral-mid hover:text-primary"
                >
                  Home
                </button>
              </li>
              <li>
                <div className="flex items-center">
                  <span className="mx-2 text-neutral-mid">/</span>
                  <button 
                    onClick={() => navigate("/shop")}
                    className="inline-flex items-center text-neutral-mid hover:text-primary"
                  >
                    Shop
                  </button>
                </div>
              </li>
              <li aria-current="page">
                <div className="flex items-center">
                  <span className="mx-2 text-neutral-mid">/</span>
                  <span className="text-primary">{product.name}</span>
                </div>
              </li>
            </ol>
          </nav>
        </div>
        
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Product Images */}
          <motion.div 
            className="lg:w-1/2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="aspect-square rounded-lg overflow-hidden mb-4">
              <img 
                src={activeImage} 
                alt={product.name} 
                className="w-full h-full object-cover" 
              />
            </div>
            
            {allImages.length > 1 && (
              <div className="grid grid-cols-4 gap-4">
                {allImages.map((image, index) => (
                  <button
                    key={index}
                    className={`aspect-square rounded-lg overflow-hidden border-2 ${
                      index === activeImageIndex 
                        ? "border-primary" 
                        : "border-transparent hover:border-primary/50"
                    }`}
                    onClick={() => setActiveImageIndex(index)}
                  >
                    <img 
                      src={image} 
                      alt={`${product.name} - view ${index + 1}`} 
                      className="w-full h-full object-cover" 
                    />
                  </button>
                ))}
              </div>
            )}
          </motion.div>
          
          {/* Product Info */}
          <motion.div 
            className="lg:w-1/2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-3xl md:text-4xl font-heading mb-2">{product.name}</h1>
            
            <div className="flex items-center mb-4">
              <Rating 
                value={parseFloat(product.averageRating.toString())}
                showCount={true}
                count={product.reviewCount}
              />
            </div>
            
            <p className="text-2xl font-medium text-primary mb-6">${parseFloat(product.price.toString()).toFixed(2)}</p>
            
            <p className="text-neutral-mid mb-6">{product.shortDescription}</p>
            
            {/* Quantity selector and Add to Cart */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <div className="flex items-center border border-gray-300 rounded-md">
                <button 
                  className="flex-none w-10 h-10 flex items-center justify-center text-neutral-mid hover:text-primary"
                  onClick={() => handleQuantityChange(-1)}
                  disabled={quantity <= 1}
                >
                  <Minus className="h-4 w-4" />
                </button>
                <div className="flex-grow h-10 flex items-center justify-center font-medium min-w-[40px]">
                  {quantity}
                </div>
                <button 
                  className="flex-none w-10 h-10 flex items-center justify-center text-neutral-mid hover:text-primary"
                  onClick={() => handleQuantityChange(1)}
                  disabled={quantity >= 10}
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              
              <Button 
                className="flex-1 bg-primary hover:bg-primary-dark text-white h-10"
                onClick={handleAddToCart}
              >
                Add to Cart
              </Button>
              
              <Button 
                variant="outline" 
                size="icon" 
                className={`h-10 w-10 ${inWishlist ? 'text-accent border-accent' : ''}`}
                onClick={handleWishlistToggle}
              >
                <Heart className={inWishlist ? 'fill-accent text-accent' : ''} />
              </Button>
            </div>
            
            {/* Product details tabs */}
            <Tabs defaultValue="description" className="mb-8">
              <TabsList className="w-full">
                <TabsTrigger value="description" className="flex-1">Description</TabsTrigger>
                <TabsTrigger value="ingredients" className="flex-1">Ingredients</TabsTrigger>
                <TabsTrigger value="benefits" className="flex-1">Benefits</TabsTrigger>
              </TabsList>
              
              <TabsContent value="description" className="pt-4">
                <p>{product.description}</p>
              </TabsContent>
              
              <TabsContent value="ingredients" className="pt-4">
                <ul className="space-y-2">
                  {product.ingredients?.map((ingredient, index) => (
                    <li key={index} className="flex items-start">
                      <Check className="h-5 w-5 text-accent mt-0.5 mr-2 flex-shrink-0" />
                      <span>{ingredient}</span>
                    </li>
                  )) || (
                    <li>No ingredient information available</li>
                  )}
                </ul>
              </TabsContent>
              
              <TabsContent value="benefits" className="pt-4">
                <ul className="space-y-2">
                  {product.benefits?.map((benefit, index) => (
                    <li key={index} className="flex items-start">
                      <Check className="h-5 w-5 text-accent mt-0.5 mr-2 flex-shrink-0" />
                      <span>{benefit}</span>
                    </li>
                  )) || (
                    <li>No benefits information available</li>
                  )}
                </ul>
              </TabsContent>
            </Tabs>
            
            {/* Scent Profile */}
            {product.scentProfiles && product.scentProfiles.length > 0 && (
              <ScentProfileChart profiles={product.scentProfiles} />
            )}
            
            {/* Additional Info */}
            <div className="border-t border-gray-200 pt-6">
              <p className="mb-2"><span className="font-medium">SKU:</span> {product.sku}</p>
              <p className="mb-2">
                <span className="font-medium">Category:</span> {product.categoryName || "Aromatherapy"}
              </p>
              <p>
                <span className="font-medium">Share:</span>{" "}
                <button className="text-primary hover:text-accent mx-2">
                  <i className="fab fa-facebook-f"></i>
                </button>
                <button className="text-primary hover:text-accent mx-2">
                  <i className="fab fa-twitter"></i>
                </button>
                <button className="text-primary hover:text-accent mx-2">
                  <i className="fab fa-pinterest-p"></i>
                </button>
              </p>
            </div>
          </motion.div>
        </div>
        
        {/* Related Products */}
        <div className="mt-20">
          <h2 className="text-3xl font-heading mb-8 text-center">You May Also Like</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {relatedProducts?.filter(p => p.id !== product.id).slice(0, 4).map((relatedProduct, index) => (
              <motion.div 
                key={relatedProduct.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <ProductCard product={relatedProduct} />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
