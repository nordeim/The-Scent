import { useQuery } from "@tanstack/react-query";
import { Category } from "@shared/schema";
import { Link } from "wouter";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export function CategoryShowcase() {
  const { data: categories, isLoading } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });
  
  if (isLoading) {
    return (
      <section className="py-20 px-6">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-heading mb-4">Discover Our Collection</h2>
            <p className="text-neutral-mid max-w-2xl mx-auto">Explore our range of premium essential oils and natural soaps designed to enhance your wellness journey.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="rounded-lg overflow-hidden mb-6 relative aspect-[4/5] bg-gray-200"></div>
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-full mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }
  
  return (
    <section className="py-20 px-6">
      <div className="container mx-auto">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-4xl font-heading mb-4">Discover Our Collection</h2>
          <p className="text-neutral-mid max-w-2xl mx-auto">Explore our range of premium essential oils and natural soaps designed to enhance your wellness journey.</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {categories?.map((category, index) => (
            <motion.div 
              key={category.id} 
              className="group"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div className="rounded-lg overflow-hidden mb-6 relative aspect-[4/5]">
                <img 
                  src={category.imageUrl} 
                  alt={category.name} 
                  className="w-full h-full object-cover transition duration-500 group-hover:scale-105" 
                />
                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition"></div>
              </div>
              <h3 className="text-2xl font-heading mb-2">{category.name}</h3>
              <p className="text-neutral-mid mb-4">{category.description}</p>
              <Link href={`/shop?category=${category.slug}`}>
                <a className="text-primary hover:text-accent flex items-center transition font-medium">
                  <span>Shop Collection</span>
                  <ArrowRight className="ml-2 h-4 w-4" />
                </a>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
