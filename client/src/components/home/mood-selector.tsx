import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { motion } from "framer-motion";

interface Mood {
  id: number;
  name: string;
  description: string;
  iconClass: string;
}

export function MoodSelector() {
  const { data: moods, isLoading } = useQuery<Mood[]>({
    queryKey: ["/api/moods"],
  });
  
  const [, navigate] = useLocation();
  
  const handleMoodClick = (moodId: number) => {
    navigate(`/scent-finder?mood=${moodId}`);
  };
  
  return (
    <section className="py-20 px-6 bg-primary text-white">
      <div className="container mx-auto">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-4xl font-heading mb-4">Find Your Perfect Scent</h2>
          <p className="text-white/80 max-w-2xl mx-auto">
            Your mood and needs are unique. Discover products tailored to enhance your specific well-being goals.
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {isLoading ? (
            // Loading skeleton
            Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="bg-white/10 rounded-lg p-8 text-center animate-pulse">
                <div className="w-16 h-16 bg-white/20 rounded-full mx-auto mb-6"></div>
                <div className="h-6 bg-white/20 rounded w-1/2 mx-auto mb-3"></div>
                <div className="h-4 bg-white/20 rounded w-full mb-1"></div>
                <div className="h-4 bg-white/20 rounded w-3/4 mx-auto"></div>
              </div>
            ))
          ) : (
            moods?.map((mood, index) => (
              <motion.button
                key={mood.id}
                className="bg-white/10 hover:bg-white/20 rounded-lg p-8 text-center transition group"
                onClick={() => handleMoodClick(mood.id)}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-accent/40 transition">
                  <i className={`fas ${mood.iconClass} text-2xl`}></i>
                </div>
                <h3 className="text-xl font-heading mb-3">{mood.name}</h3>
                <p className="text-white/70 text-sm">{mood.description}</p>
              </motion.button>
            ))
          )}
        </div>
        
        <div className="text-center mt-12">
          <motion.button
            className="inline-block border border-white text-white hover:bg-white/10 px-8 py-3 transition"
            onClick={() => navigate("/scent-finder")}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            Take the Full Scent Quiz
          </motion.button>
        </div>
      </div>
    </section>
  );
}
