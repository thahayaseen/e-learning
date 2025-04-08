import { TabsContent } from "@/components/ui/tabs";
import { IProgressCollection, UserDTO } from "@/services/interface/CourseDto";
import {
  Badge,
  BarChart3,
  Calendar,
  CheckCircle,
  Clock,
  Link as LucideLink,
  Star,
} from "lucide-react";

import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Progress } from "@radix-ui/react-progress";

import { Iprogress } from "@/app/profile/page";

// Enhanced StatCard with improved design
const StatCard = ({
  title,
  value,
  icon,
  color = "from-indigo-800 to-indigo-900",
  iconBg = "bg-indigo-700",
  className = "",
}) => (
  <div
    className={`p-5 rounded-xl bg-gradient-to-br ${color} 
    transform transition-all duration-300 hover:scale-[1.02] 
    shadow-lg hover:shadow-xl ${className}`}>
    <div className="flex justify-between items-center">
      <div>
        <p className="text-sm text-gray-300 mb-2">{title}</p>
        <h3 className="text-2xl font-bold text-white">{value}</h3>
      </div>
      <div className={`p-3 rounded-full ${iconBg}`}>{icon}</div>
    </div>
  </div>
);

export function Overview({
  courses,
  userData,
  progress,
}: {
  courses: IProgressCollection[];
  userData: UserDTO;
  progress: Iprogress;
}) {
  console.log("data is ", courses);

  return (
    <TabsContent
      value="overview"
      className="space-y-6 bg-[#0a192f] min-h-screen p-6 rounded-xl">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Overall Progress"
          value={`${progress.progresPersentage}%`}
          icon={<BarChart3 className="h-6 w-6 text-white" />}
          color="from-[#112240] to-[#1a2b4a]"
          iconBg="bg-[#5CDB95]"
        />
        <StatCard
          title="Courses Completed"
          value={progress.completedCourse}
          icon={<CheckCircle className="h-6 w-6 text-white" />}
          color="from-emerald-900 to-emerald-800"
          iconBg="bg-emerald-700"
        />
        <StatCard
          title="Total Courses"
          value={progress.coursesCount}
          icon={<Star className="h-6 w-6 text-white" />}
          color="from-amber-900 to-amber-800"
          iconBg="bg-amber-700"
        />
      </div>

      <Card className="bg-[#112240] border-[#1a2b4a] rounded-xl shadow-2xl overflow-hidden">
        <CardHeader className="border-b border-[#1a2b4a] bg-gradient-to-br from-[#0a192f] to-[#112240]">
          <CardTitle className="text-[#5CDB95] font-bold text-xl">
            Learning Activity
          </CardTitle>
          <CardDescription className="text-[#8892b0]">
            Your recent course progress
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-6">
            {courses.map((course, index) => (
              <div
                key={index}
                className="p-5 rounded-xl border border-[#1a2b4a] 
                bg-[#0a192f] 
                hover:bg-[#112240] 
                hover:shadow-xl 
                transition-all 
                duration-300 
                transform 
                hover:scale-[1.01]">
                <div className="flex justify-between mb-3">
                  <h3 className="font-medium text-white text-lg">
                    {course.Title}
                  </h3>
                  <Badge
                    className={`
                      ${
                        course.Score === 100
                          ? "bg-emerald-800"
                          : course.Score > 5
                          ? "bg-indigo-800"
                          : "bg-gray-700"
                      }`}>
                    {course.Score === 100
                      ? "Completed"
                      : course.Score > 5
                      ? "In Progress"
                      : "Not Started"}
                  </Badge>
                </div>
                <p className="text-sm text-gray-400 mb-3">
                  {"Created By "}•{course.mentor?.name}
                </p>
                <div className="flex items-center gap-3 mb-2">
                  <Progress
                    value={course.Score}
                    className="h-2 flex-1 bg-gray-700 rounded-full">
                    <div
                      className={`h-full rounded-full ${
                        course.Score === 100
                          ? "bg-emerald-600"
                          : course.Score > 50
                          ? "bg-indigo-600"
                          : "bg-purple-600"
                      }`}
                      style={{ width: `${course.progress.OverallScore}%` }}
                    />
                  </Progress>
                  <span className="text-sm font-medium text-white">
                    {course.Score}%
                  </span>
                </div>
                <div className="flex justify-between text-xs text-gray-400 mt-2">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3 text-indigo-400" />
                    Last Updated: {course.UpdatedAt}
                  </span>
                  {course.Score === 100 ? (
                    <span className="flex items-center gap-1">
                      <CheckCircle className="h-3 w-3 text-emerald-500" />
                      Completed: {course.UpdatedAt}
                    </span>
                  ) : (
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3 text-amber-500" />
                      In Progress
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </TabsContent>
  );
}

export interface IOrder {
  _id: string;
  userId: string;
  courseId: {
    _id: string;
    Title: string;
    image: string;
    Mentor_id: {
      name: string;
    };
  };
  paymentId: string;
  paymentStatus: "pending" | "paid" | "failed";
  amount: number;
  currency: "inr" | "usd";
  planType: string;
  createdAt: string;
  updatedAt: string;
}
