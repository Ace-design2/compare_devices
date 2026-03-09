import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { fetchAllDevices } from "../services/api";
import type { DeviceData } from "../components/DeviceSlot";
import Button from "../components/Button";
import "./RecommendPage.css";

// --- Types ---
type Persona = "Student" | "Freelancer" | "Professional" | "Business Owner" | "Content Creator" | "Casual User" | null;
type DevicePreference = "Smartphone" | "Tablet" | "Not sure yet" | null;
type UseCase = "Studying / Reading" | "Work & Productivity" | "Social Media" | "Gaming" | "Photography & Videos" | "Content Creation" | "Entertainment (movies, streaming)";
type PerformanceLevel = "Basic (calls, browsing, apps)" | "Balanced (multitasking, social media, light gaming)" | "High Performance (gaming, heavy apps, content creation)" | null;
type KeyFeature = "Long battery life" | "Great camera" | "Large display" | "Lightweight & portable" | "Fast performance" | "High storage" | "Stylus support (for tablets)";
type GenerationPreference = "Latest (Released this year)" | "Recent (1-2 years old)" | "Older (Great value)" | null;
type BudgetRange = "Budget" | "Mid-range" | "Premium" | null;

// Extracted options for mapping
const PERSONAS: Persona[] = ["Student", "Freelancer", "Professional", "Business Owner", "Content Creator", "Casual User"];
const PREFERENCES: DevicePreference[] = ["Smartphone", "Tablet", "Not sure yet"];
const USE_CASES: UseCase[] = ["Studying / Reading", "Work & Productivity", "Social Media", "Gaming", "Photography & Videos", "Content Creation", "Entertainment (movies, streaming)"];
const PERFORMANCES: PerformanceLevel[] = ["Basic (calls, browsing, apps)", "Balanced (multitasking, social media, light gaming)", "High Performance (gaming, heavy apps, content creation)"];
const FEATURES: KeyFeature[] = ["Long battery life", "Great camera", "Large display", "Lightweight & portable", "Fast performance", "High storage", "Stylus support (for tablets)"];
const GENERATIONS: GenerationPreference[] = ["Latest (Released this year)", "Recent (1-2 years old)", "Older (Great value)"];
const BUDGETS: BudgetRange[] = ["Budget", "Mid-range", "Premium"];

interface RecommendAnswers {
  persona: Persona;
  preference: DevicePreference;
  useCases: UseCase[];
  performance: PerformanceLevel;
  features: KeyFeature[];
  generation: GenerationPreference;
  budget: BudgetRange;
}

interface RecommendPageProps {
  onViewDetails?: (deviceId: string) => void;
}

const RecommendPage = ({ onViewDetails }: RecommendPageProps) => {
  const [step, setStep] = useState(1);
  const totalSteps = 7;
  
  const [answers, setAnswers] = useState<RecommendAnswers>({
    persona: null,
    preference: null,
    useCases: [],
    performance: null,
    features: [],
    generation: null,
    budget: null,
  });

  const [recommendedDevices, setRecommendedDevices] = useState<DeviceData[]>([]);
  const [allDevices, setAllDevices] = useState<DeviceData[]>([]);
  const [loading, setLoading] = useState(true);

  // We filter on the final step 7
  const generateRecommendations = () => {
    // Simple heuristic-based matching
    let scoredDevices = allDevices.map(device => {
      let score = 0;
      
      // Preference matching 
      const isTablet = device.category?.toLowerCase() === 'tablet' || device.name?.toLowerCase().includes('tab') || device.name?.toLowerCase().includes('ipad');
      if (answers.preference === "Tablet" && isTablet) score += 5;
      if (answers.preference === "Smartphone" && !isTablet) score += 5;

      // Price matching (crude estimation based on typical brand/model indicators if price is unavailable)
      // Usually, Pro/Ultra/Max are premium, A-series/Lite are budget
      const nameLower = device.name?.toLowerCase() || '';
      const isPremium = nameLower.includes('pro') || nameLower.includes('ultra') || nameLower.includes('max') || nameLower.includes('fold');
      const isBudget = nameLower.includes('lite') || nameLower.includes('play') || nameLower.includes('a') || nameLower.match(/[0-9]a/);
      
      if (answers.budget === "Premium" && isPremium) score += 3;
      if (answers.budget === "Budget" && isBudget) score += 3;
      if (answers.budget === "Mid-range" && !isPremium && !isBudget) score += 3;

      // Feature matching
      if (answers.features.includes("Great camera") && (nameLower.includes('pro') || nameLower.includes('ultra') || nameLower.includes('pixel'))) score += 2;
      if (answers.features.includes("Stylus support (for tablets)") && (nameLower.includes('ultra') || nameLower.includes('tab s') || nameLower.includes('ipad pro'))) score += 3;
      if (answers.features.includes("Large display") && (nameLower.includes('max') || nameLower.includes('plus') || nameLower.includes('ultra') || isTablet)) score += 2;

      // Performance matching
      if (answers.performance === "High Performance (gaming, heavy apps, content creation)" && isPremium) score += 3;
      if (answers.performance === "Basic (calls, browsing, apps)" && isBudget) score += 2;

      // Generation matching
      const launchString = device.specs?.Launch?.Announced || device.specs?.Launch?.Status || "";
      const yearMatch = launchString.match(/\b(20\d{2})\b/);
      const year = yearMatch ? parseInt(yearMatch[1], 10) : 2022; // Default to somewhat recent if unknown
      
      const currentYear = new Date().getFullYear();
      const age = currentYear - year;

      if (answers.generation === "Latest (Released this year)" && age <= 1) score += 4;
      if (answers.generation === "Recent (1-2 years old)" && age >= 1 && age <= 2) score += 3;
      if (answers.generation === "Older (Great value)" && age > 2) score += 4;

      return { device, score };
    });

    // Sort by score descending
    scoredDevices.sort((a, b) => b.score - a.score);
    
    // Take top 3 recommendations
    setRecommendedDevices(scoredDevices.slice(0, 3).map(s => s.device));
  };

  const isStepValid = () => {
    switch (step) {
      case 1: return answers.persona !== null;
      case 2: return answers.preference !== null;
      case 3: return answers.useCases.length > 0;
      case 4: return answers.performance !== null;
      case 5: return answers.features.length > 0;
      case 6: return answers.generation !== null;
      case 7: return answers.budget !== null;
      default: return true;
    }
  };

  // Load all devices on mount so we can filter them later
  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchAllDevices();
        setAllDevices(data);
      } catch (err) {
        console.error("Failed to fetch devices", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 50 : -50,
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 50 : -50,
      opacity: 0,
    }),
  };

  const [direction, setDirection] = useState(0);

  const handleNext = () => {
    setDirection(1);
    setStep((s) => Math.min(s + 1, totalSteps + 1));
  };
  const handlePrev = () => {
    setDirection(-1);
    setStep((s) => Math.max(s - 1, 1));
  };

  const handleSingleSelect = (field: keyof RecommendAnswers, value: any) => {
    setAnswers({ ...answers, [field]: value });
  };

  const handleMultiSelect = (field: keyof RecommendAnswers, value: any) => {
    const currentList = answers[field] as any[];
    if (currentList.includes(value)) {
      setAnswers({ ...answers, [field]: currentList.filter(item => item !== value) });
    } else {
      setAnswers({ ...answers, [field]: [...currentList, value] });
    }
  };

  const renderOptionGrid = (
    options: any[],
    selectedValues: any | any[],
    onSelect: (val: any) => void,
    isMulti = false
  ) => {
    return (
      <div className="option-grid">
        {options.map((option) => {
          const isSelected = isMulti 
            ? selectedValues.includes(option) 
            : selectedValues === option;
            
          return (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`option-btn ${isSelected ? "selected" : ""}`}
              key={option}
              onClick={() => onSelect(option)}
            >
              {option}
            </motion.button>
          );
        })}
      </div>
    );
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="step-content">
            <h2>Which option best describes you?</h2>
            {renderOptionGrid(PERSONAS, answers.persona, (val) => handleSingleSelect("persona", val))}
          </div>
        );
      case 2:
        return (
          <div className="step-content">
            <h2>Which device are you looking for today?</h2>
            {renderOptionGrid(PREFERENCES, answers.preference, (val) => handleSingleSelect("preference", val))}
          </div>
        );
      case 3:
        return (
          <div className="step-content">
            <h2>How will you mainly use it?</h2>
            <p className="step-subtitle">Choose the activities that matter most to you.</p>
            {renderOptionGrid(USE_CASES, answers.useCases, (val) => handleMultiSelect("useCases", val), true)}
          </div>
        );
      case 4:
        return (
          <div className="step-content">
            <h2>What level of performance do you need?</h2>
            {renderOptionGrid(PERFORMANCES, answers.performance, (val) => handleSingleSelect("performance", val))}
          </div>
        );
      case 5:
        return (
          <div className="step-content">
            <h2>What features matter most to you?</h2>
            <p className="step-subtitle">Select the features that are important for your daily use.</p>
            {renderOptionGrid(FEATURES, answers.features, (val) => handleMultiSelect("features", val), true)}
          </div>
        );
      case 6:
        return (
          <div className="step-content">
            <h2>Device Generation</h2>
            <p className="step-subtitle">Do you prefer the absolute newest tech, or are you hoping for a bargain on a slightly older model?</p>
            {renderOptionGrid(GENERATIONS, answers.generation, (val) => handleSingleSelect("generation", val))}
          </div>
        );
      case 7:
        return (
          <div className="step-content">
            <h2>What price range are you comfortable with?</h2>
            {renderOptionGrid(BUDGETS, answers.budget, (val) => handleSingleSelect("budget", val))}
          </div>
        );
      case 8:
        return (
          <div className="step-content results-content">
            <h2>Your Perfect Matches</h2>
            <p className="step-subtitle">Based on your lifestyle and preferences, we recommend these devices:</p>
            
            {loading ? (
              <div className="loading-spinner">Analyzing...</div>
            ) : (
              <div className="recommendation-grid">
                {recommendedDevices.map((device, idx) => (
                  <div key={device.id} className="recommendation-card" style={{ animationDelay: `${idx * 0.1}s`}}>
                    <div className="match-badge">{idx === 0 ? "Top Match" : "Great Alternative"}</div>
                    <h3>{device.name}</h3>
                    {device.image && (
                      <div className="rec-image">
                        <img src={`https://fdn2.gsmarena.com/vv/bigpic/${device.image}`} alt={device.name} />
                      </div>
                    )}
                    <Button 
                      variant="secondary" 
                      size="sm" 
                      onClick={() => {
                        if (onViewDetails) {
                          onViewDetails(device.id);
                        } else {
                          window.open(`http://localhost:5173/`, '_blank');
                        }
                      }}
                    >
                      View Details
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      default:
        return <div>Placeholder Step {step}</div>;
    }
  };

  const handleFinish = () => {
    generateRecommendations();
    handleNext();
  };

  return (
    <div className="recommend-page">
      <div className="recommend-header">
        <h1>Find Your Perfect Fit</h1>
        <p>Answer a few quick questions to align with your lifestyle</p>
      </div>

      <div className="wizard-container">
        {step <= totalSteps ? (
          <div className="wizard-step-indicator">
            Step {step} of {totalSteps}
          </div>
        ) : null}

        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 },
            }}
            className="wizard-step-wrapper"
          >
            {renderStepContent()}
          </motion.div>
        </AnimatePresence>

        <div className="wizard-actions">
          {step > 1 && step <= totalSteps + 1 && (
            <Button variant="secondary" onClick={handlePrev}>
              {step === totalSteps + 1 ? "Start Over" : "Back"}
            </Button>
          )}
          {step < totalSteps && (
            <Button variant="primary" onClick={handleNext} disabled={!isStepValid()}>
              Next
            </Button>
          )}
          {step === totalSteps && (
            <Button variant="primary" onClick={handleFinish} disabled={!isStepValid()}>
              Show Recommendations
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecommendPage;
