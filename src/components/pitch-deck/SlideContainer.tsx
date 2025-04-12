
import React from "react";
import { cn } from "@/lib/utils";

interface SlideContainerProps {
  bgColor: string;
  children: React.ReactNode;
  isActive?: boolean;
  direction?: 'next' | 'prev';
  isAnimating?: boolean;
}

const SlideContainer: React.FC<SlideContainerProps> = ({
  bgColor,
  children,
  isActive = false,
  direction = 'next',
  isAnimating = false,
}) => {
  const getSlideClasses = () => {
    if (!isActive && !isAnimating) return "hidden";
    
    let animationClass = "";
    if (isAnimating) {
      animationClass = direction === 'next' ? "animate-slide-out-left" : "animate-slide-out-right";
    } else if (isActive) {
      animationClass = direction === 'next' ? "animate-slide-in-right" : "animate-slide-in-left";
    }
    
    return cn(
      "absolute top-0 left-0 w-full h-full p-6 transition-all duration-500 overflow-y-auto",
      animationClass
    );
  };

  return (
    <div className={cn(getSlideClasses(), bgColor)}>
      <div className="max-w-3xl mx-auto">
        {children}
      </div>
    </div>
  );
};

export default SlideContainer;
