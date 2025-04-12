
import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SlideNavigationProps {
  currentSlide: number;
  totalSlides: number;
  onPrev: () => void;
  onNext: () => void;
  titles: string[];
}

const SlideNavigation: React.FC<SlideNavigationProps> = ({
  currentSlide,
  totalSlides,
  onPrev,
  onNext,
  titles,
}) => {
  return (
    <div className="flex flex-col w-full bg-white shadow-sm py-2 px-4 sticky top-0 z-10">
      <div className="flex justify-between items-center">
        <Button
          variant="ghost"
          size="sm"
          onClick={onPrev}
          disabled={currentSlide === 0}
          className="flex items-center text-mechanica-600"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          <span className="text-sm">Previous</span>
        </Button>
        
        <div className="text-center">
          <h2 className="text-xl font-bold text-mechanica-600">{titles[currentSlide]}</h2>
          <div className="text-xs text-muted-foreground mt-1">
            Slide {currentSlide + 1} of {totalSlides}
          </div>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={onNext}
          disabled={currentSlide === totalSlides - 1}
          className="flex items-center text-mechanica-600"
        >
          <span className="text-sm">Next</span>
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
      
      <div className="w-full bg-gray-200 h-1 mt-2">
        <div 
          className="bg-mechanica-500 h-1 transition-all duration-300"
          style={{ width: `${((currentSlide + 1) / totalSlides) * 100}%` }}
        />
      </div>
    </div>
  );
};

export default SlideNavigation;
