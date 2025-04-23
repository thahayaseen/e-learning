// Chart theme configuration
export const chartTheme = {
  colors: {
    primary: "#4f46e5", // Indigo
    secondary: "#3b82f6", // Blue
    accent: "#8b5cf6", // Purple
    success: "#10b981", // Green
    warning: "#f59e0b", // Amber
    danger: "#ef4444", // Red
    background: "#111827", // Dark background
    card: "#1f2937", // Card background
    border: "#374151", // Border color
    text: "#e5e7eb", // Text color
    grid: "#374151", // Grid lines
  },
  gradients: {
    revenue: [
      { offset: "0%", color: "rgba(79, 70, 229, 0.8)" },
      { offset: "100%", color: "rgba(79, 70, 229, 0.1)" },
    ],
    mentor: [
      { offset: "0%", color: "#4f46e5" },
      { offset: "100%", color: "#8b5cf6" },
    ],
  },
};
export const StatSkeleton = () => (
  <div className="bg-gray-800 rounded-lg shadow p-6 border border-gray-700 animate-pulse">
    <div className="flex items-center">
      <div className="bg-gray-700 p-3 rounded-full h-10 w-10"></div>
      <div className="ml-4 w-full">
        <div className="h-4 bg-gray-700 rounded w-1/2 mb-2"></div>
        <div className="h-6 bg-gray-700 rounded w-3/4"></div>
      </div>
    </div>
  </div>
);

export const ChartSkeleton = () => (
  <div className="bg-gray-800 rounded-lg shadow border border-gray-700 animate-pulse">
    <div className="p-4 border-b border-gray-700">
      <div className="h-6 bg-gray-700 rounded w-1/3"></div>
    </div>
    <div className="p-4">
      <div className="h-80 bg-gray-700 rounded"></div>
    </div>
  </div>
);

export const TableSkeleton = () => (
  <div className="bg-gray-800 rounded-lg shadow border border-gray-700 animate-pulse">
    <div className="p-4 border-b border-gray-700">
      <div className="h-6 bg-gray-700 rounded w-1/3"></div>
    </div>
    <div className="p-4">
      <div className="h-8 bg-gray-700 rounded w-full mb-4"></div>
      {[...Array(5)].map((_, i) => (
        <div key={i} className="h-12 bg-gray-700 rounded w-full mb-2"></div>
      ))}
    </div>
  </div>
);
