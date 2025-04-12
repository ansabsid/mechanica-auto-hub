
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
    <div className="flex flex-col w-full bg-white/90 backdrop-blur-md shadow-md py-3 px-5 sticky top-0 z-10 border-b border-gray-100">
      <div className="flex justify-between items-center">
        <Button
          variant="ghost"
          size="sm"
          onClick={onPrev}
          disabled={currentSlide === 0}
          className="flex items-center text-mechanica-600 hover:bg-mechanica-50 transition-all duration-300 group"
        >
          <ChevronLeft className="h-4 w-4 mr-1 group-hover:-translate-x-1 transition-transform duration-300" />
          <span className="text-sm">Previous</span>
        </Button>
        
        <div className="text-center">
          <h2 className="text-xl font-bold bg-gradient-to-r from-mechanica-600 to-mechanica-500 bg-clip-text text-transparent">{titles[currentSlide]}</h2>
          <div className="text-xs text-muted-foreground mt-1 flex items-center justify-center space-x-1">
            {Array.from({ length: totalSlides }).map((_, i) => (
              <span 
                key={i} 
                className={cn(
                  "w-1.5 h-1.5 rounded-full transition-all duration-300",
                  i === currentSlide 
                    ? "bg-mechanica-500 scale-125" 
                    : "bg-gray-300 scale-100"
                )}
              />
            ))}
          </div>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={onNext}
          disabled={currentSlide === totalSlides - 1}
          className="flex items-center text-mechanica-600 hover:bg-mechanica-50 transition-all duration-300 group"
        >
          <span className="text-sm">Next</span>
          <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform duration-300" />
        </Button>
      </div>
      
      <div className="w-full bg-gray-200 h-1.5 mt-3 rounded-full overflow-hidden">
        <div 
          className="bg-gradient-to-r from-mechanica-500 to-mechanica-400 h-full rounded-full transition-all duration-500 ease-out"
          style={{ width: `${((currentSlide + 1) / totalSlides) * 100}%` }}
        />
      </div>
    </div>
  );
};

const cn = (...classes: (string | boolean | undefined)[]): string => {
  return classes.filter(Boolean).join(' ');
};

export default SlideNavigation;
