
import React from "react";
import { Settings, Coffee, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

const ContactSlide: React.FC = () => {
  const navigate = useNavigate();
  const [isDownloading, setIsDownloading] = React.useState(false);
  
  const handleContactClick = () => {
    navigate("/contact");
  };
  
  const handleDownloadClick = async () => {
    try {
      setIsDownloading(true);
      
      // Simulate downloading process
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Create a new blob with PDF content type
      const response = await fetch('/lovable-uploads/bc5d716e-e89a-48a9-b038-082d8861b31d.png');
      const blob = await response.blob();
      
      // Create a new blob with the correct PDF MIME type
      const pdfBlob = new Blob([blob], { type: 'application/pdf' });
      
      // Create a download link for the PDF
      const blobUrl = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = 'BookMyParts_PitchDeck_2025.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up the blob URL
      URL.revokeObjectURL(blobUrl);
      
      toast({
        title: "Download started",
        description: "Your pitch deck is downloading now",
        variant: "default",
      });
    } catch (error) {
      console.error("Download error:", error);
      toast({
        title: "Download failed",
        description: "There was a problem downloading the pitch deck. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDownloading(false);
    }
  };
  
  return (
    <div className="flex flex-col items-center justify-center text-center space-y-6">
      <div className="relative animate-bounce">
        <Settings className="h-12 w-12 text-mechanica-500" />
        <div className="absolute -right-1 -bottom-1">
          <Coffee className="h-6 w-6 text-amber-500" />
        </div>
      </div>
      
      <div>
        <h3 className="text-2xl font-bold text-mechanica-600">Let's Build The Future Together</h3>
        <p className="text-muted-foreground mt-2">Ready to transform the auto parts and service industry?</p>
      </div>
      
      <div className="flex space-x-4">
        <Button 
          variant="mechanica" 
          className="rounded-full shadow-md hover:shadow-lg transition-all"
          onClick={handleContactClick}
        >
          Contact Us
        </Button>
        <Button 
          variant="outline" 
          className="rounded-full border-mechanica-300 shadow-sm hover:bg-mechanica-50 flex items-center gap-2"
          onClick={handleDownloadClick}
          disabled={isDownloading}
        >
          {isDownloading ? (
            <>
              <LoadingSpinner size="sm" className="h-4 w-4" />
              <span>Downloading...</span>
            </>
          ) : (
            <>
              <Download className="h-4 w-4" />
              <span>Download Pitch Deck</span>
            </>
          )}
        </Button>
      </div>
      
      <div className="pt-6 border-t border-gray-200 w-full max-w-xs mx-auto mt-4">
        <p className="text-sm font-medium text-mechanica-700">Team@BookMyParts.com</p>
        <p className="text-sm text-muted-foreground">Dubai, UAE</p>
      </div>
    </div>
  );
};

export default ContactSlide;
