
import React from "react";
import { PlayCircle } from "lucide-react";

const VideoSlide: React.FC = () => {
  return (
    <div className="relative h-full flex flex-col items-center justify-center">
      <div className="w-full max-w-3xl aspect-video bg-gradient-to-br from-mechanica-100 to-mechanica-50 rounded-xl shadow-lg overflow-hidden">
        <video 
          className="w-full h-full object-cover"
          controls
          poster="/lovable-uploads/3cba6a96-fa1a-4ab2-b825-24bdd2c67cd0.png"
        >
          <source src="/demo-video.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/20 transition-colors cursor-pointer group">
          <PlayCircle className="w-16 h-16 text-white opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all" />
        </div>
      </div>
      <p className="mt-4 text-center text-sm text-muted-foreground">
        Click to watch our product demo
      </p>
    </div>
  );
};

export default VideoSlide;
