import React from 'react';

export default function LoadingAnimation() {
  return (
    <div className="flex items-center justify-center p-4">
      <svg viewBox="0 0 100 100" className="w-24 h-24">
        <circle 
          cx="25" 
          cy="50" 
          r="8" 
          className="fill-blue-500"
          style={{
            animation: 'pulse 1.5s infinite ease-in-out',
            animationDelay: '0s'
          }}
        />
        <circle 
          cx="42" 
          cy="50" 
          r="8" 
          className="fill-green-500"
          style={{
            animation: 'pulse 1.5s infinite ease-in-out',
            animationDelay: '0.3s'
          }}
        />
        <circle 
          cx="59" 
          cy="50" 
          r="8" 
          className="fill-yellow-500"
          style={{
            animation: 'pulse 1.5s infinite ease-in-out',
            animationDelay: '0.6s'
          }}
        />
        <circle 
          cx="76" 
          cy="50" 
          r="8" 
          className="fill-red-500"
          style={{
            animation: 'pulse 1.5s infinite ease-in-out',
            animationDelay: '0.9s'
          }}
        />
      </svg>
      <style jsx>{`
        @keyframes pulse {
          0%, 100% {
            transform: scale(0.8);
            opacity: 0.6;
          }
          50% {
            transform: scale(1.2);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}