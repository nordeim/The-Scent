import { useState } from "react";
import { Helmet } from "react-helmet";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { QuizForm } from "@/components/scent-finder/quiz-form";
import { Results } from "@/components/scent-finder/results";

type FinderStep = "intro" | "quiz" | "results";

export default function ScentFinderPage() {
  const [step, setStep] = useState<FinderStep>("intro");
  const [quizResults, setQuizResults] = useState<any>(null);
  
  const handleStartQuiz = () => {
    setStep("quiz");
    window.scrollTo(0, 0);
  };
  
  const handleQuizComplete = (results: any) => {
    setQuizResults(results);
    setStep("results");
    window.scrollTo(0, 0);
  };
  
  return (
    <>
      <Helmet>
        <title>Scent Finder | The Scent</title>
        <meta name="description" content="Find your perfect scent with our personalized quiz to match your preferences and needs." />
      </Helmet>
      
      {step === "intro" && (
        <div className="relative">
          {/* Hero Section */}
          <div className="relative h-[60vh] overflow-hidden">
            <div className="absolute inset-0 bg-black/40 z-10"></div>
            <div className="absolute inset-0 z-0">
              <img 
                src="https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1920&q=80" 
                alt="Essential oils and aromatherapy products" 
                className="h-full w-full object-cover object-center"
              />
            </div>
            <div className="container mx-auto px-6 relative z-20 h-full flex flex-col justify-center">
              <motion.div 
                className="max-w-3xl text-center mx-auto"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-heading font-light text-white mb-6 leading-tight">
                  Find Your Perfect Scent
                </h1>
                <p className="text-base md:text-xl text-white mb-8 font-accent font-light">
                  Let us guide you to the aromatherapy products that match your preferences,
                  mood, and wellness goals with our personalized scent finder.
                </p>
                <Button
                  size="lg"
                  className="bg-primary hover:bg-primary-dark text-white"
                  onClick={handleStartQuiz}
                >
                  Take The Quiz
                </Button>
              </motion.div>
            </div>
          </div>
          
          {/* How It Works */}
          <section className="py-20 px-6 bg-white">
            <div className="container mx-auto">
              <motion.div 
                className="text-center mb-16"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <h2 className="text-4xl font-heading mb-4">How It Works</h2>
                <p className="text-neutral-mid max-w-2xl mx-auto">
                  Finding your perfect scent is just a few steps away. Our personalized quiz
                  helps match you with products that enhance your well-being.
                </p>
              </motion.div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                {[
                  {
                    icon: "fa-list-check",
                    title: "Take the Quiz",
                    description: "Answer a few questions about your preferences, mood, and wellness goals."
                  },
                  {
                    icon: "fa-lightbulb",
                    title: "Get Personalized Results",
                    description: "Our algorithm matches your answers with the perfect scent profiles for you."
                  },
                  {
                    icon: "fa-shopping-bag",
                    title: "Discover Products",
                    description: "Explore and shop products tailored to your unique preferences and needs."
                  }
                ].map((step, index) => (
                  <motion.div 
                    key={index} 
                    className="text-center"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center mx-auto mb-6">
                      <i className={`fas ${step.icon} text-3xl text-primary`}></i>
                    </div>
                    <h3 className="text-2xl font-heading mb-3">{step.title}</h3>
                    <p className="text-neutral-mid">{step.description}</p>
                  </motion.div>
                ))}
              </div>
              
              <div className="text-center mt-16">
                <Button
                  size="lg"
                  className="bg-primary hover:bg-primary-dark text-white"
                  onClick={handleStartQuiz}
                >
                  Start the Quiz
                </Button>
              </div>
            </div>
          </section>
          
          {/* Testimonials */}
          <section className="py-16 px-6 bg-neutral-light">
            <div className="container mx-auto">
              <motion.div 
                className="text-center mb-12"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <h2 className="text-4xl font-heading mb-4">Customer Experiences</h2>
                <p className="text-neutral-mid max-w-2xl mx-auto">
                  See what others have discovered using our Scent Finder
                </p>
              </motion.div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                  {
                    name: "Emma R.",
                    image: "https://randomuser.me/api/portraits/women/45.jpg",
                    quote: "The quiz recommended lavender and sandalwood oils that perfectly matched my need for relaxation and better sleep. I'm sleeping better than I have in years!"
                  },
                  {
                    name: "Michael T.",
                    image: "https://randomuser.me/api/portraits/men/32.jpg",
                    quote: "As someone new to aromatherapy, I was overwhelmed by choices. The Scent Finder guided me to citrus scents that boost my energy during work from home days."
                  },
                  {
                    name: "Sarah L.",
                    image: "https://randomuser.me/api/portraits/women/64.jpg",
                    quote: "I was skeptical but tried the quiz anyway. The recommended eucalyptus and mint blend has been incredible for my focus and productivity."
                  }
                ].map((testimonial, index) => (
                  <motion.div 
                    key={index} 
                    className="bg-white p-6 rounded-lg shadow-sm"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <div className="flex items-center mb-4">
                      <img 
                        src={testimonial.image} 
                        alt={testimonial.name} 
                        className="w-14 h-14 rounded-full mr-4 object-cover"
                      />
                      <div>
                        <h3 className="font-heading text-lg">{testimonial.name}</h3>
                        <div className="flex text-accent">
                          <i className="fas fa-star text-xs"></i>
                          <i className="fas fa-star text-xs"></i>
                          <i className="fas fa-star text-xs"></i>
                          <i className="fas fa-star text-xs"></i>
                          <i className="fas fa-star text-xs"></i>
                        </div>
                      </div>
                    </div>
                    <p className="italic">&ldquo;{testimonial.quote}&rdquo;</p>
                  </motion.div>
                ))}
              </div>
              
              <div className="text-center mt-12">
                <Button
                  className="bg-primary hover:bg-primary-dark text-white"
                  onClick={handleStartQuiz}
                >
                  Find Your Perfect Scent
                </Button>
              </div>
            </div>
          </section>
        </div>
      )}
      
      {step === "quiz" && (
        <div className="bg-neutral-light py-12 px-6 min-h-screen">
          <div className="container mx-auto">
            <div className="max-w-3xl mx-auto">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <QuizForm onComplete={handleQuizComplete} />
              </motion.div>
            </div>
          </div>
        </div>
      )}
      
      {step === "results" && quizResults && (
        <div className="bg-neutral-light py-12 px-6 min-h-screen">
          <div className="container mx-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <Results results={quizResults} onRetakeQuiz={() => setStep("quiz")} />
            </motion.div>
          </div>
        </div>
      )}
    </>
  );
}
