
import React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface ConfirmDialogProps {
  isOpen: boolean;
  open?: boolean; // Added for backward compatibility
  onClose: () => void;
  onOpenChange?: (open: boolean) => void; // Added for backward compatibility
  onConfirm: () => Promise<void | boolean> | void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "default" | "destructive";
  isLoading?: boolean;
}

const ConfirmDialog = ({
  isOpen,
  open,
  onClose,
  onOpenChange,
  onConfirm,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "default",
  isLoading = false
}: ConfirmDialogProps) => {
  // Use either isOpen or open prop for backward compatibility
  const isDialogOpen = isOpen || open || false;
  
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onClose();
      if (onOpenChange) onOpenChange(open);
    }
  };

  const handleConfirm = async () => {
    try {
      // Call the onConfirm function and await its result
      const result = await onConfirm();
      
      // Only close if the result is true or undefined (not false)
      if (result !== false) {
        onClose();
        if (onOpenChange) onOpenChange(false);
      }
    } catch (error) {
      console.error("Error during confirmation:", error);
      // Don't close the dialog on error
    }
  };

  return (
    <AlertDialog open={isDialogOpen} onOpenChange={handleOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>{cancelText}</AlertDialogCancel>
          <Button 
            variant={variant} 
            onClick={handleConfirm}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : confirmText}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ConfirmDialog;
