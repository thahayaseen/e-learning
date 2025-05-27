"use client";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useRouter } from "next/navigation";
import { Award, Book, Briefcase, ExternalLink, PhoneCall } from "lucide-react";
import { getImage } from "@/services/getImage";
import Image from "next/image";

export default function MentorDialog({ mentor }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const handleViewAllCourses = () => {
    setOpen(false);
     router.push(`/course?mentor=${mentor.mentorId}`);
  };

  if (!mentor) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200">
          View Mentor Profile
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md md:max-w-xl p-0 overflow-hidden rounded-xl">
        {/* Banner background */}
        <div className="w-full h-32 bg-gradient-to-r from-blue-500 to-indigo-600"></div>

        <div className="px-6 pb-6 -mt-16">
          {/* Profile image */}
          <div className="flex justify-center">
            <Image
              height={100}
              width={100}
              src={getImage(mentor.profileImage)}
              alt={mentor.name}
              
              className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
            />
          </div>

          {/* Name and title */}
          <div className="text-center mt-4">
            <h2 className="text-2xl font-bold text-gray-100">{mentor.name}</h2>
            <p className="text-lg text-indigo-600 font-medium">
              {mentor.qualification.split(",")[0]}
            </p>
          </div>

          {/* DialogTitle moved here for better accessibility */}
          <DialogTitle className="sr-only text-white">
            Mentor Details for {mentor.name}
          </DialogTitle>

          {/* Details */}
          <div className="bg-gray-50 rounded-xl p-5 mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Briefcase className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Experience</p>
                <p className="font-medium">{mentor.experience} years</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0 w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                <PhoneCall className="h-5 w-5 text-indigo-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Contact</p>
                <p className="font-medium">{mentor.phone}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 ">
              <div className="flex-shrink-0 w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <Book className="h-5 w-5 text-purple-600" />
              </div>
              <div className="flex-grow">
                <p className="text-sm text-gray-500">Qualifications </p>
                <ul>
                  {mentor.qualification.split(",").map((data, index) => (
                    <li key={index}>{data.trim()}</li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="flex items-center space-x-3 ">
              <div className="flex-shrink-0 w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <Award className="h-5 w-5 text-purple-600" />
              </div>
              <div className="flex-grow">
                <p className="text-sm text-gray-500">LinkedIn Profile</p>
                <a
                  href={mentor.profileLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-600 font-medium flex items-center hover:underline">
                  View Profile <ExternalLink className="ml-1 h-4 w-4" />
                </a>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="mt-8 flex flex-col sm:flex-row justify-end gap-3">
            <button
              onClick={() => setOpen(false)}
              className="px-5 py-2.5 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50">
              Close
            </button>
            <button
              onClick={handleViewAllCourses}
              className="px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium rounded-lg shadow hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200">
              View All Courses
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
