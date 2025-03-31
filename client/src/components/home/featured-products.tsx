import { useQuery } from "@tanstack/react-query";
import { Product } from "@shared/schema";
import { ProductCard } from "@/components/product-card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "wouter";
import { motion } from "framer-motion";

export function FeaturedProducts() {
  const { data: products, isLoading, error } = useQuery<Product[]>({
    queryKey: ["/api/products/featured"],
  });

  if (error) {
    return (
      <section className="py-16 px-6 bg-secondary/30">
        <div className="container mx-auto text-center">
          <p className="text-red-500">Failed to load featured products. Please try again later.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 px-6 bg-secondary/30">
      <div className="container mx-auto">
        <motion.div 
          className="flex flex-col md:flex-row justify-between items-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-4xl font-heading mb-4 md:mb-0">Bestselling Products</h2>
          <Link href="/shop">
            <a className="text-primary hover:text-accent flex items-center font-medium">
              <span>View All Products</span>
              <ArrowRight className="ml-2 h-4 w-4" />
            </a>
          </Link>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {isLoading ? (
            // Loading skeleton
            Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="bg-white rounded-lg overflow-hidden shadow-sm animate-pulse">
                <div className="aspect-square bg-gray-200"></div>
                <div className="p-4">
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-1"></div>
                  <div className="h-4 bg-gray-200 rounded w-full mb-3"></div>
                  <div className="flex justify-between items-center">
                    <div className="h-5 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            products?.map((product, index) => (
              <motion.div 
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
