import React from "react";
import { Card, CardContent } from "./card";
import { LightbulbIcon, XIcon } from 'lucide-react';
import { Button } from "./button";

interface TipCardProps {
  title: string;
  tips: string[];
  icon?: React.ReactNode;
  variant?: "default" | "success" | "warning" | "info";
  onClose?: () => void;
  className?: string;
}

export function TipCard({
  title,
  tips,
  icon,
  variant = "default",
  onClose,
  className = "",
}: TipCardProps) {
  // Define color schemes based on variant
  const colorSchemes = {
    default: {
      bg: "bg-blue-50",
      border: "border-blue-100",
      title: "text-blue-700",
      text: "text-blue-700",
      icon: <LightbulbIcon className="h-4 w-4 mr-1 text-blue-500" />,
    },
    success: {
      bg: "bg-green-50",
      border: "border-green-100",
      title: "text-green-700",
      text: "text-green-700",
      icon: <LightbulbIcon className="h-4 w-4 mr-1 text-green-500" />,
    },
    warning: {
      bg: "bg-amber-50",
      border: "border-amber-100",
      title: "text-amber-700",
      text: "text-amber-700",
      icon: <LightbulbIcon className="h-4 w-4 mr-1 text-amber-500" />,
    },
    info: {
      bg: "bg-indigo-50",
      border: "border-indigo-100",
      title: "text-indigo-700",
      text: "text-indigo-700",
      icon: <LightbulbIcon className="h-4 w-4 mr-1 text-indigo-500" />,
    },
  };

  const colors = colorSchemes[variant];

  return (
    <Card className={`${colors.bg} ${colors.border} border shadow-sm ${className}`}>
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <h4 className={`text-sm font-semibold flex items-center ${colors.title} mb-2`}>
            {icon || colors.icon}
            {title}
          </h4>
          {onClose && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 rounded-full"
              onClick={onClose}
            >
              <XIcon className="h-3 w-3 text-gray-500" />
              <span className="sr-only">Close</span>
            </Button>
          )}
        </div>
        <ul className={`text-xs ${colors.text} space-y-1 ml-5 list-disc`}>
          {tips.map((tip, index) => (
            <li key={index}>{tip}</li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
