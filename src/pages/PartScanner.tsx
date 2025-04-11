
import React, { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { Camera, FlipCamera, Scan, XCircle, ImagePlus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { formatPrice } from "@/lib/utils";
import { Part } from "@/hooks/car-parts/types";

const PartScanner = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [isStreaming, setIsStreaming] = useState(false);
  const [isFrontCamera, setIsFrontCamera] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<Part | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Start the camera stream
  const startCamera = async () => {
    try {
      setError(null);
      
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Camera access is not supported in your browser");
      }
      
      const constraints = {
        video: {
          facingMode: isFrontCamera ? "user" : "environment",
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsStreaming(true);
      }
    } catch (err: any) {
      console.error("Error accessing camera:", err);
      setError(`Camera error: ${err.message || "Could not access camera"}`);
      setIsStreaming(false);
    }
  };
  
  // Stop the camera stream
  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setIsStreaming(false);
    }
  };
  
  // Toggle between front and back camera
  const toggleCamera = () => {
    stopCamera();
    setIsFrontCamera(!isFrontCamera);
  };
  
  // Trigger file selection dialog
  const selectImage = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  // Handle file input change
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        if (canvasRef.current) {
          const ctx = canvasRef.current.getContext('2d');
          if (ctx) {
            // Set canvas dimensions to match image
            canvasRef.current.width = img.width;
            canvasRef.current.height = img.height;
            
            // Draw image to canvas
            ctx.drawImage(img, 0, 0);
            
            // Scan the image
            scanImage(canvasRef.current);
          }
        }
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };
  
  // Capture and scan the current camera frame
  const captureAndScan = () => {
    if (!isStreaming || !videoRef.current || !canvasRef.current) {
      toast({
        title: "Camera Error",
        description: "Camera is not active. Please start the camera first.",
        variant: "destructive",
      });
      return;
    }
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      // Match canvas size to video size
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // Draw current video frame to canvas
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Process the image
      scanImage(canvas);
    }
  };
  
  // Process the image in the canvas using the AI model
  const scanImage = async (canvas: HTMLCanvasElement) => {
    setIsScanning(true);
    setScanResult(null);
    
    try {
      // Convert canvas to blob
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((blob) => {
          if (blob) resolve(blob);
          else throw new Error("Failed to create image blob");
        }, 'image/jpeg', 0.8);
      });
      
      // Create a form data object to send the image
      const formData = new FormData();
      formData.append('image', blob, 'car-part.jpg');
      
      toast({
        title: "Scanning Part",
        description: "Analyzing the image with our AI model...",
      });
      
      // Call the edge function to process the image
      const { data: processingResult, error: functionError } = await supabase.functions.invoke(
        'scan-car-part',
        {
          body: formData,
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      
      if (functionError) {
        throw new Error(`Error scanning part: ${functionError.message}`);
      }
      
      if (!processingResult?.part) {
        throw new Error("Could not identify the car part");
      }
      
      // Set the scan result
      setScanResult(processingResult.part);
      
      toast({
        title: "Part Identified",
        description: `Found matching part: ${processingResult.part.name}`,
      });
      
    } catch (err: any) {
      console.error("Error scanning image:", err);
      setError(err.message || "Failed to scan image");
      
      toast({
        title: "Scan Failed",
        description: err.message || "Failed to identify the car part",
        variant: "destructive",
      });
    } finally {
      setIsScanning(false);
    }
  };
  
  // Navigate to the part details page
  const viewPart = () => {
    if (scanResult) {
      // TODO: Navigate to a part details page with the scan result ID
      toast({
        title: "Viewing Part",
        description: `Showing details for ${scanResult.name}`,
      });
      
      // For now, we'll navigate back to the home page
      navigate("/");
    }
  };
  
  // Start camera when component mounts or camera preference changes
  useEffect(() => {
    if (!isStreaming) {
      startCamera();
    }
    
    // Cleanup on unmount
    return () => {
      stopCamera();
    };
  }, [isFrontCamera]);
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Car Part Scanner</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="flex flex-col space-y-4">
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              {/* Main video display */}
              <div className="relative w-full bg-black aspect-video">
                <video 
                  ref={videoRef}
                  autoPlay 
                  playsInline 
                  muted 
                  className="w-full h-full object-cover"
                />
                
                {!isStreaming && !isScanning && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 text-white p-4">
                    <Camera className="w-16 h-16 mb-4" />
                    <p className="text-center">Camera is not active. Click the button below to start.</p>
                    <Button onClick={startCamera} className="mt-4">
                      Start Camera
                    </Button>
                  </div>
                )}
                
                {isScanning && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                    <LoadingSpinner size="lg" />
                  </div>
                )}
              </div>
              
              {/* Hidden canvas for image processing */}
              <canvas ref={canvasRef} className="hidden" />
              
              {/* Hidden file input */}
              <input 
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </CardContent>
          </Card>
          
          {/* Camera controls */}
          <div className="flex justify-between">
            <div className="space-x-2">
              {isStreaming ? (
                <Button variant="outline" onClick={stopCamera}>
                  <XCircle className="mr-2 h-4 w-4" />
                  Stop Camera
                </Button>
              ) : (
                <Button variant="outline" onClick={startCamera}>
                  <Camera className="mr-2 h-4 w-4" />
                  Start Camera
                </Button>
              )}
              
              <Button variant="outline" onClick={toggleCamera} disabled={!isStreaming}>
                <FlipCamera className="mr-2 h-4 w-4" />
                Switch Camera
              </Button>
            </div>
            
            <div className="space-x-2">
              <Button variant="outline" onClick={selectImage}>
                <ImagePlus className="mr-2 h-4 w-4" />
                Upload Image
              </Button>
              
              <Button 
                onClick={captureAndScan} 
                disabled={!isStreaming || isScanning}
                className="bg-mechanica-500 hover:bg-mechanica-600"
              >
                <Scan className="mr-2 h-4 w-4" />
                {isScanning ? "Scanning..." : "Scan Part"}
              </Button>
            </div>
          </div>
          
          {/* Error message */}
          {error && (
            <Alert variant="destructive">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>
        
        {/* Results section */}
        <div className="flex flex-col space-y-4">
          <Card>
            <CardContent className="pt-6">
              <h2 className="text-2xl font-semibold mb-4">Scan Results</h2>
              
              {!scanResult && !isScanning && (
                <div className="text-center py-12 text-gray-500">
                  <Scan className="mx-auto h-12 w-12 mb-4" />
                  <p>No part scanned yet. Capture or upload an image to identify a part.</p>
                </div>
              )}
              
              {isScanning && (
                <div className="flex flex-col items-center justify-center py-12">
                  <LoadingSpinner size="md" />
                  <p className="mt-4 text-gray-600">Analyzing image...</p>
                </div>
              )}
              
              {scanResult && (
                <div className="space-y-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 w-24 h-24 bg-gray-100 rounded-md overflow-hidden mr-4">
                      {scanResult.image_url ? (
                        <img 
                          src={scanResult.image_url} 
                          alt={scanResult.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-200">
                          <span className="text-gray-400">No image</span>
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="font-medium">{scanResult.name}</h3>
                      <p className="text-sm text-gray-500">{scanResult.description}</p>
                      <p className="font-bold text-mechanica-600 mt-1">
                        {formatPrice(scanResult.price)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="pt-2">
                    <Button onClick={viewPart} className="w-full">
                      View Part Details
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
            <h3 className="font-medium text-blue-800 mb-2">How to use the scanner</h3>
            <ul className="list-disc pl-5 text-sm text-blue-700 space-y-1">
              <li>Position the car part in good lighting</li>
              <li>Keep the camera steady and ensure the part is clearly visible</li>
              <li>Click "Scan Part" to analyze the image</li>
              <li>For better results, you can also upload an existing photo</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PartScanner;
