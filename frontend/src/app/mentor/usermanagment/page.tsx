"use client";
import React, { useState, useEffect } from "react";
import {
  Search,
  Filter,
  ArrowUpDown,
  MoreHorizontal,
  PieChart,
  BookOpen,
  Clock,
  Award,
  Users,
  ChevronDown,
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
import { setloading } from "@/lib/features/User";

const UserManagementDashboard = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState("name");
  const [sortDirection, setSortDirection] = useState("asc");
  const [selectedUser, setSelectedUser] = useState(null);
  const [filterRole, setFilterRole] = useState("all");
  const [activeTab, setActiveTab] = useState("overview");
  const [userStats, setUserStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(false);
  const [page,setpage]=useState(0)
  const [totalscount,setTotalCount]=useState(0)
  // Fetch all users on component mount
  useEffect(() => {
    fetchUsers();
  }, [filterRole]);

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
      queryParams.append("page", "1");
      setloading(true)
      const response = await getuserwithperfomence(queryParams.toString());
      const data = response;
      console.log(data, "datas is ");

      if (data.success) {
        setUsers(data.data);
        setTotalCount(data.total)
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
  const fetchUserStats = async (userId) => {
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

  // Toggle user blocked status
  const toggleUserBlockStatus = async (userId, currentStatus) => {
    try {
      const response = await fetch(`/api/management/users/${userId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isBlocked: !currentStatus }),
      });

      const data = await response.json();

      if (data.success) {
        // Update the users list
        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user._id === userId ? { ...user, isBlocked: !currentStatus } : user
          )
        );

        // Update selected user if currently selected
        if (selectedUser && selectedUser._id === userId) {
          setSelectedUser({ ...selectedUser, isBlocked: !currentStatus });
        }

        toast({
          title: "Success",
          description: `User ${
            currentStatus ? "unblocked" : "blocked"
          } successfully`,
        });
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to update user status",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error updating user status:", error);
      toast({
        title: "Error",
        description: "Failed to update user status. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Sort users
  const sortUsers = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Filter and sort users based on current settings
  const filteredUsers = users
    .filter(
      (user) =>
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortField === "name") {
        return sortDirection === "asc"
          ? a.name?.localeCompare(b.name || "")
          : b.name?.localeCompare(a.name || "");
      } else if (sortField === "experience") {
        const aExp = a.profile?.experience || 0;
        const bExp = b.profile?.experience || 0;
        return sortDirection === "asc" ? aExp - bExp : bExp - aExp;
      } else if (sortField === "courses") {
        const aCourses = a.purchasedCourses?.length || 0;
        const bCourses = b.purchasedCourses?.length || 0;
        return sortDirection === "asc"
          ? aCourses - bCourses
          : bCourses - aCourses;
      } else if (sortField === "score") {
        const aScore = a.progress?.length
          ? a.progress.reduce((acc, curr) => acc + (curr.Score || 0), 0) /
            a.progress.length
          : 0;
        const bScore = b.progress?.length
          ? b.progress.reduce((acc, curr) => acc + (curr.Score || 0), 0) /
            b.progress.length
          : 0;
        return sortDirection === "asc" ? aScore - bScore : bScore - aScore;
      }
      return 0;
    });

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
    <div className="flex flex-col h-full w-screen bg-background text-foreground">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">User Management</h1>
            <p className="text-muted-foreground">
              Monitor student performance and progress
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <Users className="h-4 w-4 mr-2" />
              {filteredUsers.length} Users
            </Button>
          </div>
        </div>
      </div>

      {/* Search and filters */}
      <div className="p-4 border-b border-border flex flex-wrap gap-4 items-center">
        <div className="relative flex-grow max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-muted-foreground" />
          </div>
          <Input
            type="text"
            className="pl-10"
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
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter by role" />
            </SelectTrigger>
            <SelectContent>
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
        <div className="w-full md:w-2/3 overflow-auto border-r border-border">
          {loading ? (
            <div className="p-4 space-y-4">
              {Array(5)
                .fill(0)
                .map((_, index) => (
                  <div key={index} className="flex items-center space-x-4">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-40" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <Button
                      variant="ghost"
                      className="flex items-center hover:bg-blue-800 px-2 space-x-1 font-medium"
                      onClick={() => sortUsers("name")}>
                      <span>User</span>
                      <ArrowUpDown className="h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      className="flex items-center hover:bg-blue-800 px-2 space-x-1 font-medium"
                      onClick={() => sortUsers("experience")}>
                      <span>Experience</span>
                      <ArrowUpDown className="h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      className="flex items-center hover:bg-blue-800 px-2 space-x-1 font-medium"
                      onClick={() => sortUsers("courses")}>
                      <span>Courses</span>
                      <ArrowUpDown className="h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      className="flex items-center hover:bg-blue-800 px-2 space-x-1 font-medium"
                      onClick={() => sortUsers("score")}>
                      <span>Avg Score</span>
                      <ArrowUpDown className="h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center py-8 text-muted-foreground">
                      No users found matching your criteria
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow
                      key={user._id}
                      className={`hover:bg-muted cursor-pointer ${
                        selectedUser && selectedUser._id === user._id
                          ? "bg-muted"
                          : ""
                      }`}
                      onClick={() => setSelectedUser(user)}>
                      <TableCell>
                        <div className="flex items-center">
                          <Avatar className="mr-3">
                            <AvatarImage
                              src={user.profile?.avatar}
                              alt={user.name}
                            />
                            <AvatarFallback>
                              {getInitials(user.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{user.name}</div>
                            <div className="text-sm text-muted-foreground">
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
                                ? "success"
                                : "secondary"
                            }>
                            {user.profile?.experience || 0} pts
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        {user.purchasedCourses?.length || 0}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          {user.progress?.length > 0 ? (
                            <>
                              <span className="mr-2">
                                {Math.round(
                                  user.progress.reduce(
                                    (acc, curr) => acc + (curr.Score || 0),
                                    0
                                  ) / user.progress.length
                                )}
                                %
                              </span>
                              <Progress
                                value={Math.round(
                                  user.progress.reduce(
                                    (acc, curr) => acc + (curr.Score || 0),
                                    0
                                  ) / user.progress.length
                                )}
                                className="w-16"
                              />
                            </>
                          ) : (
                            <span className="text-muted-foreground">N/A</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedUser(user);
                              }}>
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleUserBlockStatus(user._id, user.isBlocked);
                              }}>
                              {user.isBlocked ? "Unblock User" : "Block User"}
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
        <div className="w-full md:w-1/3 overflow-auto">
          {selectedUser ? (
            <div className="p-4">
              <div className="flex items-center mb-6">
                <Avatar className="h-16 w-16 mr-4">
                  <AvatarImage
                    src={selectedUser.profile?.avatar}
                    alt={selectedUser.name}
                  />
                  <AvatarFallback>
                    {getInitials(selectedUser.name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-xl font-bold">{selectedUser.name}</h2>
                  <p className="text-sm text-muted-foreground">
                    {selectedUser.email}
                  </p>
                  <div className="flex items-center mt-1">
                    <Badge
                      variant={
                        selectedUser.isBlocked ? "destructive" : "outline"
                      }>
                      {selectedUser.isBlocked ? "Blocked" : "Active"}
                    </Badge>
                    <Badge variant="secondary" className="ml-2">
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
                <TabsList className="grid grid-cols-3 mb-4">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="courses">Courses</TabsTrigger>
                  <TabsTrigger value="activity">Activity</TabsTrigger>
                </TabsList>

                <TabsContent value="overview">
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <Card>
                      <CardHeader className="py-3 pb-0">
                        <CardTitle className="text-sm font-medium flex items-center">
                          <BookOpen className="h-4 w-4 mr-2" />
                          Courses
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="py-4">
                        <div className="text-2xl font-bold">
                          {loadingStats ? (
                            <Skeleton className="h-8 w-16" />
                          ) : (
                            calculateUserStats(selectedUser).totalCourses
                          )}
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="py-3 pb-0">
                        <CardTitle className="text-sm font-medium flex items-center">
                          <Clock className="h-4 w-4 mr-2" />
                          Watch Time
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="py-4">
                        <div className="text-2xl font-bold">
                          {loadingStats ? (
                            <Skeleton className="h-8 w-16" />
                          ) : (
                            `${Math.round(
                              calculateUserStats(selectedUser).totalWatchTime /
                                60
                            )}m`
                          )}
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="py-3 pb-0">
                        <CardTitle className="text-sm font-medium flex items-center">
                          <Award className="h-4 w-4 mr-2" />
                          Avg Score
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="py-4">
                        <div className="text-2xl font-bold">
                          {loadingStats ? (
                            <Skeleton className="h-8 w-16" />
                          ) : (
                            `${calculateUserStats(selectedUser).avgScore}%`
                          )}
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="py-3 pb-0">
                        <CardTitle className="text-sm font-medium flex items-center">
                          <PieChart className="h-4 w-4 mr-2" />
                          Completion
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="py-4">
                        <div className="text-2xl font-bold">
                          {loadingStats ? (
                            <Skeleton className="h-8 w-16" />
                          ) : (
                            `${
                              calculateUserStats(selectedUser).completionRate
                            }%`
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <Card>
                    <CardHeader className="py-3">
                      <CardTitle className="text-sm font-medium">
                        User Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="py-0">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm font-medium">
                            Member Since
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {new Date(
                              selectedUser.createdAt
                            ).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm font-medium">
                            Last Login
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {selectedUser.lastLogin
                              ? new Date(
                                  selectedUser.lastLogin
                                ).toLocaleDateString()
                              : "Never"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm font-medium">
                            Subscription
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {selectedUser.subscription?.plan || "None"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm font-medium">
                            Experience Points
                          </span>
                          <span className="text-sm text-muted-foreground">
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
                          <Card key={index}>
                            <CardContent className="p-4">
                              <div className="flex items-center space-x-4">
                                <Skeleton className="h-12 w-12 rounded" />
                                <div className="space-y-2 flex-1">
                                  <Skeleton className="h-4 w-40" />
                                  <Skeleton className="h-4 w-24" />
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                    </div>
                  ) : selectedUser.purchasedCourses?.length > 0 ? (
                    <div className="space-y-4">
                      {selectedUser.purchasedCourses.map((course) => {
                        const courseProgress = selectedUser.progress?.find(
                          (p) => p.courseId === course._id
                        );
                        const progressPercentage = courseProgress
                          ? Math.round(
                              (courseProgress.completedLessons /
                                courseProgress.totalLessons) *
                                100
                            )
                          : 0;

                        return (
                          <Card key={course._id}>
                            <CardContent className="p-4">
                              <div className="flex items-center space-x-4">
                                <div className="w-12 h-12 rounded bg-muted flex items-center justify-center">
                                  <BookOpen className="h-6 w-6 text-muted-foreground" />
                                </div>
                                <div className="flex-1">
                                  <h4 className="font-medium">
                                    {course.title}
                                  </h4>
                                  <div className="flex items-center mt-2">
                                    <Progress
                                      value={progressPercentage}
                                      className="flex-1 mr-2"
                                    />
                                    <span className="text-sm text-muted-foreground">
                                      {progressPercentage}%
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  ) : (
                    <Card>
                      <CardContent className="p-6 text-center">
                        <BookOpen className="h-12 w-12 mx-auto text-muted-foreground" />
                        <h3 className="mt-4 text-lg font-medium">No Courses</h3>
                        <p className="text-sm text-muted-foreground mt-2">
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
                            <Skeleton className="h-8 w-8 rounded-full" />
                            <div className="space-y-2 flex-1">
                              <Skeleton className="h-4 w-full" />
                              <Skeleton className="h-4 w-24" />
                            </div>
                          </div>
                        ))}
                    </div>
                  ) : selectedUser.activity?.length > 0 ? (
                    <div className="space-y-4">
                      {selectedUser.activity.map((activity, index) => (
                        <div key={index} className="flex items-start space-x-4">
                          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                            {activity.type === "course_progress" && (
                              <BookOpen className="h-4 w-4" />
                            )}
                            {activity.type === "login" && (
                              <Users className="h-4 w-4" />
                            )}
                            {activity.type === "purchase" && (
                              <Award className="h-4 w-4" />
                            )}
                          </div>
                          <div>
                            <p className="text-sm">{activity.description}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(activity.timestamp).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <Card>
                      <CardContent className="p-6 text-center">
                        <Clock className="h-12 w-12 mx-auto text-muted-foreground" />
                        <h3 className="mt-4 text-lg font-medium">
                          No Recent Activity
                        </h3>
                        <p className="text-sm text-muted-foreground mt-2">
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
                <Users className="h-12 w-12 mx-auto text-muted-foreground" />
                <h3 className="mt-4 text-lg font-medium">Select a User</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  Click on a user to view their detailed information
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
      <PaginationComponent page={page} setPage={setpage} itemsPerPage={5} total={totalscount}/>
    </div>
  );
};
export default UserManagementDashboard