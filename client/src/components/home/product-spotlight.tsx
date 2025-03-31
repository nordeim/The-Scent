import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { ScentProfileChart } from "@/components/scent-profile-chart";
import { Check } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

export function ProductSpotlight() {
  const { data: spotlightProduct, isLoading } = useQuery({
    queryKey: ["/api/products/signature-blend-essential-oil"],
  });
  
  const { addToCart } = useCart();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  
  const handleAddToCart = () => {
    if (!spotlightProduct) return;
    
    addToCart({ productId: spotlightProduct.id, quantity: 1 });
    toast({
      title: "Added to cart",
      description: `${spotlightProduct.name} has been added to your cart.`,
    });
  };
  
  if (isLoading) {
    return (
      <section className="py-20 px-6">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-3/4 mb-6"></div>
              <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-8"></div>
              
              <div className="mb-8">
                <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
                <div className="space-y-3">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="flex items-start">
                      <div className="h-5 w-5 bg-gray-200 rounded-full mr-3 mt-1"></div>
                      <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="mb-8">
                <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
                <div className="h-60 bg-gray-200 rounded"></div>
              </div>
              
              <div className="flex space-x-4">
                <div className="h-10 bg-gray-200 rounded w-40"></div>
                <div className="h-10 bg-gray-200 rounded w-32"></div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 animate-pulse">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="aspect-square bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }
  
  if (!spotlightProduct) {
    return null;
  }
  
  return (
    <section className="py-20 px-6">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl font-heading mb-6">Discover Our Signature Blend</h2>
            <p className="text-neutral-mid mb-8">
              Our signature essential oil blend is carefully crafted to promote relaxation and mental clarity. 
              This unique formulation combines lavender, bergamot, and sandalwood to create a harmonious 
              balance that soothes the mind and rejuvenates the spirit.
            </p>
            
            {/* Product Benefits */}
            <div className="mb-8">
              <h3 className="text-xl font-heading mb-4">Benefits</h3>
              <ul className="space-y-3">
                {spotlightProduct.benefits?.map((benefit, index) => (
                  <motion.li 
                    key={index} 
                    className="flex items-start"
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                  >
                    <Check className="h-5 w-5 text-accent mt-1 mr-3" />
                    <span>{benefit}</span>
                  </motion.li>
                ))}
              </ul>
            </div>
            
            {/* Scent Profile Chart */}
            {spotlightProduct.scentProfiles && (
              <ScentProfileChart profiles={spotlightProduct.scentProfiles} />
            )}
            
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <Button
                className="bg-primary hover:bg-primary-dark text-white px-8 py-3 transition font-medium"
                onClick={handleAddToCart}
              >
                Add to Cart - ${parseFloat(spotlightProduct.price.toString()).toFixed(2)}
              </Button>
              <Button
                variant="outline"
                className="border border-primary text-primary hover:bg-primary/5"
                onClick={() => navigate(`/products/${spotlightProduct.slug}`)}
              >
                Learn More
              </Button>
            </div>
          </motion.div>
          
          <motion.div 
            className="grid grid-cols-2 gap-4"
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {spotlightProduct.images?.slice(0, 4).map((image, index) => (
              <motion.div 
                key={index} 
                className="aspect-square rounded-lg overflow-hidden"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.3 + (index * 0.1) }}
              >
                <img 
                  src={image} 
                  alt={`${spotlightProduct.name} - Image ${index + 1}`} 
                  className="w-full h-full object-cover" 
                />
              </motion.div>
            ))}
            {/* If there are less than 4 images, show the main image to fill the grid */}
            {spotlightProduct.images?.length < 4 && 
              Array.from({ length: 4 - (spotlightProduct.images?.length || 0) }).map((_, index) => (
                <motion.div 
                  key={`fallback-${index}`} 
                  className="aspect-square rounded-lg overflow-hidden"
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.3 + ((index + (spotlightProduct.images?.length || 0)) * 0.1) }}
                >
                  <img 
                    src={spotlightProduct.imageUrl} 
                    alt={spotlightProduct.name} 
                    className="w-full h-full object-cover" 
                  />
                </motion.div>
              ))
            }
          </motion.div>
        </div>
      </div>
    </section>
  );
}
