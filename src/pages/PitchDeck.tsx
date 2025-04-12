
import React, { useState, useRef, useEffect } from "react";
import { slideData } from "@/components/pitch-deck/SlideData";
import SlideContainer from "@/components/pitch-deck/SlideContainer";
import SlideNavigation from "@/components/pitch-deck/SlideNavigation";
import Confetti from "@/components/pitch-deck/Confetti";
import { useCapacitor } from "@/hooks/useCapacitor";
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
      }, 3000);
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
      }, 300);
    }
  };
  
  const handleNextSlide = () => {
    if (currentSlide < slideData.length - 1 && !isAnimating) {
      setDirection('next');
      setIsAnimating(true);
      
      slideTimerRef.current = window.setTimeout(() => {
        setCurrentSlide(prev => prev + 1);
        setIsAnimating(false);
      }, 300);
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
    <div className="flex flex-col min-h-screen">
      <SlideNavigation
        currentSlide={currentSlide}
        totalSlides={slideData.length}
        onPrev={handlePrevSlide}
        onNext={handleNextSlide}
        titles={slideData.map(slide => slide.title)}
      />
      
      <div className="flex-1 relative overflow-hidden">
        {slideData.map((slide, index) => (
          <SlideContainer
            key={index}
            bgColor={slide.bgColor}
            isActive={currentSlide === index}
            direction={direction}
            isAnimating={isAnimating && (
              (direction === 'next' && currentSlide === index - 1) ||
              (direction === 'prev' && currentSlide === index + 1)
            )}
          >
            {renderSlideContent(index)}
          </SlideContainer>
        ))}
      </div>
      
      <Confetti isActive={isConfettiActive} />
    </div>
  );
};

export default PitchDeck;
