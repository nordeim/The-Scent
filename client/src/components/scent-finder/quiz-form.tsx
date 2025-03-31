import { useState } from "react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Progress } from "@/components/ui/progress";

interface QuizFormProps {
  onComplete: (results: any) => void;
}

const questions = [
  {
    id: "purpose",
    question: "What's your primary goal with aromatherapy?",
    options: [
      { id: "relaxation", label: "Relaxation & Stress Relief" },
      { id: "energy", label: "Energy & Focus" },
      { id: "sleep", label: "Better Sleep" },
      { id: "mood", label: "Mood Enhancement" },
      { id: "health", label: "Physical Health Benefits" }
    ]
  },
  {
    id: "preferences",
    question: "Which scent families do you generally prefer?",
    type: "multi",
    options: [
      { id: "floral", label: "Floral (lavender, rose, jasmine)" },
      { id: "citrus", label: "Citrus (orange, lemon, grapefruit)" },
      { id: "woody", label: "Woody (cedarwood, sandalwood)" },
      { id: "herbal", label: "Herbal (mint, rosemary, basil)" },
      { id: "spicy", label: "Spicy (cinnamon, clove)" }
    ]
  },
  {
    id: "intensity",
    question: "How strong do you prefer your scents to be?",
    type: "slider",
    min: 1,
    max: 5,
    labels: ["Very Subtle", "Subtle", "Moderate", "Strong", "Very Strong"]
  },
  {
    id: "application",
    question: "How do you plan to use aromatherapy products?",
    type: "multi",
    options: [
      { id: "diffuser", label: "Home diffuser" },
      { id: "personal", label: "Personal fragrance" },
      { id: "bath", label: "Bath & body care" },
      { id: "massage", label: "Massage therapy" },
      { id: "cleaning", label: "Home cleaning" }
    ]
  },
  {
    id: "lifestyle",
    question: "Which best describes your lifestyle?",
    options: [
      { id: "active", label: "Active & Outdoorsy" },
      { id: "busy", label: "Busy Professional" },
      { id: "homebody", label: "Homebody & Cozy" },
      { id: "social", label: "Social & Outgoing" },
      { id: "wellness", label: "Wellness Focused" }
    ]
  }
];

export function QuizForm({ onComplete }: QuizFormProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  
  // Get scent profiles data
  const { data: scentProfiles } = useQuery({
    queryKey: ["/api/scent-profiles"],
  });
  
  // Get moods data
  const { data: moods } = useQuery({
    queryKey: ["/api/moods"],
  });
  
  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
  
  const handleSingleAnswer = (value: string) => {
    setAnswers({
      ...answers,
      [currentQuestion.id]: value
    });
  };
  
  const handleMultiAnswer = (value: string, checked: boolean) => {
    const currentValues = answers[currentQuestion.id] || [];
    let newValues;
    
    if (checked) {
      newValues = [...currentValues, value];
    } else {
      newValues = currentValues.filter((v: string) => v !== value);
    }
    
    setAnswers({
      ...answers,
      [currentQuestion.id]: newValues
    });
  };
  
  const handleSliderAnswer = (value: number[]) => {
    setAnswers({
      ...answers,
      [currentQuestion.id]: value[0]
    });
  };
  
  const isQuestionAnswered = () => {
    if (!answers[currentQuestion.id]) return false;
    
    if (currentQuestion.type === "multi") {
      return (answers[currentQuestion.id] as string[]).length > 0;
    }
    
    return true;
  };
  
  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // Process results and go to results page
      const results = processResults();
      onComplete(results);
    }
  };
  
  const handleBack = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };
  
  const processResults = () => {
    // In a real app, this would use a more sophisticated algorithm
    // to determine the best products based on the answers
    
    const purpose = answers.purpose;
    const preferences = answers.preferences || [];
    const intensity = answers.intensity || 3;
    const application = answers.application || [];
    const lifestyle = answers.lifestyle;
    
    // Determine recommended scent profiles based on answers
    const recommendedProfiles = (scentProfiles || [])
      .filter((profile: any) => preferences.includes(profile.name.toLowerCase()))
      .slice(0, 3);
    
    // Determine recommended mood categories
    const recommendedMood = (moods || [])
      .find((mood: any) => {
        if (purpose === "relaxation" && mood.name === "Relaxation") return true;
        if (purpose === "energy" && mood.name === "Energy") return true;
        if (purpose === "focus" && mood.name === "Focus") return true;
        if (purpose === "mood" && mood.name === "Balance") return true;
        return false;
      });
    
    // Return the results
    return {
      purpose,
      preferences,
      intensity,
      application,
      lifestyle,
      recommendedProfiles,
      recommendedMood,
      // In a real app, you would also include recommended products
      recommendedProducts: []
    };
  };
  
  return (
    <div className="bg-white rounded-lg shadow-sm p-8">
      <h1 className="text-3xl font-heading mb-2 text-center">Find Your Perfect Scent</h1>
      <p className="text-neutral-mid mb-8 text-center">Answer a few questions to discover products tailored just for you</p>
      
      <div className="mb-8">
        <Progress value={progress} className="h-2" />
        <div className="flex justify-between mt-2 text-xs text-neutral-mid">
          <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
          <span>{Math.round(progress)}% Complete</span>
        </div>
      </div>
      
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestionIndex}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.3 }}
        >
          <div className="mb-10">
            <h2 className="text-xl font-heading mb-6">{currentQuestion.question}</h2>
            
            {!currentQuestion.type && (
              <RadioGroup
                value={answers[currentQuestion.id] || ""}
                onValueChange={handleSingleAnswer}
                className="space-y-3"
              >
                {currentQuestion.options.map((option) => (
                  <div key={option.id} className="flex items-center space-x-3">
                    <RadioGroupItem value={option.id} id={option.id} />
                    <Label htmlFor={option.id} className="cursor-pointer">
                      {option.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            )}
            
            {currentQuestion.type === "multi" && (
              <div className="space-y-3">
                {currentQuestion.options.map((option) => (
                  <div key={option.id} className="flex items-center space-x-3">
                    <Checkbox
                      id={option.id}
                      checked={(answers[currentQuestion.id] || []).includes(option.id)}
                      onCheckedChange={(checked) => 
                        handleMultiAnswer(option.id, checked as boolean)
                      }
                    />
                    <Label htmlFor={option.id} className="cursor-pointer">
                      {option.label}
                    </Label>
                  </div>
                ))}
              </div>
            )}
            
            {currentQuestion.type === "slider" && (
              <div className="space-y-8">
                <Slider
                  defaultValue={[answers[currentQuestion.id] || 3]}
                  min={currentQuestion.min}
                  max={currentQuestion.max}
                  step={1}
                  onValueChange={handleSliderAnswer}
                  className="mt-6"
                />
                <div className="flex justify-between px-1 text-sm text-neutral-mid">
                  {currentQuestion.labels.map((label, i) => (
                    <span 
                      key={i} 
                      className={`text-center ${
                        (answers[currentQuestion.id] || 3) === i + 1 
                          ? "font-medium text-primary" 
                          : ""
                      }`}
                      style={{ width: `${100 / currentQuestion.labels.length}%` }}
                    >
                      {label}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
      
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={handleBack}
          disabled={currentQuestionIndex === 0}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button
          onClick={handleNext}
          disabled={!isQuestionAnswered()}
          className="bg-primary hover:bg-primary-dark"
        >
          {currentQuestionIndex < questions.length - 1 ? (
            <>
              Next
              <ArrowRight className="ml-2 h-4 w-4" />
            </>
          ) : (
            "Get Results"
          )}
        </Button>
      </div>
    </div>
  );
}
