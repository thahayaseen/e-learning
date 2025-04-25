"use client";

import { useState } from "react";
import Image from "next/image";
import { Download, Award, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatDate } from "@/lib/utils";
import * as htmlToImage from "html-to-image";
import toast from "react-hot-toast";

interface CertificateProps {
  student_name: string;
  course_name: string;
  category: string;
  completed_date: Date;
  _id: string;
  companyName?: string;
  companyLogo?: string;
  fetchCertificate?: (courseId: string) => Promise<any>;
  courseId?: string;
}

export default function CertificateDisplay({
  student_name: studentName,
  course_name,
  category,
  completed_date,
  _id: certificateId,
  companyName = "Edu-Learn",
  companyLogo = "/logo.png",
  fetchCertificate,
  courseId,
}: CertificateProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [certificateData, setCertificateData] = useState<any | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Function to handle fetching certificate data if needed
  const handleViewCertificate = async () => {
    if (fetchCertificate && courseId) {
      setIsLoading(true);
      setError(null);

      try {
         if (!course_name || !category || !completed_date || !certificateId) {
          const response = await fetchCertificate(courseId);

          if (!response.success) {
            throw new Error("Failed to fetch certificate data");
          }

          const data = response;
           if (data.success) {
            setCertificateData(data);
            setIsDialogOpen(true);
          } else {
            setError("Course not completed");
          }
        } else {
          setCertificateData({
            studentName,
            course_name,
            category,
            completed_date,
            certificateId,
          });
        }
      } catch (err: any) {
        setError(err.message);
        console.error("Certificate fetch error:", err);
      } finally {
        setIsLoading(false);
      }
    } else {
      // If no fetch function is provided, just open the dialog with existing props
       setIsDialogOpen(true);
    }
  };

   // Function to download certificate as image
  const downloadCertificate = async (certificateData) => {
    try {
      const certificateElement = document.getElementById("certificate-preview");
      if (!certificateElement) return;

      const dataUrl = await htmlToImage.toPng(certificateElement);

      const link = document.createElement("a");
      const fileName = `${
        certificateData ? certificateData.student_name : studentName
      }_${
        certificateData ? certificateData.course_name : course_name
      }_Certificate.png`;
      link.download = fileName;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error("Certificate download failed:", error);
      setError("Failed to generate certificate");
    }
  };

  // Use either fetched data or props
  const displayName = certificateData
    ? certificateData.student_name
    : studentName;
  const displayCourse = certificateData
    ? certificateData.course_name
    : course_name;
  const displayCategory = certificateData
    ? certificateData.category || category
    : category;
  const displayDate = certificateData
    ? new Date(certificateData.completed_date || completed_date)
    : completed_date;
  const displayId = certificateData
    ? certificateData._id || certificateId
    : certificateId;

  return (
    <div className="certificate-container">
      {/* View Certificate Button */}
      <Button
        onClick={handleViewCertificate}
        disabled={isLoading}
        className="mt-4 flex items-center gap-2 bg-gradient-to-r from-amber-600 to-amber-800 hover:from-amber-700 hover:to-amber-900 transition-all duration-300 ease-in-out">
        {isLoading ? (
          <div className="flex items-center gap-2">
            <Loader2 className="w-5 h-5 text-white animate-spin" />
            <span className="text-white">Loading...</span>
          </div>
        ) : (
          <>
            <Award className="w-5 h-5 text-white" />
            <span className="text-white">View Certificate</span>
          </>
        )}
      </Button>

      {/* Certificate Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-5xl max-h-[100vh] bg-amber-50 shadow-2xl rounded-lg overflow-scroll border-4  border-amber-700">
          <DialogHeader className="bg-gradient-to-r from-amber-700 to-amber-900 p-4">
            <DialogTitle className="text-2xl font-serif font-bold text-amber-100 flex items-center justify-center gap-3">
              <Award className="w-8 h-8" />
              Certificate of Achievement
            </DialogTitle>
          </DialogHeader>

          <div className="flex flex-col items-center p-4">
            {/* Certificate Preview */}
            <div
              id="certificate-preview"
              className="certificate-wrapper p-2 bg-gradient-to-r from-amber-100 to-amber-50">
              <div className="certificate relative mx-auto w-full max-w-4xl border-8 border-double border-amber-700 bg-[#f9f3e0] p-8 shadow-xl">
                {/* Decorative corners */}
                <div className="absolute top-0 left-0 w-24 h-24 border-t-4 border-l-4 border-amber-800"></div>
                <div className="absolute top-0 right-0 w-24 h-24 border-t-4 border-r-4 border-amber-800"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 border-b-4 border-l-4 border-amber-800"></div>
                <div className="absolute bottom-0 right-0 w-24 h-24 border-b-4 border-r-4 border-amber-800"></div>

                {/* Background watermark */}
                <div className="absolute inset-0 flex items-center justify-center opacity-5">
                  <div className="w-3/4 h-3/4 bg-[url('/placeholder.svg?height=400&width=400')] bg-center bg-no-repeat bg-contain"></div>
                </div>

                <div className="relative z-10 flex flex-col items-center text-center">
                  {/* Header with logo */}
                  <div className="certificate-header mb-6 flex flex-col items-center">
                    <div className="logo-container mb-4">
                      <Image
                        src={companyLogo || "/placeholder.svg"}
                        alt={`${companyName} Logo`}
                        width={120}
                        height={120}
                        className="mb-2"
                      />
                    </div>
                    <h1 className="text-4xl font-serif font-bold text-amber-800 mb-1">
                      {companyName}
                    </h1>
                    <p className="text-lg text-amber-700 italic mb-4">
                      Excellence in Online Education
                    </p>
                    <div className="ornate-divider flex items-center w-full my-2">
                      <div className="h-px bg-amber-700 flex-grow"></div>
                      <div className="mx-4 text-amber-800">✦</div>
                      <div className="h-px bg-amber-700 flex-grow"></div>
                    </div>
                  </div>

                  {/* Certificate title */}
                  <div className="mb-8">
                    <h2 className="text-3xl font-serif font-bold text-amber-900 mb-1">
                      Certificate of Achievement
                    </h2>
                    <p className="text-sm text-amber-700">
                      Certificate ID: {displayId}
                    </p>
                  </div>

                  {/* Main content */}
                  <div className="certificate-body mb-8">
                    <p className="text-lg mb-4 font-serif">
                      This is to certify that
                    </p>
                    <h2 className="text-3xl font-bold mb-6 font-serif text-amber-900 py-2 px-8 border-b border-t border-amber-300">
                      {displayName}
                    </h2>
                    <p className="text-lg mb-4 font-serif">
                      has successfully completed the course
                    </p>
                    <h3 className="text-2xl font-bold mb-2 font-serif text-amber-800">
                      {displayCourse}
                    </h3>
                    <p className="text-xl mb-6 italic">in {displayCategory}</p>
                    <div className="ornate-divider flex items-center w-full my-4">
                      <div className="h-px bg-amber-700 flex-grow"></div>
                      <div className="mx-4 text-amber-800">✦</div>
                      <div className="h-px bg-amber-700 flex-grow"></div>
                    </div>
                    <p className="text-lg">
                      Completed on {formatDate(displayDate)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Download Button */}
            <Button
              onClick={downloadCertificate}
              className="mt-6 flex items-center gap-2 bg-gradient-to-r from-amber-600 to-amber-800 hover:from-amber-700 hover:to-amber-900 transition-all duration-300 ease-in-out">
              <Download className="w-5 h-5 text-white" />
              <span className="text-white">Download Certificate</span>
            </Button>
          </div>

          {/* Error Handling */}
          {error && (
            <div className="text-red-500 text-center mt-4 bg-red-50 p-4 rounded-lg">
              {error}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
