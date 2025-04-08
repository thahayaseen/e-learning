"use client"
import React, { useEffect, useState } from 'react';


const BlockingErrorPage = ({ 
  errorMessage = 'An error occurred', 
  redirectDelay = 5000 
}) => {
  const [countdown, setCountdown] = useState(Math.ceil(redirectDelay / 1000));
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Mark component as mounted
    setMounted(true);
    
    // Set up redirect after delay
    const redirectTimer = setTimeout(() => {
      window.location.href = '/';
    }, redirectDelay);
    
    // Set up countdown display
    const countdownInterval = setInterval(() => {
      setCountdown(prev => Math.max(0, prev - 1));
    }, 1000);
    
    // Clean up timers on unmount
    return () => {
      clearTimeout(redirectTimer);
      clearInterval(countdownInterval);
    };
  }, [redirectDelay]);

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full text-center">
        <div className="mb-6">
          <svg className="h-16 w-16 text-red-500 mx-auto" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        </div>
        
        <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
        <p className="text-gray-700 mb-6">{errorMessage}</p>
        
        <div className="bg-gray-100 py-3 px-4 rounded-lg mb-6">
          <p className="text-sm text-gray-600">
            Redirecting to homepage in <span className="font-bold">{countdown}</span> seconds...
          </p>
        </div>
        
        <button 
          onClick={() => {
            window.location.href = '/';
          }}
          className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-6 rounded-lg font-medium transition duration-300"
        >
          Go to Homepage Now
        </button>
      </div>
    </div>
  );
};

export default BlockingErrorPage;