import React, { useState } from 'react';
import { Download, FileText, Award, Star, BuildingIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import * as htmlToImage from 'html-to-image';
import { getcertificate } from '@/services/fetchdata';
import Image from 'next/image';

const CertificateDownload = ({ 
  courseId, 
  companyName = "LearnPro Academy", 
  companyLogo = null 
}) => {
  const [certificateData, setCertificateData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const fetchCertificateData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await getcertificate(courseId);
      console.log(response, 'data');

      if (!response.success) {
        throw new Error('Failed to fetch certificate data');
      }

      const data = await response.data;

      if (data.completed) {
        setCertificateData(data);
        setIsDialogOpen(true);
      } else {
        setError('Course not completed');
      }
    } catch (err) {
      setError(err.message);
      console.error('Certificate fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const generateAndDownloadCertificate = async () => {
    try {
      const certificateElement = document.getElementById('certificate-preview');
      const dataUrl = await htmlToImage.toPng(certificateElement);
      
      const link = document.createElement('a');
      link.download = `${certificateData.name}_${certificateData.course}_Certificate.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error('Certificate download failed:', error);
      setError('Failed to generate certificate');
    }
  };

  return (
    <div className="certificate-container">
      {/* Open Certificate Dialog Button */}
      <Button 
        onClick={fetchCertificateData} 
        disabled={isLoading}
        className="mt-4 flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-300 ease-in-out"
      >
        {isLoading ? (
          <div className="flex items-center gap-2">
            <span className="animate-spin">
              <Star className="w-5 h-5 text-white" />
            </span>
            <span className="text-white">Fetching...</span>
          </div>
        ) : (
          <>
            <FileText className="w-5 h-5 text-white" />
            <span className="text-white">View Certificate</span>
          </>
        )}
      </Button>

      {/* Certificate Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl bg-white shadow-2xl rounded-2xl overflow-hidden">
          <DialogHeader className="bg-gradient-to-r from-blue-600 to-purple-600 p-6">
            <DialogTitle className="text-2xl font-bold text-white flex items-center justify-center gap-3">
              <Award className="w-8 h-8" />
              Course Completion Certificate
            </DialogTitle>
          </DialogHeader>

          {certificateData && (
            <div className="flex flex-col items-center p-6">
              {/* Certificate Preview */}
              <div 
                id="certificate-preview" 
                className="w-full max-w-3xl aspect-[16/9] bg-gradient-to-br from-blue-50 to-blue-100 p-8 flex flex-col justify-center items-center text-center rounded-xl shadow-xl relative overflow-hidden"
              >
                {/* Decorative Elements */}
                <div className="absolute top-0 left-0 w-full h-full opacity-10">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-blue-300 rounded-full transform translate-x-1/2 -translate-y-1/2"></div>
                  <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-300 rounded-full transform -translate-x-1/2 translate-y-1/2"></div>
                </div>

                <div className="bg-white p-12 rounded-2xl shadow-lg w-full max-w-2xl z-10 relative border-4 border-blue-200">
                  {/* Company Logo/Name Section */}
                  <div className="flex justify-between items-center mb-8">
                    {companyLogo ? (
                      <Image
                      width={100}
                      height={100} 
                        src={companyLogo} 
                        alt={`${companyName} Logo`} 
                        className="h-16 w-auto"
                      />
                    ) : (
                      <div className="flex items-center gap-2">
                        <BuildingIcon className="w-10 h-10 text-blue-600" />
                        <span className="text-2xl font-bold text-gray-800">
                          {companyName}
                        </span>
                      </div>
                    )}
                  </div>

                  <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-6 drop-shadow-md">
                    Certificate of Completion
                  </h1>
                  
                  <h2 className="text-4xl font-bold text-gray-800 mb-4">
                    {certificateData.course}
                  </h2>
                  
                  <p className="text-2xl text-gray-600 mb-8">
                    This is to certify that
                  </p>
                  
                  <h3 className="text-4xl font-bold text-blue-700 mb-6 border-b-4 border-blue-300 pb-4 relative">
                    {certificateData.name}
                    <span className="absolute right-0 top-0 text-blue-300 text-6xl">✦</span>
                  </h3>
                  
                  <p className="text-xl text-gray-500 mb-4">
                    has successfully completed the course on
                  </p>
                  
                  <p className="text-2xl font-semibold text-gray-800">
                    {new Date(certificateData.conpletedDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>

                  {/* Company Signature Section */}
                  <div className="mt-8 pt-4 border-t border-gray-200 flex justify-between items-center">
                    <div className="text-left">
                      <p className="text-sm text-gray-600">Issued by</p>
                      <p className="text-lg font-semibold text-blue-800">
                        {companyName} Learning
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Authorized Signature</p>
                      <div className="h-12 w-32 border-b border-gray-400 mt-2"></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Download Button */}
              <Button 
                onClick={generateAndDownloadCertificate} 
                className="mt-6 flex items-center gap-2 bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 transition-all duration-300 ease-in-out"
              >
                <Download className="w-5 h-5 text-white" />
                <span className="text-white">Download Certificate</span>
              </Button>
            </div>
          )}

          {/* Error Handling */}
          {error && (
            <div className="text-red-500 text-center mt-4 bg-red-50 p-4 rounded-lg">
              <Star className="w-6 h-6 inline-block mr-2 text-red-600" />
              {error}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CertificateDownload;