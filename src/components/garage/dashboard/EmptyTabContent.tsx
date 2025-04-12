
import React from "react";
import { LucideIcon } from "lucide-react";

interface EmptyTabContentProps {
  Icon: LucideIcon;
  message: string;
}

export const EmptyTabContent: React.FC<EmptyTabContentProps> = ({ Icon, message }) => {
  return (
    <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
      <div className="mb-4">
        <Icon className="w-16 h-16 mx-auto text-gray-400" />
      </div>
      <p className="text-lg text-gray-600 mb-4">
        {message}
      </p>
    </div>
  );
};
