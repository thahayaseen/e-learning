import React from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';

const ShimmerUI = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-blue-950 text-gray-900">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header section */}
        <div className="flex flex-col lg:flex-row gap-6 mb-6">
          {/* User info card - with shimmer effect */}
          <Card className="w-full lg:w-1/3 bg-gray-800 border-gray-700 shadow-xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-indigo-900 to-purple-900 text-white pb-8 relative">
              <div className="absolute top-3 right-3 flex space-x-2">
                <div className="h-6 w-16 bg-gray-700 rounded-full overflow-hidden relative">
                  <div className="shimmer-effect absolute inset-0"></div>
                </div>
              </div>
              <div className="flex flex-col items-center">
                {/* Avatar shimmer */}
                <div className="h-28 w-28 rounded-full bg-gray-700 border-4 border-indigo-400 mb-4 ring-2 ring-purple-500 ring-offset-2 ring-offset-indigo-900 overflow-hidden relative">
                  <div className="shimmer-effect absolute inset-0"></div>
                </div>
                {/* Name shimmer */}
                <div className="h-8 w-40 bg-gray-700 rounded-lg mb-2 overflow-hidden relative">
                  <div className="shimmer-effect absolute inset-0"></div>
                </div>
                {/* Description shimmer */}
                <div className="h-4 w-32 bg-gray-700 rounded overflow-hidden relative">
                  <div className="shimmer-effect absolute inset-0"></div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {/* Email shimmer */}
                <div className="flex items-center gap-2">
                  <div className="h-5 w-5 bg-gray-700 rounded overflow-hidden relative">
                    <div className="shimmer-effect absolute inset-0"></div>
                  </div>
                  <div className="h-4 w-40 bg-gray-700 rounded overflow-hidden relative">
                    <div className="shimmer-effect absolute inset-0"></div>
                  </div>
                </div>
                {/* Social link shimmer */}
                <div className="flex items-center gap-2">
                  <div className="h-5 w-5 bg-gray-700 rounded overflow-hidden relative">
                    <div className="shimmer-effect absolute inset-0"></div>
                  </div>
                  <div className="h-4 w-32 bg-gray-700 rounded overflow-hidden relative">
                    <div className="shimmer-effect absolute inset-0"></div>
                  </div>
                </div>
                {/* Account status shimmer */}
                <div className="flex items-center gap-2">
                  <div className="h-5 w-5 bg-gray-700 rounded overflow-hidden relative">
                    <div className="shimmer-effect absolute inset-0"></div>
                  </div>
                  <div className="h-4 w-36 bg-gray-700 rounded overflow-hidden relative">
                    <div className="shimmer-effect absolute inset-0"></div>
                  </div>
                </div>
                {/* Email verification shimmer */}
                <div className="flex items-center gap-2">
                  <div className="h-5 w-5 bg-gray-700 rounded overflow-hidden relative">
                    <div className="shimmer-effect absolute inset-0"></div>
                  </div>
                  <div className="h-4 w-28 bg-gray-700 rounded overflow-hidden relative">
                    <div className="shimmer-effect absolute inset-0"></div>
                  </div>
                </div>
                {/* Member days shimmer */}
                <div className="flex items-center gap-2">
                  <div className="h-5 w-5 bg-gray-700 rounded overflow-hidden relative">
                    <div className="shimmer-effect absolute inset-0"></div>
                  </div>
                  <div className="h-4 w-24 bg-gray-700 rounded overflow-hidden relative">
                    <div className="shimmer-effect absolute inset-0"></div>
                  </div>
                </div>
                {/* Experience section shimmer */}
                <div className="pt-4">
                  <div className="h-4 w-20 bg-gray-700 rounded mb-2 overflow-hidden relative">
                    <div className="shimmer-effect absolute inset-0"></div>
                  </div>
                  <div className="flex justify-between mb-2">
                    <div className="h-4 w-12 bg-gray-700 rounded overflow-hidden relative">
                      <div className="shimmer-effect absolute inset-0"></div>
                    </div>
                    <div className="h-4 w-28 bg-gray-700 rounded overflow-hidden relative">
                      <div className="shimmer-effect absolute inset-0"></div>
                    </div>
                  </div>
                  <div className="h-2 w-full bg-gray-700 rounded-full overflow-hidden relative">
                    <div className="shimmer-effect absolute inset-0"></div>
                  </div>
                </div>
                {/* Stats shimmer */}
                <div className="flex justify-between pt-4 mt-2 border-t border-gray-700">
                  <div className="text-center">
                    <div className="h-6 w-8 bg-gray-700 rounded mx-auto mb-1 overflow-hidden relative">
                      <div className="shimmer-effect absolute inset-0"></div>
                    </div>
                    <div className="h-3 w-12 bg-gray-700 rounded mx-auto overflow-hidden relative">
                      <div className="shimmer-effect absolute inset-0"></div>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="h-6 w-8 bg-gray-700 rounded mx-auto mb-1 overflow-hidden relative">
                      <div className="shimmer-effect absolute inset-0"></div>
                    </div>
                    <div className="h-3 w-16 bg-gray-700 rounded mx-auto overflow-hidden relative">
                      <div className="shimmer-effect absolute inset-0"></div>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="h-6 w-8 bg-gray-700 rounded mx-auto mb-1 overflow-hidden relative">
                      <div className="shimmer-effect absolute inset-0"></div>
                    </div>
                    <div className="h-3 w-12 bg-gray-700 rounded mx-auto overflow-hidden relative">
                      <div className="shimmer-effect absolute inset-0"></div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tab section - with shimmer effect */}
          <div className="w-full lg:w-2/3">
            <div className="w-full">
              {/* Tab header shimmer */}
              <div className="grid grid-cols-3 mb-6 bg-gray-800 rounded-lg h-10 overflow-hidden">
                <div className="col-span-1 bg-indigo-900 overflow-hidden relative">
                  <div className="shimmer-effect absolute inset-0"></div>
                </div>
                <div className="col-span-1 overflow-hidden relative">
                  <div className="shimmer-effect absolute inset-0"></div>
                </div>
                <div className="col-span-1 overflow-hidden relative">
                  <div className="shimmer-effect absolute inset-0"></div>
                </div>
              </div>

              {/* Content shimmer */}
              <div className="space-y-6">
                {/* Overview section shimmer */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="bg-gray-800 border-gray-700 overflow-hidden relative">
                    <CardHeader className="pb-2">
                      <div className="h-5 w-32 bg-gray-700 rounded overflow-hidden relative">
                        <div className="shimmer-effect absolute inset-0"></div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="h-24 w-full bg-gray-700 rounded overflow-hidden relative">
                        <div className="shimmer-effect absolute inset-0"></div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-gray-800 border-gray-700 overflow-hidden relative">
                    <CardHeader className="pb-2">
                      <div className="h-5 w-36 bg-gray-700 rounded overflow-hidden relative">
                        <div className="shimmer-effect absolute inset-0"></div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="h-24 w-full bg-gray-700 rounded overflow-hidden relative">
                        <div className="shimmer-effect absolute inset-0"></div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Course list shimmer */}
                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader className="pb-2">
                    <div className="h-5 w-24 bg-gray-700 rounded overflow-hidden relative">
                      <div className="shimmer-effect absolute inset-0"></div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="flex justify-between items-center p-3 border border-gray-700 rounded-lg overflow-hidden relative">
                          <div className="flex items-center gap-3">
                            <div className="h-12 w-12 bg-gray-700 rounded overflow-hidden relative">
                              <div className="shimmer-effect absolute inset-0"></div>
                            </div>
                            <div>
                              <div className="h-5 w-32 bg-gray-700 rounded mb-1 overflow-hidden relative">
                                <div className="shimmer-effect absolute inset-0"></div>
                              </div>
                              <div className="h-3 w-24 bg-gray-700 rounded overflow-hidden relative">
                                <div className="shimmer-effect absolute inset-0"></div>
                              </div>
                            </div>
                          </div>
                          <div className="h-8 w-8 bg-gray-700 rounded-full overflow-hidden relative">
                            <div className="shimmer-effect absolute inset-0"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* CSS for shimmer effect */}
      <style jsx>{`
        .shimmer-effect {
          background: linear-gradient(
            to right,
            rgba(255, 255, 255, 0.05) 0%,
            rgba(255, 255, 255, 0.1) 20%,
            rgba(255, 255, 255, 0.05) 40%
          );
          background-size: 800px 100%;
          animation: shimmer 1.5s infinite linear;
        }
        
        @keyframes shimmer {
          0% {
            background-position: -400px 0;
          }
          100% {
            background-position: 400px 0;
          }
        }
      `}</style>
    </div>
  );
};

export default ShimmerUI;