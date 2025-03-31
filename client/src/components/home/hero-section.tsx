import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";

export function HeroSection() {
  const [, navigate] = useLocation();
  
  return (
    <section className="relative h-[80vh] overflow-hidden">
      <div className="absolute inset-0 bg-black/30 z-10"></div>
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1920&q=80" 
          alt="Essential oils and aromatherapy products" 
          className="h-full w-full object-cover object-center"
        />
      </div>
      <div className="container mx-auto px-6 relative z-20 h-full flex flex-col justify-center">
        <motion.div 
          className="max-w-3xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-heading font-light text-white mb-8 leading-tight">
            Transform Your Well-being Through Scent
          </h1>
          <p className="text-base md:text-xl text-white mb-10 font-accent font-light max-w-2xl">
            Discover our premium collection of essential oils and natural soaps crafted to enhance your mental and physical health.
          </p>
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            <Button
              size="lg"
              className="bg-primary hover:bg-primary-dark text-white"
              onClick={() => navigate("/shop")}
            >
              Shop Collection
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-white border-white hover:bg-white/20"
              onClick={() => navigate("/scent-finder")}
            >
              Take The Scent Quiz
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
