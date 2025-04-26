"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import CourseBuyPage from "@/components/courses/buyCourse";
import { getSelectedCourse } from "@/services/fetchdata";
import Footer from "@/components/header/footer";

interface CourseData {
  _id: string;
  Title: string;
  Mentor_id: {
    _id: string;
    name: string;
  };
  Description: string;
  Category: {
    Category: string;
  };
  Price: number;
  Approved_by_admin: string;
  Students_enrolled: any[];
  image: string;
  unlist: boolean;
  lessons: {
    _id: string;
    Lessone_name: string;
    Task: {
      _id: string;
      Type: string;
    }[];
  }[];
  Content: string;
  duration: number;
  CreatedAt: string;
  UpdatedAt: string;
}

interface CourseResponse {
  success: boolean;
  message: string;
  data: {
    data: CourseData;
  };
  adredypuchased: boolean;
  meet: boolean;
}

export default function CoursePage() {
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(true);
  const [courseData, setCourseData] = useState<CourseData | null>(null);
  const [alreadyPurchased, setAlreadyPurchased] = useState(false);

  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        if (params.id) {
          setLoading(true);
          const response: any = await getSelectedCourse(params.id as string);
          const data = response;

          if (data.success) {
            setCourseData(data.data.data);
            setAlreadyPurchased(data.adredypuchased);
          } else {
            throw new Error("Failed to fetch course data");
          }
        }
      } catch (error) {
        router.push("/auth");
      } finally {
        setLoading(false);
      }
    };

    fetchCourseData();
  }, [params.id, router]);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-blue-950/80 flex items-center justify-center z-50">
        <div className="flex flex-col items-center bg-blue-900/50 p-8 rounded-lg shadow-lg backdrop-blur-sm">
          <Loader2 className="animate-spin text-blue-200" size={50} />
          <p className="text-blue-100 mt-4 font-medium">
            Loading course details...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-950 to-blue-900">
      {courseData ? (
        <CourseBuyPage
          course={courseData}
          aldredypurchased={alreadyPurchased}
        />
      ) : (
        <div className="flex items-center justify-center h-screen">
          <div className="text-center p-8 bg-blue-900/50 rounded-lg shadow-lg backdrop-blur-sm">
            <h2 className="text-2xl font-bold text-blue-100 mb-2">
              Course Not Found
            </h2>
            <p className="text-blue-200 mb-4">
              The requested course could not be loaded.
            </p>
            <button
              onClick={() => router.push("/courses")}
              className="px-4 py-2 bg-blue-700 hover:bg-blue-600 text-white rounded-md transition-colors">
              Browse Courses
            </button>
          </div>
        </div>
      )}
      <Footer />

    </div>
  );
}
