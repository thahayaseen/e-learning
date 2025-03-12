import { TabsContent } from "@/components/ui/tabs";
import { IProgressCollection, UserDTO } from "@/services/interface/CourseDto";
import {
  Badge,
  BarChart3,
  BookOpen,
  Calendar,
  CheckCircle,
  CheckCircle2,
  Clock,
  Edit,
  PlayCircle,
  Shield,
  Star,
  XCircle,
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
import { StatCard } from "./Scard";
import Image from "next/image";
import { Continue } from "../mybtns/myBtns";
import { Iprogress } from "@/app/profile/page";

export function Overview({
  courses,
  userData,
  progress,
}: {
  courses: IProgressCollection[];
  userData: UserDTO;
  progress: Iprogress;
}) {
  console.log(progress.coursesCount);
  
  return (
    <TabsContent value="overview" className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title="Overall Progress"
          value={`${progress.progresPersentage}%`}
          icon={<BarChart3 className="h-5 w-5 text-white" />}
          color="from-indigo-800 to-indigo-900"
          iconBg="bg-indigo-700"
          glowColor="indigo"
        />
        <StatCard
          title="Courses Completed"
          value={progress.completedCourse}
          icon={<CheckCircle className="h-5 w-5 text-white" />}
          color="from-emerald-800 to-emerald-900"
          iconBg="bg-emerald-700"
          glowColor="emerald"
        />
        <StatCard
          title="Total Course"
          value={progress.coursesCount}
          icon={<Star className="h-5 w-5 text-white" />}
          color="from-amber-700 to-amber-900"
          iconBg="bg-amber-600"
          glowColor="amber"
        />
      </div>

      <Card className="bg-gray-800 border-gray-700 shadow-xl">
        <CardHeader className="border-b border-gray-700">
          <CardTitle>Learning Activity</CardTitle>
          <CardDescription className="text-gray-400">
            Your recent course progress
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="space-y-4">
            {courses.map((course) => (
              <div
                key={course._id}
                className="p-4 rounded-lg border border-gray-700 bg-gray-850 hover:bg-gray-750 hover:shadow-md transition-all">
                <div className="flex justify-between mb-2">
                  <h3 className="font-medium text-white">
                    {course.Course_id?.Title}
                  </h3>
                  <Badge className="to-blue-800">
                    {course.Score === 100
                      ? "Completed"
                      : course.Score > 5
                      ? "In Progress"
                      : "Not Started"}
                  </Badge>
                </div>
                <p className="text-sm text-gray-400 mb-3">
                  {course.Course_id?.Category?.Category} •{" "}
                  {course.Course_id?.Mentor_id?.name}
                </p>
                <div className="flex items-center gap-3 mb-1">
                  <Progress
                    value={course.Score}
                    className="h-2 flex-1 bg-gray-700">
                    <div
                      className={`h-full rounded-full ${
                        course.Score === 100
                          ? "bg-emerald-600"
                          : course.Score > 50
                          ? "bg-indigo-600"
                          : "bg-purple-600"
                      }`}
                      style={{ width: `${course.Score}%` }}
                    />
                  </Progress>
                  <span className="text-sm font-medium">{course.Score}%</span>
                </div>
                <div className="flex justify-between text-xs text-gray-400 mt-2">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" /> Last: {course.UpdatedAt}
                  </span>
                  {course.Score === 100 ? (
                    <span className="flex items-center gap-1">
                      <CheckCircle className="h-3 w-3 text-emerald-500" />{" "}
                      Completed: {course.UpdatedAt}
                    </span>
                  ) : (
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3 text-amber-500" />{" "}
                      {/* Due: {course.deadline} */}
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

export function Courses({ courses }: { courses: IProgressCollection[] }) {
  return (
    <TabsContent value="courses" className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {courses.map((course) => (
          <Card
            key={course._id}
            className="bg-gray-800 border-gray-700 shadow-xl overflow-hidden">
            <div className="relative h-40 bg-gray-700">
              {course.Course_id && course.Course_id.Title && (
                <Image
                  width={100}
                  height={100}
                  src={course.Course_id?.image}
                  alt={course.Course_id?.Title}
                  className="w-full h-full object-cover opacity-60"
                />
              )}
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-t from-gray-900 to-transparent">
                <div className="absolute top-2 right-2">
                  <Badge className="bg-green-800">
                    {course.Score === 100
                      ? "Completed"
                      : course.Score > 10
                      ? "In Progress"
                      : "Not Started"}
                  </Badge>
                </div>
                <div className="absolute bottom-4 left-4 right-4">
                  <h3 className="font-bold text-lg text-white mb-1 line-clamp-1">
                    {course.Course_id?.Title}
                  </h3>
                  <p className="text-sm text-gray-300">
                    {course?.Title} • {course.Course_id?.Mentor_id?.name}
                  </p>
                </div>
              </div>
            </div>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3 mb-3">
                <Progress value={50} className="h-2 flex-1 bg-gray-700">
                  <div
                    className={`h-full rounded-full ${
                      course.Score === 100
                        ? "bg-emerald-600"
                        : course.Score > 50
                        ? "bg-indigo-600"
                        : "bg-purple-600"
                    }`}
                    //   style={{ width: `${course.progress}%` }}
                  />
                </Progress>
                <span className="text-sm font-medium">{course.Score}%</span>
              </div>
              <div className="flex justify-between items-center mt-4">
                <span className="text-xs text-gray-400">
                  {course.Score === 100 ? (
                    <span className="flex items-center gap-1">
                      <CheckCircle className="h-3 w-3 text-emerald-500" />{" "}
                      {course.UpdatedAt}
                    </span>
                  ) : (
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {course.UpdatedAt}
                    </span>
                  )}
                </span>
                <button
                  className={`text-white px-4 py-2 rounded-md text-sm flex items-center gap-1 transition-colors ${
                    course.Score === 100
                      ? "bg-emerald-700 hover:bg-emerald-800"
                      : "bg-indigo-700 hover:bg-indigo-800"
                  }`}>
                  {course.Score === 100 ? (
                    <>
                      <BookOpen className="h-4 w-4" /> Review
                    </>
                  ) : (
                    <Continue id={course._id} />
                  )}
                </button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </TabsContent>
  );
}

export function Account({ userData }: { userData: UserDTO }) {
  return (
    <TabsContent value="account" className="space-y-4">
      <Card className="bg-gray-800 border-gray-700 shadow-xl">
        <CardHeader className="border-b border-gray-700">
          <CardTitle>Account Information</CardTitle>
          <CardDescription className="text-gray-400">
            Your personal account details
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-750 p-4 rounded-lg border border-gray-700">
                <p className="text-sm font-medium text-gray-400 mb-1">
                  Full Name
                </p>
                <p className="font-medium text-white">{userData.name}</p>
              </div>
              <div className="bg-gray-750 p-4 rounded-lg border border-gray-700">
                <p className="text-sm font-medium text-gray-400 mb-1">
                  Email Address
                </p>
                <p className="font-medium text-white">{userData.email}</p>
              </div>
              <div className="bg-gray-750 p-4 rounded-lg border border-gray-700">
                <p className="text-sm font-medium text-gray-400 mb-1">
                  Account Role
                </p>
                <p className="font-medium text-white capitalize">
                  {userData.role}
                </p>
              </div>
              <div className="bg-gray-750 p-4 rounded-lg border border-gray-700">
                <p className="text-sm font-medium text-gray-400 mb-1">
                  Subscription Status
                </p>
                <p className="font-medium text-white flex items-center gap-2">
                  {userData.subscription ? (
                    <>
                      <Star className="h-4 w-4 text-amber-500" /> Premium
                    </>
                  ) : (
                    "No active subscription"
                  )}
                </p>
              </div>

              <div className="bg-gray-750 p-4 rounded-lg border border-gray-700">
                <p className="text-sm font-medium text-gray-400 mb-1">
                  Verification Status
                </p>
                <div className="flex items-center gap-2 text-white">
                  {userData.verified ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                  <span>{userData.verified ? "Verified" : "Not Verified"}</span>
                </div>
              </div>
            </div>

            <div className="pt-4 flex justify-end gap-3">
              <button className="px-4 py-2 border border-gray-600 rounded-md hover:bg-gray-700 transition-colors flex items-center gap-2">
                <Shield className="h-4 w-4" /> Change Password
              </button>
              <button className="px-4 py-2 bg-indigo-700 text-white rounded-md hover:bg-indigo-800 transition-colors flex items-center gap-2">
                <Edit className="h-4 w-4" /> Edit Profile
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    </TabsContent>
  );
}
