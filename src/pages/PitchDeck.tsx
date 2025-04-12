
import React, { useState, useRef, useEffect } from "react";
import { slideData } from "@/components/pitch-deck/SlideData";
import SlideContainer from "@/components/pitch-deck/SlideContainer";
import SlideNavigation from "@/components/pitch-deck/SlideNavigation";
import Confetti from "@/components/pitch-deck/Confetti";
import { useCapacitor } from "@/hooks/useCapacitor";
import { ChevronDown, ChevronUp } from "lucide-react";
import {
  IntroSlide,
  ProblemSlide,
  SolutionSlide,
  MarketSlide,
  AdvantagesSlide,
  BusinessModelSlide,
  RoadmapSlide,
  TeamSlide,
  InvestmentSlide,
  ContactSlide
} from "@/components/pitch-deck/slides";

const PitchDeck = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState<'next' | 'prev'>('next');
  const [isAnimating, setIsAnimating] = useState(false);
  const { isCapacitor } = useCapacitor();
  const slideTimerRef = useRef<number | null>(null);
  const [isConfettiActive, setIsConfettiActive] = useState(false);
  const [showScrollHint, setShowScrollHint] = useState(true);
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        handleNextSlide();
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        handlePrevSlide();
      }
    };
    
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentSlide, isAnimating]);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowScrollHint(false);
    }, 5000);
    
    return () => clearTimeout(timer);
  }, []);
  
  useEffect(() => {
    return () => {
      if (slideTimerRef.current !== null) {
        window.clearTimeout(slideTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (currentSlide === 9) {
      setIsConfettiActive(true);
      const timer = setTimeout(() => {
        setIsConfettiActive(false);
      }, 5000); // Increased from 3000 to 5000ms for a longer effect
      return () => clearTimeout(timer);
    }
  }, [currentSlide]);
  
  const handlePrevSlide = () => {
    if (currentSlide > 0 && !isAnimating) {
      setDirection('prev');
      setIsAnimating(true);
      
      slideTimerRef.current = window.setTimeout(() => {
        setCurrentSlide(prev => prev - 1);
        setIsAnimating(false);
      }, 450);
    }
  };
  
  const handleNextSlide = () => {
    if (currentSlide < slideData.length - 1 && !isAnimating) {
      setDirection('next');
      setIsAnimating(true);
      
      slideTimerRef.current = window.setTimeout(() => {
        setCurrentSlide(prev => prev + 1);
        setIsAnimating(false);
      }, 450);
    }
  };
  
  const renderSlideContent = (index: number) => {
    switch (index) {
      case 0:
        return <IntroSlide />;
      case 1:
        return <ProblemSlide />;
      case 2:
        return <SolutionSlide />;
      case 3:
        return <MarketSlide />;
      case 4:
        return <AdvantagesSlide />;
      case 5:
        return <BusinessModelSlide />;
      case 6:
        return <RoadmapSlide />;
      case 7:
        return <TeamSlide />;
      case 8:
        return <InvestmentSlide />;
      case 9:
        return <ContactSlide />;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <SlideNavigation
        currentSlide={currentSlide}
        totalSlides={slideData.length}
        onPrev={handlePrevSlide}
        onNext={handleNextSlide}
        titles={slideData.map(slide => slide.title)}
      />
      
      <div className="flex-1 relative overflow-hidden p-4">
        {slideData.map((slide, index) => (
          <SlideContainer
            key={index}
            bgColor={slide.bgColor}
            isActive={currentSlide === index}
            direction={direction}
            isAnimating={isAnimating && currentSlide === index}
          >
            {renderSlideContent(index)}
          </SlideContainer>
        ))}
        
        {showScrollHint && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex flex-col items-center animate-bounce opacity-70">
            <p className="text-xs text-gray-500 mb-1">Swipe or use arrow keys</p>
            <div className="flex space-x-3">
              <ChevronUp className="h-5 w-5 text-gray-400" />
              <ChevronDown className="h-5 w-5 text-gray-400" />
            </div>
          </div>
        )}
      </div>
      
      <Confetti isActive={isConfettiActive} />
    </div>
  );
};

export default PitchDeck;
