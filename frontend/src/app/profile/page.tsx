"use client";
import { useEffect, useRef, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import {
  BookOpen,
  Calendar,
  Award,
  Clock,
  BarChart3,
  Mail,
  Link,
  Shield,
  CheckCircle,
  BookmarkIcon,
  PlayCircle,
  User,
  Edit,
  CheckCircle2,
  XCircle,
  Star,
  Sparkles,
  Clock8,
} from "lucide-react";
const dummyOrders = [
  {
    _id: "660d1f9e4b3d2f0012345671",
    userId: "650d1f9e4b3d2f0012345678",
    courseId: "650d1fae4b3d2f0012345679",
    paymentId: "pay_1234567890abcdef",
    paymentStatus: "paid",
    amount: 4999,
    currency: "inr",
    planType: "premium",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    _id: "660d1f9e4b3d2f0012345672",
    userId: "650d1f9e4b3d2f0012345678",
    courseId: "650d1fae4b3d2f0012345680",
    paymentId: "pay_abcdef1234567890",
    paymentStatus: "pending",
    amount: 2999,
    currency: "usd",
    planType: "basic",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    _id: "660d1f9e4b3d2f0012345673",
    userId: "650d1f9e4b3d2f0012345681",
    courseId: "650d1fae4b3d2f0012345682",
    paymentId: "pay_7890abcdef123456",
    paymentStatus: "failed",
    amount: 1999,
    currency: "inr",
    planType: "standard",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    _id: "660d1f9e4b3d2f0012345674",
    userId: "650d1f9e4b3d2f0012345683",
    courseId: "650d1fae4b3d2f0012345684",
    paymentId: "pay_4567890abcdef123",
    paymentStatus: "paid",
    amount: 9999,
    currency: "usd",
    planType: "pro",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

import { fetchorders, fetchUsers } from "@/services/fetchdata";
import { useDispatch, useSelector } from "react-redux";
import { Orders } from "@/components/Profilecomponents/Orders";
import { Overview } from "@/components/Profilecomponents/profile-overview";
import { setloading } from "@/lib/features/User";
import { storeType } from "@/lib/store";
import ShimmerUI from "@/components/Profilecomponents/Profileshimmerui";
// import { headers } from "next/headers";
import Header from "@/components/header/header";
import { UserDTO } from "@/services/interface/CourseDto";
import { Imentorrequst } from "@/services/interface/mentorReqst";
import { Account } from "@/components/Profilecomponents/profile-Account";
import { Courses } from "@/components/Profilecomponents/profile-Courses";

export interface Iprogress {
  progresPersentage: number;
  coursesCount: number;
  completedCourse: number;
}
const UserProfilePage = () => {
  const isloading = useRef(false);
  const { loading, isAuthenticated } = useSelector(
    (state: storeType) => state.User
  );
  // const [activeTab, setActiveTab] = useState("overview");
  const dispatch = useDispatch();
  const [userData, setUserData] = useState<UserDTO | null>(null);
  const [courses, setCourse] = useState([]);
  const [Beamentor, setBementor] = useState<Imentorrequst | null>(null);
  const [progressdata, setProgress] = useState<Iprogress>({
    progresPersentage: 0,
    completedCourse: 0,
    coursesCount: 0,
  });
  useEffect(() => {
    const fetchdata = async () => {
      dispatch(setloading(true));
      const dat = await fetchUsers("/profile");
      const orders = await fetchorders();
      console.log(orders, "odatais ");

      console.log(isloading.current, "ref is ");
      console.log("done");
      if (dat.mentorRequst) {
        setBementor(dat.mentorRequst);
        console.log("it is ", dat.mentorRequst);
      }
      if (dat.data) {
        console.log(dat, "udaa is ");
        setCourse(dat.datas);
        setUserData(dat.data);
        setProgress(dat.progresdata);
        console.log("progressdata", dat.progresdata);
        // if(dat.data)
      }
      dispatch(setloading(false));
    };
    fetchdata();
  }, []);
  const onsave = (data) => {
    console.log("up data is ", data);

    setUserData((prev) => ({ ...prev, ...data }));
  };
  return (
    <div className="h-screen ">
      <Header isLoggedIn={isAuthenticated} forceFixed={false} />
      {!loading && userData ? (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 to-blue-950 text-gray-900">
          <div className="max-w-6xl mx-auto p-6">
            {/* Header section */}
            <div className="flex flex-col lg:flex-row gap-6 mb-6">
              {/* User info card */}
              <Card className="w-full lg:w-1/3 bg-gray-800 border-gray-700 shadow-xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-indigo-900 to-purple-900 text-white pb-8 relative">
                  <div className="flex flex-col items-center">
                    <Avatar className="h-28 w-28 border-4 border-indigo-400 mb-4 ring-2 ring-purple-500 ring-offset-2 ring-offset-indigo-900">
                      {userData?.profile && userData.profile.avatar ? (
                        <AvatarImage
                          src={userData.profile.avatar}
                          alt={userData.name}
                          width={100}
                          height={100}
                        />
                      ) : (
                        <AvatarFallback className="bg-gradient-to-br from-indigo-700 to-purple-600 text-2xl">
                          {userData?.name
                            ?.split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase() || "?"}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <CardTitle className="text-2xl font-bold">
                      {userData.name}
                    </CardTitle>
                    <CardDescription className="text-indigo-200 flex items-center gap-1">
                      {/* <Award className="h-4 w-4" /> Level {currentLevel} Learner */}
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Mail className="text-indigo-100 h-5 w-5" />
                      <span className="font-mono text-sm text-indigo-50">
                        {userData.email}
                      </span>
                    </div>
                    {userData.profile?.social_link && (
                      <div className="flex items-center gap-2">
                        <Link className="text-indigo-400 h-5 w-5" />
                        <a
                          href={userData.profile.social_link}
                          className="text-indigo-50 font-mono hover:text-indigo-300 hover:underline"
                          target="_blank"
                          rel="noopener">
                          {userData.profile.social_link
                            .split("/")[2]
                            .split(".")[1][0]
                            .toUpperCase() +
                            userData.profile.social_link
                              .split("/")[2]
                              .split(".")[1]
                              .slice(1) || "Social Link"}{" "}
                          Profile
                        </a>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Shield className="text-indigo-400 h-5 w-5" />
                      <span className="text-indigo-50 font-mono">
                        Account Status:{" "}
                        {userData.isBlocked ? (
                          <Badge variant="destructive">Blocked</Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="bg-green-900 text-green-100 border-green-700">
                            Active
                          </Badge>
                        )}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2
                        color={`${userData.verified ? "green" : "gray"}`}
                        className={`h-5 w-5 f${
                          userData.verified ? "text-green-400" : "text-gray-400"
                        }`}
                      />
                      <span className="font-mono text-indigo-100">
                        {userData.verified
                          ? "Email Verified"
                          : "Email Not Verified"}
                      </span>
                    </div>

                    <div className="pt-4">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm">
                          {/* {experienceToNextLevel} XP to Level {currentLevel + 1} */}
                        </span>
                      </div>
                      <Progress
                        value={progressdata.progresPersentage}
                        className="h-2 bg-blue-100"></Progress>
                    </div>
                    <div className="flex justify-between pt-4 mt-2 border-t border-gray-700">
                      <div className="text-center">
                        <p className="text-xl text-indigo-100 font-bold">
                          {progressdata.coursesCount}
                        </p>
                        <p className="text-xs text-gray-400">Courses</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xl text-indigo-100 font-bold">
                          {progressdata.completedCourse}
                        </p>
                        <p className="text-xs text-gray-400">Completed</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xl text-indigo-100 font-bold">
                          {progressdata.progresPersentage}%
                        </p>
                        <p className="text-xs text-gray-400">Overall</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* User progress & courses section */}
              <div className="w-full lg:w-3/4">
                <Tabs defaultValue="overview" className="w-full">
                  <TabsList className="grid grid-cols-4 mb-6 bg-gray-800">
                    <TabsTrigger
                      value="overview"
                      className="data-[state=active]:bg-indigo-900 data-[state=active]:text-white">
                      Overview
                    </TabsTrigger>
                    <TabsTrigger
                      value="courses"
                      className="data-[state=active]:bg-indigo-900 data-[state=active]:text-white">
                      My Courses
                    </TabsTrigger>
                    <TabsTrigger
                      value="account"
                      className="data-[state=active]:bg-indigo-900 data-[state=active]:text-white">
                      Account
                    </TabsTrigger>
                    <TabsTrigger
                      value="orders"
                      className="data-[state=active]:bg-indigo-900 data-[state=active]:text-white">
                      order
                    </TabsTrigger>
                  </TabsList>

                  <Overview
                    userData={userData}
                    courses={courses}
                    key={1}
                    progress={progressdata}
                  />
                  <Account
                    userData={userData}
                    Beamentor={Beamentor}
                    onSave={onsave}
                  />
                  <Courses courses={courses} key={2} />
                  <Orders />
                </Tabs>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <ShimmerUI />
      )}
    </div>
  );
};

// Helper Components

export default UserProfilePage;
