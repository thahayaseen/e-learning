"use client";
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
  Users,
  Award,
  Shield,
  Gift,
  UserCircle,
  Star,
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
import MentorDialog from "../seementorProfile/mentorProfile";
import { getImage } from "@/services/getImage";

const CourseBuyPage = ({ course, aldredypurchased }) => {
  const router = useRouter();

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
        return <FileText className="w-4 h-4 text-emerald-500" />;
      case "Quiz":
        return <CheckCircle className="w-4 h-4 text-purple-500" />;
      default:
        return null;
    }
  };

  const formatDuration = (duration) => {
    // Convert milliseconds to days
    const days = Math.round(duration / (1000 * 60 * 60 * 24)) || 4;
    return `${days} ${days === 1 ? "Day" : "Days"}`;
  };

  return (
    <div className="w-full p-6 grid md:grid-cols-3 gap-8 bg-gray-50 min-h-screen">
      {/* Course Overview Column */}
      <div className="col-span-2 space-y-8">
        <Card className="w-full overflow-hidden border shadow-md">
          <div className="relative">
            <Image
              width={1200}
              height={400}
              src={`${getImage(course.image)}` || "/default.png"}
              alt={course.Title}
              className="w-full h-72 object-cover"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-gray-900/90 to-transparent p-6">
              <Badge
                variant="secondary"
                className="mb-2 bg-indigo-600 text-white border-none">
                {course.Category?.Category || "Uncategorized Course"}
              </Badge>
              <h1 className="text-3xl font-bold text-white">{course.Title}</h1>
            </div>
          </div>

          <CardContent className="p-6">
            {/* Mentor Information */}
            <div className="mb-6 bg-gray-100 p-4 rounded-lg flex items-center justify-between space-x-4 border border-gray-200">
              <div className="flex items-center space-x-4">
              <UserCircle className="w-16 h-16 text-gray-600" />
              <div>
                <h4 className="text-lg font-semibold text-gray-800">
                  Mentor: {course.Mentor_id?.name || "Unknown Mentor"}
                </h4>
                <p className="text-sm text-gray-600">
                  Expert in {course.Category?.Category || "the field"}
                </p>
              </div>
              </div>
                <MentorDialog mentor={course.Mentor_id} />
            </div>

            {/* Course Highlights */}
            <div className="grid grid-cols-3 gap-4 mb-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div className="flex flex-col items-center p-3 bg-white rounded-md shadow-sm border border-gray-200">
                <BookOpen className="w-6 h-6 text-indigo-600 mb-2" />
                <span className="text-sm font-medium text-gray-700">
                  {course.lessons?.length || 0} Lessons
                </span>
              </div>
              <div className="flex flex-col items-center p-3 bg-white rounded-md shadow-sm border border-gray-200">
                <Clock className="w-6 h-6 text-indigo-600 mb-2" />
                <span className="text-sm font-medium text-gray-700">
                  {formatDuration(course.duration)}
                </span>
              </div>
              <div className="flex flex-col items-center p-3 bg-white rounded-md shadow-sm border border-gray-200">
                <Users className="w-6 h-6 text-indigo-600 mb-2" />
                <span className="text-sm font-medium text-gray-700">
                  {course.Students_enrolled?.length || 0} Students
                </span>
              </div>
            </div>

            {/* Course Description */}
            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-4 inline-block pb-2 border-b-2 border-indigo-500 text-gray-800">
                Course Description
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {course.Description || "No description available."}
              </p>
            </div>

            {/* What You'll Learn Section */}
            <div className="mb-6 bg-gray-50 p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold mb-4 flex items-center text-gray-800">
                <Award className="w-5 h-5 text-indigo-600 mr-2" />
                What You'll Learn
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  "Master key concepts through hands-on lessons",
                  "Complete practical assignments and quizzes",
                  "Receive a certificate upon completion",
                  "Access to resources and community support",
                ].map((item, index) => (
                  <div key={index} className="flex items-start">
                    <CheckCircle className="w-4 h-4 text-emerald-600 mt-1 mr-2 flex-shrink-0" />
                    <span className="text-sm text-gray-600">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Course Content */}
            {course.Content && (
              <div className="mb-6 bg-gray-50 p-6 rounded-lg border border-gray-200">
                <h3 className="text-lg font-semibold mb-4 flex items-center text-gray-800">
                  <Star className="w-5 h-5 text-indigo-600 mr-2" />
                  Course Content
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {course.Content}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Course Curriculum */}
        <Card className="w-full border shadow-md">
          <CardHeader className="bg-gray-100 border-b border-gray-200">
            <CardTitle className="text-xl flex items-center text-gray-800">
              <BookOpen className="w-5 h-5 text-indigo-600 mr-2" />
              Course Curriculum
            </CardTitle>
            <CardDescription className="text-gray-600">
              Explore the detailed course structure
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Accordion type="single" collapsible className="w-full">
              {course.lessons?.map((lesson, lessonIndex) => (
                <AccordionItem
                  value={`lesson-${lessonIndex}`}
                  key={lessonIndex}
                  className="border-b border-gray-200 last:border-0">
                  <AccordionTrigger className="px-6 py-4 hover:bg-gray-50 transition-colors text-gray-800">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 text-indigo-600">
                        {lessonIndex + 1}
                      </div>
                      <span className="font-medium">{lesson.Lessone_name}</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pt-2 pb-4">
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                      {lesson.Content && (
                        <p className="mb-4 text-gray-600">{lesson.Content}</p>
                      )}

                      {lesson.Task && lesson.Task.length > 0 ? (
                        <div className="space-y-2">
                          {lesson.Task.map((task) => (
                            <div
                              key={task._id}
                              className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-md shadow-sm hover:bg-gray-50 transition-all">
                              <div className="flex items-center space-x-3">
                                <div className="p-2 rounded-full bg-gray-100">
                                  {renderTaskIcon(task.Type)}
                                </div>
                                <span className="font-medium text-gray-700">
                                  {task.Type}
                                </span>
                              </div>
                              <Lock className="w-4 h-4 text-gray-500" />
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500 italic">
                          No tasks available for this lesson
                        </p>
                      )}
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
        <Card className="w-full sticky top-6 border shadow-md overflow-hidden">
          <div className="bg-indigo-600 text-white p-6 text-center">
            <h3 className="text-2xl font-bold mb-2">Course Enrollment</h3>
            <p className="opacity-80">Unlock full access today</p>
          </div>
          <CardContent className="p-6">
            <div className="text-center mb-6">
              <div className="flex items-center justify-center">
                <span className="text-3xl font-bold text-gray-800">
                  {formatPrice(course.Price)}
                </span>
                <Badge
                  variant="outline"
                  className="ml-2 text-xs border-indigo-500 text-gray-600">
                  One-time
                </Badge>
              </div>
              <p className="text-sm text-gray-500 mt-1">No hidden fees</p>
            </div>

            <Separator className="my-6 bg-gray-200" />

            <div className="space-y-4 mb-6">
              {[
                "Lifetime access to all course materials",
                "Certificate of completion",
                "Access to future updates",
                "Community support",
              ].map((benefit, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-600">{benefit}</span>
                </div>
              ))}
            </div>

            {!aldredypurchased ? (
              <Button
                className="w-full py-6 text-base font-medium shadow-md bg-indigo-600 hover:bg-indigo-700 text-white"
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
         
        </Card>
      </div>
    </div>
  );
};

export default CourseBuyPage;
