"use client";
import { useState, useEffect } from "react";
import {
  Search,
  MoreHorizontal,
  PieChart,
  BookOpen,
  Clock,
  Award,
  Users,
} from "lucide-react";

// Import shadcn components
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/hooks/use-toast";
import { getuserwithperfomence } from "@/services/fetchdata";
import PaginationComponent from "@/components/default/pagination";

const UserManagementDashboard = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [filterRole, setFilterRole] = useState("all");
  const [activeTab, setActiveTab] = useState("overview");
  const [userStats, setUserStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(false);
  const [page, setpage] = useState(1);
  const [totalscount, setTotalCount] = useState(0);

  // Add this debounce function after the useState declarations
  const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        func(...args);
      }, delay);
    };
  };

  // Add this useEffect for debounced search
  useEffect(() => {
    const debouncedFetch = debounce(() => {
      setpage(1); // Reset to first page on new search
      fetchUsers();
    }, 500);

    if (searchTerm) {
      debouncedFetch();
    }

    return () => {
      // Cleanup
      if (debouncedFetch.timeoutId) {
        clearTimeout(debouncedFetch.timeoutId);
      }
    };
  }, [searchTerm]);

  // Fetch all users on component mount
  useEffect(() => {
    // Initial fetch happens through the page/filterRole dependency
  }, []);

  // Refetch when page changes
  useEffect(() => {
    fetchUsers();
  }, [page, filterRole]);

  // Fetch user stats when a user is selected
  useEffect(() => {
    if (selectedUser) {
      // fetchUserStats(selectedUser._id);
    } else {
      setUserStats(null);
    }
  }, [selectedUser]);

  // Fetch users from API
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (filterRole !== "all") {
        queryParams.append("role", filterRole);
      }
      if (searchTerm.trim() !== "") {
        queryParams.append("search", searchTerm);
      }
      queryParams.append("page", (page + 1).toString()); // Add 1 because page is zero-indexed
      queryParams.append("limit", "5"); // Set consistent limit

      const response = await getuserwithperfomence(queryParams.toString());
      const data: any = response;

      if (data.success) {
        setUsers(data.data);
        setTotalCount(data.total);
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to fetch users",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      toast({
        title: "Error",
        description: "Failed to fetch users. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch detailed stats for a user
  const fetchUserStats = async (userId: string) => {
    setLoadingStats(true);
    try {
      const response = await fetch(`/api/management/users/${userId}/stats`);
      const data = await response.json();

      if (data.success) {
        setUserStats(data.stats);
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to fetch user stats",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching user stats:", error);
      toast({
        title: "Error",
        description: "Failed to fetch user statistics. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoadingStats(false);
    }
  };



  // Filter and sort users based on current settings
  const filteredUsers = users;

  // Calculate user stats from progress data
  const calculateUserStats = (user) => {
    // If we have pre-calculated stats from the API, use those
    if (userStats) {
      return userStats;
    }

    if (!user || !user.progress || user.progress.length === 0) {
      return {
        totalCourses: 0,
        totalLessons: 0,
        completedLessons: 0,
        completionRate: 0,
        totalWatchTime: 0,
        avgScore: 0,
      };
    }

    // Otherwise calculate from user progress data
    const totalCourses = user.purchasedCourses?.length || 0;
    const totalLessons = user.progress.reduce(
      (acc, course) => acc + (course.lesson_progress?.length || 0),
      0
    );
    const completedLessons = user.progress.reduce(
      (acc, course) =>
        acc +
        (course.lesson_progress?.filter((lesson) => lesson.Completed)?.length ||
          0),
      0
    );
    const completionRate =
      totalLessons > 0
        ? Math.round((completedLessons / totalLessons) * 100)
        : 0;
    const totalWatchTime = user.progress.reduce(
      (acc, course) =>
        acc +
        (course.lesson_progress?.reduce(
          (sum, lesson) => sum + (lesson.WatchTime || 0),
          0
        ) || 0),
      0
    );
    const avgScore =
      user.progress.length > 0
        ? Math.round(
            user.progress.reduce((acc, curr) => acc + (curr.Score || 0), 0) /
              user.progress.length
          )
        : 0;

    return {
      totalCourses,
      totalLessons,
      completedLessons,
      completionRate,
      totalWatchTime,
      avgScore,
    };
  };

  // Get initials for avatar fallback
  const getInitials = (name) => {
    return (
      name
        ?.split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase() || ""
    );
  };

  return (
    <div className="flex flex-col h-full w-screen bg-slate-900 text-slate-100">
      {/* Header */}
      <div className="p-6 border-b border-slate-800 bg-gradient-to-r from-slate-900 to-slate-800">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-100 bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-teal-300">
              User Management
            </h1>
            <p className="text-slate-400">
              Monitor student performance and progress
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              className="bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-200">
              <Users className="h-4 w-4 mr-2 text-emerald-400" />
              {filteredUsers.length} Users
            </Button>
          </div>
        </div>
      </div>

      {/* Search and filters */}
      <div className="p-4 border-b border-slate-800 bg-slate-900 flex flex-wrap gap-4 items-center shadow-sm">
        <div className="relative flex-grow max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-400" />
          </div>
          <Input
            type="text"
            className="pl-10 bg-slate-800 border-slate-700 focus:border-emerald-500 text-slate-200 placeholder:text-slate-500"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex items-center space-x-2">
          <Select
            value={filterRole}
            onValueChange={(value) => {
              setFilterRole(value);
              setSelectedUser(null);
            }}>
            <SelectTrigger className="w-40 border-slate-700 bg-slate-800 text-slate-200">
              <SelectValue placeholder="Filter by role" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700 text-slate-200">
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="student">Students</SelectItem>
              <SelectItem value="mentor">Mentors</SelectItem>
              <SelectItem value="admin">Admins</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col md:flex-row h-full overflow-hidden">
        {/* Users list */}
        <div className="w-full md:w-2/3 overflow-auto border-r border-slate-800">
          {loading ? (
            <div className="p-4 space-y-4">
              {Array(5)
                .fill(0)
                .map((_, index) => (
                  <div key={index} className="flex items-center space-x-4">
                    <Skeleton className="h-12 w-12 rounded-full bg-slate-800" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-40 bg-slate-800" />
                      <Skeleton className="h-4 w-24 bg-slate-800" />
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-slate-800">
                <TableRow className="border-slate-700 hover:bg-slate-800">
                  <TableHead className="font-medium text-slate-300">
                    User
                  </TableHead>
                  <TableHead className="font-medium text-slate-300">
                    Experience
                  </TableHead>
                  <TableHead className="font-medium text-slate-300">
                    Courses
                  </TableHead>
                  <TableHead className="font-medium text-slate-300">
                    Avg Score
                  </TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow className="border-slate-800 hover:bg-slate-800/50">
                    <TableCell
                      colSpan={5}
                      className="text-center py-8 text-slate-400">
                      No users found matching your criteria
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow
                      key={user._id}
                      className={`border-slate-800 hover:bg-slate-800/50 cursor-pointer transition-colors ${
                        selectedUser && selectedUser._id === user._id
                          ? "bg-slate-800/70"
                          : ""
                      }`}
                      onClick={() => setSelectedUser(user)}>
                      <TableCell>
                        <div className="flex items-center">
                          <Avatar className="mr-3 border border-slate-700">
                            <AvatarImage
                              src={user.profile?.avatar}
                              alt={user.name}
                            />
                            <AvatarFallback className="bg-emerald-900 text-emerald-100">
                              {getInitials(user.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium text-slate-200">
                              {user.name}
                            </div>
                            <div className="text-sm text-slate-400">
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Badge
                            variant={
                              user.profile?.experience > 100
                                ? "outline"
                                : "secondary"
                            }
                            className={
                              user.profile?.experience > 100
                                ? "border-emerald-500 text-emerald-400"
                                : "bg-emerald-900/30 text-emerald-400"
                            }>
                            {user.profile?.experience || 0} pts
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="text-slate-300">
                        {user.purchasedCourses?.length || 0}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          {user.progress?.length > 0 ? (
                            <>
                              <span className="mr-2 text-slate-300">
                                {Math.round(
                                  user.progress.reduce(
                                    (acc, curr) =>
                                      acc + (curr.OverallScore || 0),
                                    0
                                  ) / user.progress.length
                                )}
                                %
                              </span>
                              <Progress
                                value={Math.round(
                                  user.progress.reduce(
                                    (acc, curr) =>
                                      acc + (curr.OverallScore || 0),
                                    0
                                  ) / user.progress.length
                                )}
                                className="w-16 bg-slate-700"
                                // indicatorClassName="bg-green-500" // This is the key line to add color to the completed part
                              />
                            </>
                          ) : (
                            <span className="text-slate-500">N/A</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              className="h-8 w-8 p-0 text-slate-400 hover:text-slate-100 hover:bg-slate-800">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="end"
                            className="bg-slate-800 border-slate-700 text-slate-200">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedUser(selectedUser?null:user);
                              }}
                              className="hover:bg-slate-700 focus:bg-slate-700">
                              {selectedUser?'Close':'View Details'}
                            </DropdownMenuItem>
                 
                     
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </div>

        {/* User details panel */}
        <div className="w-full md:w-1/3 overflow-auto bg-slate-800/50 border-l border-slate-800">
          {selectedUser ? (
            <div className="p-4">
              <div className="flex items-center mb-6">
                <Avatar className="h-16 w-16 mr-4 border-2 border-emerald-500">
                  <AvatarImage
                    src={selectedUser.profile?.avatar}
                    alt={selectedUser.name}
                  />
                  <AvatarFallback className="bg-emerald-900 text-emerald-100 text-xl">
                    {getInitials(selectedUser.name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-xl font-bold text-slate-100">
                    {selectedUser.name}
                  </h2>
                  <p className="text-sm text-slate-400">{selectedUser.email}</p>
                  <div className="flex items-center mt-1">
                    <Badge
                      variant={
                        selectedUser.isBlocked ? "destructive" : "outline"
                      }
                      className={
                        selectedUser.isBlocked
                          ? ""
                          : "border-emerald-500 text-emerald-400"
                      }>
                      {selectedUser.isBlocked ? "Blocked" : "Active"}
                    </Badge>
                    <Badge
                      variant="secondary"
                      className="ml-2 bg-slate-700 text-slate-300">
                      {selectedUser.role?.charAt(0).toUpperCase() +
                        selectedUser.role?.slice(1)}
                    </Badge>
                  </div>
                </div>
              </div>

              <Tabs
                defaultValue={activeTab}
                onValueChange={setActiveTab}
                className="w-full">
                <TabsList className="grid grid-cols-3 mb-4 bg-slate-900">
                  <TabsTrigger
                    value="overview"
                    className="data-[state=active]:bg-emerald-900/30 data-[state=active]:text-emerald-400">
                    Overview
                  </TabsTrigger>
                  <TabsTrigger
                    value="courses"
                    className="data-[state=active]:bg-emerald-900/30 data-[state=active]:text-emerald-400">
                    Courses
                  </TabsTrigger>
                  <TabsTrigger
                    value="activity"
                    className="data-[state=active]:bg-emerald-900/30 data-[state=active]:text-emerald-400">
                    Activity
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="overview">
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <Card className="border-slate-700 bg-slate-900 shadow-md">
                      <CardHeader className="py-3 pb-0">
                        <CardTitle className="text-sm font-medium flex items-center text-slate-300">
                          <BookOpen className="h-4 w-4 mr-2 text-emerald-400" />
                          Courses
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="py-4">
                        <div className="text-2xl font-bold text-slate-100">
                          {loadingStats ? (
                            <Skeleton className="h-8 w-16 bg-slate-800" />
                          ) : (
                            calculateUserStats(selectedUser).totalCourses
                          )}
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="border-slate-700 bg-slate-900 shadow-md">
                      <CardHeader className="py-3 pb-0">
                        <CardTitle className="text-sm font-medium flex items-center text-slate-300">
                          <Clock className="h-4 w-4 mr-2 text-emerald-400" />
                          Watch Time
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="py-4">
                        <div className="text-2xl font-bold text-slate-100">
                          {loadingStats ? (
                            <Skeleton className="h-8 w-16 bg-slate-800" />
                          ) : (
                            `${Math.round(
                              calculateUserStats(selectedUser).totalWatchTime /
                                60
                            )}m`
                          )}
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="border-slate-700 bg-slate-900 shadow-md">
                      <CardHeader className="py-3 pb-0">
                        <CardTitle className="text-sm font-medium flex items-center text-slate-300">
                          <Award className="h-4 w-4 mr-2 text-emerald-400" />
                          Avg Score
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="py-4">
                        <div className="text-2xl font-bold text-slate-100">
                          {loadingStats ? (
                            <Skeleton className="h-8 w-16 bg-slate-800" />
                          ) : (
                            `${calculateUserStats(selectedUser).avgScore}%`
                          )}
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="border-slate-700 bg-slate-900 shadow-md">
                      <CardHeader className="py-3 pb-0">
                        <CardTitle className="text-sm font-medium flex items-center text-slate-300">
                          <PieChart className="h-4 w-4 mr-2 text-emerald-400" />
                          Completion
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="py-4">
                        <div className="text-2xl font-bold text-slate-100">
                          {loadingStats ? (
                            <Skeleton className="h-8 w-16 bg-slate-800" />
                          ) : (
                            `${
                              calculateUserStats(selectedUser).completionRate
                            }%`
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <Card className="border-slate-700 bg-slate-900">
                    <CardHeader className="py-3">
                      <CardTitle className="text-sm font-medium text-slate-300">
                        User Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="py-0">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm font-medium text-slate-300">
                            Member Since
                          </span>
                          <span className="text-sm text-slate-400">
                            {new Date(
                              selectedUser.createdAt
                            ).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm font-medium text-slate-300">
                            Last Login
                          </span>
                          <span className="text-sm text-slate-400">
                            {selectedUser.lastLogin
                              ? new Date(
                                  selectedUser.lastLogin
                                ).toLocaleDateString()
                              : "Never"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm font-medium text-slate-3কিন্তon">
                            Subscription
                          </span>
                          <span className="text-sm text-slate-400">
                            {selectedUser.subscription?.plan || "None"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm font-medium text-slate-300">
                            Experience Points
                          </span>
                          <span className="text-sm text-slate-400">
                            {selectedUser.profile?.experience || 0}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="courses">
                  {loadingStats ? (
                    <div className="space-y-4">
                      {Array(3)
                        .fill(0)
                        .map((_, index) => (
                          <Card
                            key={index}
                            className="border-slate-700 bg-slate-900">
                            <CardContent className="p-4">
                              <div className="flex items-center space-x-4">
                                <Skeleton className="h-12 w-12 rounded bg-slate-800" />
                                <div className="space-y-2 flex-1">
                                  <Skeleton className="h-4 w-40 bg-slate-800" />
                                  <Skeleton className="h-4 w-24 bg-slate-800" />
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                    </div>
                  ) : selectedUser.purchasedCourses?.length > 0 ? (
                    <div className="space-y-4">
                      {selectedUser.purchasedCourses.map((course) => {
                        // Find the progress for this specific course
                        const courseProgress = selectedUser.progress?.find(
                          (p) => p.Course_id?._id === course._id
                        );

                        // Calculate progress percentage based on completed lessons
                        const totalLessons =
                          courseProgress?.lesson_progress?.length || 0;
                        const completedLessons =
                          courseProgress?.lesson_progress?.filter(
                            (lesson) => lesson.Completed
                          )?.length || 0;
                        const progressPercentage =
                          totalLessons > 0
                            ? Math.round(
                                (completedLessons / totalLessons) * 100
                              )
                            : 0;

                        // Get the overall score for this course
                        const overallScore = courseProgress?.OverallScore || 0;

                        return (
                          <Card
                            key={course._id}
                            className="border-slate-700 bg-slate-900">
                            <CardContent className="p-4">
                              <div className="flex items-center space-x-4">
                                <div className="w-12 h-12 rounded bg-emerald-900/30 flex items-center justify-center">
                                  <BookOpen className="h-6 w-6 text-emerald-400" />
                                </div>
                                <div className="flex-1">
                                  <h4 className="font-medium text-slate-200">
                                    {course.Title}
                                  </h4>
                                  <div className="mt-3 space-y-2">
                                    <div className="flex items-center justify-between">
                                      <span className="text-xs text-slate-400">
                                        Progress
                                      </span>
                                      <span className="text-xs font-medium text-emerald-400">
                                        {progressPercentage}%
                                      </span>
                                    </div>
                                    <Progress
                                      value={progressPercentage}
                                      className="h-2 bg-slate-100"
                                      // indicatorClassName="bg-emerald-500"
                                    />
                                    <div className="flex items-center justify-between mt-1">
                                      <span className="text-xs text-slate-400">
                                        Score
                                      </span>
                                      <span className="text-xs font-medium text-emerald-400">
                                        {overallScore}%
                                      </span>
                                    </div>
                                    <Progress
                                      value={overallScore}
                                      className="h-2 bg-slate-100"
                                      // indicatorClassName="bg-green-500"
                                    />
                                    <div className="flex justify-between text-xs text-slate-400 mt-1">
                                      <span>
                                        Lessons: {completedLessons}/
                                        {totalLessons}
                                      </span>
                                      <span>
                                        Students:{" "}
                                        {course.Students_enrolled?.length || 0}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  ) : (
                    <Card className="border-slate-700 bg-slate-900">
                      <CardContent className="p-6 text-center">
                        <BookOpen className="h-12 w-12 mx-auto text-slate-600" />
                        <h3 className="mt-4 text-lg font-medium text-slate-300">
                          No Courses
                        </h3>
                        <p className="text-sm text-slate-500 mt-2">
                          This user hasn't purchased any courses yet.
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                <TabsContent value="activity">
                  {loadingStats ? (
                    <div className="space-y-4">
                      {Array(5)
                        .fill(0)
                        .map((_, index) => (
                          <div
                            key={index}
                            className="flex items-start space-x-4">
                            <Skeleton className="h-8 w-8 rounded-full bg-slate-800" />
                            <div className="space-y-2 flex-1">
                              <Skeleton className="h-4 w-full bg-slate-800" />
                              <Skeleton className="h-4 w-24 bg-slate-800" />
                            </div>
                          </div>
                        ))}
                    </div>
                  ) : selectedUser.activity?.length > 0 ? (
                    <div className="space-y-4">
                      {selectedUser.activity.map((activity, index) => (
                        <div key={index} className="flex items-start space-x-4">
                          <div className="w-8 h-8 rounded-full bg-emerald-900/30 flex items-center justify-center">
                            {activity.type === "course_progress" && (
                              <BookOpen className="h-4 w-4 text-emerald-400" />
                            )}
                            {activity.type === "login" && (
                              <Users className="h-4 w-4 text-emerald-400" />
                            )}
                            {activity.type === "purchase" && (
                              <Award className="h-4 w-4 text-emerald-400" />
                            )}
                          </div>
                          <div>
                            <p className="text-sm text-slate-300">
                              {activity.description}
                            </p>
                            <p className="text-xs text-slate-500">
                              {new Date(activity.timestamp).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <Card className="border-slate-700 bg-slate-900">
                      <CardContent className="p-6 text-center">
                        <Clock className="h-12 w-12 mx-auto text-slate-600" />
                        <h3 className="mt-4 text-lg font-medium text-slate-300">
                          No Recent Activity
                        </h3>
                        <p className="text-sm text-slate-500 mt-2">
                          This user hasn't had any recent activity.
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center p-8">
              <div className="text-center">
                <Users className="h-12 w-12 mx-auto text-slate-600" />
                <h3 className="mt-4 text-lg font-medium text-slate-300">
                  Select a User
                </h3>
                <p className="text-sm text-slate-500 mt-2">
                  Click on a user to view their detailed information
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="border-t border-slate-800 p-4 bg-slate-900">
        <PaginationComponent
          page={page}
          setPage={setpage}
          itemsPerPage={5}
          total={totalscount}
        />
      </div>
    </div>
  );
};
export default UserManagementDashboard;
