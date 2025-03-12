"use client";
import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Lock,
  PlayCircle,
  FileText,
  CheckCircle,
  BookOpen,
  Clock,
  Gift,
  Award,
  Users,
  Shield,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";
import { useRouter } from "next/navigation";
import GotoCoursebtn from "../mybtns/gotoCoursebtn";

const CourseBuyPage = ({ course, aldredypurchased }) => {
  const router = useRouter();
  const [selectedLesson, setSelectedLesson] = useState(null);

  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "INR",
    }).format(price);
  };

  const renderTaskIcon = (taskType) => {
    switch (taskType) {
      case "Video":
        return <PlayCircle className="w-4 h-4 text-blue-500" />;
      case "Assignment":
        return <FileText className="w-4 h-4 text-green-500" />;
      case "Quiz":
        return <CheckCircle className="w-4 h-4 text-purple-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="w-full p-6 grid md:grid-cols-3 gap-8 bg-gradient-to-b from-slate-50 to-white">
      {/* Course Overview Column */}
      <div className="col-span-2 space-y-8">
        <Card className="w-full overflow-hidden border-0 shadow-lg">
          <div className="relative">
            <Image
              width={1200}
              height={400}
              src={course.image || "/default.png"}
              alt={course.Title}
              className="w-full h-72 object-cover"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
              <Badge variant="secondary" className="mb-2 bg-primary text-white">
                {course.Category?.Category || "Uncategorized Course"}
              </Badge>
              <h1 className="text-3xl font-bold text-white">{course.Title}</h1>
            </div>
          </div>

          <CardContent className="p-6">
            {/* Course Highlights */}
            <div className="grid grid-cols-3 gap-4 mb-6 bg-slate-50 p-4 rounded-lg">
              <div className="flex flex-col items-center p-3 bg-white rounded-md shadow-sm">
                <BookOpen className="w-6 h-6 text-primary mb-2" />
                <span className="text-sm font-medium">
                  {course.lessons?.length || 0} Lessons
                </span>
              </div>
              <div className="flex flex-col items-center p-3 bg-white rounded-md shadow-sm">
                <Clock className="w-6 h-6 text-primary mb-2" />
                <span className="text-sm font-medium">4 Week Duration</span>
              </div>
              <div className="flex flex-col items-center p-3 bg-white rounded-md shadow-sm">
                <Users className="w-6 h-6 text-primary mb-2" />
                <span className="text-sm font-medium">
                  {course.Students_enrolled?.length || 0} Students
                </span>
              </div>
            </div>

            {/* Course Description */}
            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-4 inline-block pb-2 border-b-2 border-primary">
                Course Description
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {course.Description}
              </p>
            </div>

            {/* What You'll Learn Section */}
            <div className="mb-6 bg-slate-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Award className="w-5 h-5 text-primary mr-2" />
                What You'll Learn
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-1 mr-2" />
                  <span className="text-sm">
                    Master key concepts through hands-on lessons
                  </span>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-1 mr-2" />
                  <span className="text-sm">
                    Complete practical assignments and quizzes
                  </span>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-1 mr-2" />
                  <span className="text-sm">
                    Receive a certificate upon completion
                  </span>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-1 mr-2" />
                  <span className="text-sm">
                    Access to resources and community support
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Course Curriculum */}
        <Card className="w-full border-0 shadow-lg">
          <CardHeader className="bg-slate-50 border-b">
            <CardTitle className="text-xl flex items-center">
              <BookOpen className="w-5 h-5 text-primary mr-2" />
              Course Curriculum
            </CardTitle>
            <CardDescription>
              Explore the detailed course structure
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Accordion type="single" collapsible className="w-full">
              {course.lessons?.map((lesson, lessonIndex) => (
                <AccordionItem
                  value={`lesson-${lessonIndex}`}
                  key={lessonIndex}
                  className="border-b last:border-0">
                  <AccordionTrigger className="px-6 py-4 hover:bg-slate-50 transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary">
                        {lessonIndex + 1}
                      </div>
                      <span className="font-medium">{lesson.Lessone_name}</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pt-2 pb-4">
                    <div className="p-4 bg-slate-50 rounded-lg">
                      <p className="mb-4 text-gray-600">{lesson.Content}</p>

                      <div className="space-y-2">
                        {lesson.Task?.map((task) => (
                          <div
                            key={task._id}
                            className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-md shadow-sm hover:shadow transition-shadow">
                            <div className="flex items-center space-x-3">
                              <div className="p-2 rounded-full bg-slate-100">
                                {renderTaskIcon(task.Type)}
                              </div>
                              <span className="font-medium">{task.Type}</span>
                            </div>
                            <Lock className="w-4 h-4 text-gray-400" />
                          </div>
                        ))}
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      </div>

      {/* Purchase Column */}
      <div>
        <Card className="w-full sticky top-6 border-0 shadow-lg overflow-hidden">
          <div className="bg-primary text-white p-6 text-center">
            <h3 className="text-2xl font-bold mb-2">Course Enrollment</h3>
            <p className="opacity-80">Unlock full access today</p>
          </div>
          <CardContent className="p-6">
            <div className="text-center mb-6">
              <div className="flex items-center justify-center">
                <span className="text-3xl font-bold text-primary">
                  {formatPrice(course.Price)}
                </span>
                <Badge variant="outline" className="ml-2 text-xs">
                  One-time
                </Badge>
              </div>
              <p className="text-sm text-gray-500 mt-1">No hidden fees</p>
            </div>

            <Separator className="my-6" />

            <div className="space-y-3 mb-6">
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <span className="text-sm">
                  Lifetime access to all course materials
                </span>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <span className="text-sm">Certificate of completion</span>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <span className="text-sm">Access to future updates</span>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <span className="text-sm">Community support</span>
              </div>
            </div>

            {!aldredypurchased ? (
              <Button
                className="w-full py-6 text-base font-medium shadow-lg"
                size="lg"
                onClick={() => router.push(`/course/purchase/` + course._id)}>
                Enroll Now
              </Button>
            ) : (
              <GotoCoursebtn id={course._id} />
            )}

            <div className="mt-6 flex items-center justify-center text-sm text-gray-500">
              <Shield className="w-4 h-4 mr-2" />
              30-day money-back guarantee
            </div>
          </CardContent>
          <CardFooter className="bg-slate-50 px-6 py-4 text-center">
            <div className="w-full flex items-center justify-center space-x-2">
              <Gift className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">Gift this course</span>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default CourseBuyPage;

// Example usage:
// <CourseBuyPage course={courseObject} />
