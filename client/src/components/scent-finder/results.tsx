import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/product-card";
import { ArrowRight, RefreshCw } from "lucide-react";
import { useLocation } from "wouter";

interface ResultsProps {
  results: any;
  onRetakeQuiz: () => void;
}

export function Results({ results, onRetakeQuiz }: ResultsProps) {
  const [, navigate] = useLocation();
  
  // Fetch recommended products based on quiz results
  const { data: recommendedProducts, isLoading } = useQuery({
    queryKey: ["/api/products"],
    // In a real app, you would fetch products filtered by the quiz results
  });
  
  // Filter products based on quiz results
  // This is a simplified version - in a real app you'd have a more sophisticated algorithm
  const filteredProducts = recommendedProducts?.filter(product => {
    // If user selected "relaxation", show products that promote relaxation
    if (results.purpose === "relaxation" && product.moods?.some((m: any) => m.name === "Relaxation")) {
      return true;
    }
    
    // If user selected "energy", show products that promote energy
    if (results.purpose === "energy" && product.moods?.some((m: any) => m.name === "Energy")) {
      return true;
    }
    
    // If user selected certain scent preferences, prioritize those
    if (results.preferences && results.preferences.length > 0) {
      if (product.scentProfiles?.some((s: any) => 
        results.preferences.includes(s.name.toLowerCase())
      )) {
        return true;
      }
    }
    
    // Default to showing featured products if we can't find specific matches
    return product.featured;
  }).slice(0, 4);
  
  return (
    <div>
      <div className="bg-white rounded-lg shadow-sm p-8 mb-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-heading mb-4 text-center">Your Personalized Results</h1>
          <p className="text-center text-neutral-mid mb-8">
            Based on your preferences, we've found the perfect aromatherapy products for you
          </p>
          
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="bg-neutral-light rounded-lg p-6">
              <h3 className="font-heading text-xl mb-4">Your Scent Profile</h3>
              <ul className="space-y-3">
                <li className="flex justify-between">
                  <span className="text-neutral-mid">Primary Purpose:</span>
                  <span className="font-medium capitalize">{results.purpose}</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-neutral-mid">Preferred Intensity:</span>
                  <span className="font-medium">
                    {results.intensity === 1 && "Very Subtle"}
                    {results.intensity === 2 && "Subtle"}
                    {results.intensity === 3 && "Moderate"}
                    {results.intensity === 4 && "Strong"}
                    {results.intensity === 5 && "Very Strong"}
                  </span>
                </li>
                <li className="flex justify-between">
                  <span className="text-neutral-mid">Lifestyle:</span>
                  <span className="font-medium capitalize">{results.lifestyle}</span>
                </li>
                <li>
                  <span className="text-neutral-mid block mb-2">Preferred Scents:</span>
                  <div className="flex flex-wrap gap-2">
                    {results.preferences && results.preferences.map((pref: string) => (
                      <span 
                        key={pref} 
                        className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm capitalize"
                      >
                        {pref}
                      </span>
                    ))}
                  </div>
                </li>
                <li>
                  <span className="text-neutral-mid block mb-2">Application Methods:</span>
                  <div className="flex flex-wrap gap-2">
                    {results.application && results.application.map((app: string) => (
                      <span 
                        key={app} 
                        className="bg-secondary/50 text-primary px-3 py-1 rounded-full text-sm capitalize"
                      >
                        {app}
                      </span>
                    ))}
                  </div>
                </li>
              </ul>
            </div>
            
            <div className="bg-neutral-light rounded-lg p-6">
              <h3 className="font-heading text-xl mb-4">Recommendations For You</h3>
              <p className="mb-4">
                Based on your preferences, we recommend products that:
              </p>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <i className="fas fa-check-circle text-accent mt-1 mr-3"></i>
                  <span>
                    {results.purpose === "relaxation" && "Help you relax and unwind after a long day"}
                    {results.purpose === "energy" && "Boost your energy levels when you need focus"}
                    {results.purpose === "sleep" && "Promote better sleep and restfulness"}
                    {results.purpose === "mood" && "Enhance your mood and emotional balance"}
                    {results.purpose === "health" && "Support your physical wellbeing"}
                  </span>
                </li>
                <li className="flex items-start">
                  <i className="fas fa-check-circle text-accent mt-1 mr-3"></i>
                  <span>
                    Provide {
                      results.intensity === 1 ? "very subtle" :
                      results.intensity === 2 ? "subtle" :
                      results.intensity === 3 ? "moderate" :
                      results.intensity === 4 ? "strong" :
                      "very strong"
                    } scent intensity to match your preference
                  </span>
                </li>
                <li className="flex items-start">
                  <i className="fas fa-check-circle text-accent mt-1 mr-3"></i>
                  <span>
                    Work well with your {results.lifestyle} lifestyle
                  </span>
                </li>
                <li className="flex items-start">
                  <i className="fas fa-check-circle text-accent mt-1 mr-3"></i>
                  <span>
                    Feature your preferred scent profiles: {
                      results.preferences && results.preferences.length > 0 
                        ? results.preferences.map((p: string) => p.charAt(0).toUpperCase() + p.slice(1)).join(", ")
                        : "Various complementary scents"
                    }
                  </span>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="flex justify-center gap-4">
            <Button
              variant="outline"
              onClick={onRetakeQuiz}
              className="flex items-center"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Retake Quiz
            </Button>
            <Button
              onClick={() => navigate("/shop")}
              className="bg-primary hover:bg-primary-dark"
            >
              Browse All Products
            </Button>
          </div>
        </motion.div>
      </div>
      
      <div>
        <h2 className="text-2xl font-heading mb-6">Products You'll Love</h2>
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-white rounded-lg shadow-sm p-4 animate-pulse">
                <div className="aspect-square bg-gray-200 rounded-md mb-4"></div>
                <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-full mb-4"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {filteredProducts && filteredProducts.length > 0 ? (
              filteredProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))
            ) : (
              <div className="col-span-4 text-center py-8">
                <p className="text-neutral-mid mb-4">
                  No specific product matches found. Let's explore our full collection!
                </p>
                <Button
                  onClick={() => navigate("/shop")}
                  className="bg-primary hover:bg-primary-dark"
                >
                  Browse All Products
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        )}
        
        {filteredProducts && filteredProducts.length > 0 && (
          <div className="mt-8 text-center">
            <Button
              onClick={() => navigate("/shop")}
              variant="outline"
              className="text-primary border-primary"
            >
              View More Products
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
