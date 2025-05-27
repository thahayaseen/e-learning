import React from "react";
import { Card, CardContent } from "../ui/card";

export const StatCard = ({ title, value, icon, color, iconBg, glowColor }) => (
  <Card
    className={`bg-gray-800 border-gray-700 overflow-hidden shadow-xl relative`}>
    <div
      className={`absolute w-40 h-40 rounded-full filter blur-3xl opacity-10 -top-20 -right-20 bg-${glowColor}-500`}></div>
    <CardContent className="p-0">
      <div className={`bg-gradient-to-r ${color} text-white p-6 relative`}>
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-white text-opacity-80">
              {title}
            </p>
            <p className="text-3xl font-bold mt-1">{value}</p>
          </div>
          <div className={`p-2 ${iconBg} rounded-full`}>{icon}</div>
        </div>
      </div>
    </CardContent>
  </Card>
);
