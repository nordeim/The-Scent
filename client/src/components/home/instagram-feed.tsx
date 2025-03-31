import { motion } from "framer-motion";
import { Instagram } from "lucide-react";

export function InstagramFeed() {
  // Images from the sample design
  const images = [
    "https://raw.githubusercontent.com/nordeim/The-Scent/refs/heads/main/images/scent2.jpg",
    "https://raw.githubusercontent.com/nordeim/The-Scent/refs/heads/main/images/scent4.jpg",
    "https://raw.githubusercontent.com/nordeim/The-Scent/refs/heads/main/images/scent5.jpg",
    "https://raw.githubusercontent.com/nordeim/The-Scent/refs/heads/main/images/scent6.jpg",
    "https://raw.githubusercontent.com/nordeim/The-Scent/refs/heads/main/images/soap4.jpg",
    "https://raw.githubusercontent.com/nordeim/The-Scent/refs/heads/main/images/soap5.jpg"
  ];
  
  return (
    <section className="py-16 px-6">
      <div className="container mx-auto">
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-4xl font-heading mb-4">Follow Our Journey</h2>
          <p className="text-neutral-mid max-w-2xl mx-auto">Get inspired by our community and join the conversation. Follow us on Instagram @TheScentAroma</p>
        </motion.div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {images.map((image, index) => (
            <motion.a 
              key={index}
              href="https://instagram.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="block aspect-square overflow-hidden relative group"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
            >
              <img 
                src={image} 
                alt={`Instagram post ${index + 1}`} 
                className="w-full h-full object-cover transition duration-500 group-hover:scale-110" 
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                <Instagram className="text-white text-2xl" />
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}
