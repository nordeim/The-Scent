import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Testimonial {
  id: number;
  name: string;
  location: string;
  rating: number;
  comment: string;
  product: string;
}

export function TestimonialSlider() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const sliderRef = useRef<HTMLDivElement>(null);
  
  // Sample testimonials - in a real app, this would come from an API
  const testimonials: Testimonial[] = [
    {
      id: 1,
      name: "Sarah L.",
      location: "Los Angeles, CA",
      rating: 5,
      comment: "The Lavender Essential Oil from The Scent has transformed my bedtime routine. I put a few drops in my diffuser and within minutes, the calming aroma helps me unwind. I've never slept better!",
      product: "Lavender Essential Oil"
    },
    {
      id: 2,
      name: "Michael T.",
      location: "Chicago, IL",
      rating: 4.5,
      comment: "I was skeptical about essential oils until I tried the Focus Blend. I use it when working from home and have noticed a significant improvement in my productivity and concentration.",
      product: "Focus Blend Essential Oil"
    },
    {
      id: 3,
      name: "Emma R.",
      location: "Seattle, WA",
      rating: 5,
      comment: "The handcrafted soaps are a game-changer! Not only do they smell amazing, but they've also helped clear up my sensitive skin. The quality is unmatched - I'll never go back to store-bought soap.",
      product: "Lavender & Oatmeal Soap"
    }
  ];
  
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    
    handleResize(); // Set initial value
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % testimonials.length);
  };
  
  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };
  
  useEffect(() => {
    if (sliderRef.current && isMobile) {
      sliderRef.current.style.transform = `translateX(-${currentSlide * 100}%)`;
    }
  }, [currentSlide, isMobile]);
  
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
          <h2 className="text-4xl font-heading mb-4">What Our Customers Say</h2>
          <p className="text-neutral-mid max-w-2xl mx-auto">Real experiences from people who have transformed their well-being with our products.</p>
        </motion.div>
        
        <div className="relative">
          {/* Testimonial Slides */}
          <div className="testimonial-slider overflow-hidden">
            <div 
              ref={sliderRef}
              className="flex transition-transform duration-500" 
              style={isMobile ? { width: `${testimonials.length * 100}%` } : undefined}
            >
              {testimonials.map((testimonial, index) => (
                <motion.div 
                  key={testimonial.id} 
                  className={`${isMobile ? 'w-full' : 'w-full lg:w-1/3'} flex-shrink-0 px-4`}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  style={isMobile ? { width: `${100 / testimonials.length}%` } : undefined}
                >
                  <div className="bg-neutral-light p-8 rounded-lg h-full">
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <h3 className="font-heading text-xl mb-1">{testimonial.name}</h3>
                        <p className="text-sm text-neutral-mid">{testimonial.location}</p>
                      </div>
                      <div className="flex">
                        {Array.from({ length: 5 }).map((_, i) => {
                          if (i < Math.floor(testimonial.rating)) {
                            return <i key={i} className="fas fa-star text-accent"></i>;
                          } else if (i === Math.floor(testimonial.rating) && testimonial.rating % 1 !== 0) {
                            return <i key={i} className="fas fa-star-half-alt text-accent"></i>;
                          } else {
                            return <i key={i} className="far fa-star text-accent"></i>;
                          }
                        })}
                      </div>
                    </div>
                    <p className="italic mb-6">"{testimonial.comment}"</p>
                    <p className="text-sm font-medium text-primary">Purchased: {testimonial.product}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
          
          {/* Controls for desktop */}
          <button 
            onClick={prevSlide}
            className="absolute top-1/2 -left-4 transform -translate-y-1/2 h-10 w-10 rounded-full bg-white shadow-md flex items-center justify-center text-primary hover:text-accent transition hidden md:flex"
            aria-label="Previous testimonial"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button 
            onClick={nextSlide}
            className="absolute top-1/2 -right-4 transform -translate-y-1/2 h-10 w-10 rounded-full bg-white shadow-md flex items-center justify-center text-primary hover:text-accent transition hidden md:flex"
            aria-label="Next testimonial"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
          
          {/* Dots for mobile */}
          {isMobile && (
            <div className="flex justify-center mt-8">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  className={`h-2 w-2 rounded-full mx-1 ${
                    index === currentSlide ? 'bg-accent' : 'bg-secondary'
                  }`}
                  onClick={() => setCurrentSlide(index)}
                  aria-label={`Go to slide ${index + 1}`}
                ></button>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
