"use client";
import type React from "react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Edit,
  Clock,
  Users,
  BookOpen,
  CheckCircle,
  Plus,
  Trash2,
  Calendar,
  Search,
  Settings,
  PlusCircle,
  FileText,
} from "lucide-react";
import type { ICourses, ILesson } from "@/services/interface/CourseDto";
import { useRouter } from "next/navigation";
import MentorCourseCreation from "@/components/mentor/addCourses";
import {
  addnewLesson,
  deleteCourse,
  getcourse,
  getlessons,
} from "@/services/fetchdata";
import Image from "next/image";
import { toast } from "sonner";
// Update the import for EditLessonDialog to use the new component
import EditLessonDialog from "@/components/courses/editCourse";
import AddLessonModal from "@/components/courses/addlesson";

const MentorDashboard = () => {
  const [courses, setCourses] = useState<ICourses[]>([]);
  const [latestCourses, setLatestCourses] = useState<ICourses[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<ICourses | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [lessons, setLessons] = useState<ILesson[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [createCourseOpen, setCreateOpen] = useState(false);
  const [isLessonEditDialogOpen, setEditLessonDialog] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState<ILesson | null>(null);
  const [addCouseopen, setAddcurse] = useState(false);
  const [filters, setFilters] = useState({
    status: "all", // "all", "approved", "pending"
    priceRange: "all", // "all", "free", "paid", "premium"
    sortBy: "newest", // "newest", "oldest", "price-high", "price-low", "students"
  });
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const router = useRouter();
  const toggle = () => {
    console.log("here");

    setCreateOpen((prev) => !prev);
  };
  useEffect(() => {
    // Using dummy data instead of fetching
    const fn = async () => {
      const data = await fetchMentorCourses();
      console.log("all course is", data);
      setCourses(data);
    };
    fn();
  }, []);

  // Update latestCourses whenever courses or filters change
  useEffect(() => {
    const filtered = filteredCourses.slice(0, 6);
    setLatestCourses(filtered);
  }, [courses, filters, searchTerm]);

  const fetchMentorCourses = async () => {
    setIsLoading(true);
    try {
      return await getcourse();
    } catch (error) {
      console.error("Error fetching courses:", error);
      setIsLoading(false);
    }
  };

  const fetchCourseLessons = async (courseId: string) => {
    try {
      console.log(courseId);

      const dt = await getlessons(courseId);
      console.log(dt, "in hadsfa");
      return dt.data;
    } catch (error) {
      console.error("Error fetching lessons:", error);
      return [];
    }
  };

  // Replace the existing handleEditCourse function with this updated version
  const handleEditCourse = async (course: ICourses) => {
    setSelectedCourse(course);
    const courseLessons = await fetchCourseLessons(course._id);
    setLessons(courseLessons);
    setIsEditDialogOpen(true);
  };

  // Add a new function to handle editing a lesson
  const handleEditLesson = async (lesson: ILesson) => {
    setSelectedLesson(lesson);
    setEditLessonDialog(true);
  };

  const handleSaveChanges = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedCourse) return;

    try {
      // Simulating API call
      setTimeout(() => {
        // Update courses list
        setCourses(
          courses.map((course) =>
            course._id === selectedCourse._id ? selectedCourse : course
          )
        );

        // Update latest courses if needed
        setLatestCourses((prevLatest) => {
          const updatedLatest = [...prevLatest];
          const index = updatedLatest.findIndex(
            (c) => c._id === selectedCourse._id
          );
          if (index !== -1) {
            updatedLatest[index] = selectedCourse;
          }
          return updatedLatest;
        });

        setIsEditDialogOpen(false);
      }, 300);
    } catch (error) {
      console.error("Error updating course:", error);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    if (!selectedCourse) return;

    setSelectedCourse({
      ...selectedCourse,
      [e.target.name]: e.target.value,
    });
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Apply all filters and sorting
  const filteredCourses = courses
    .filter((course) => {
      // Text search filter
      const matchesSearch =
        course.Title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.Category?.Category?.toLowerCase().includes(
          searchTerm.toLowerCase()
        ) ||
        course.Description?.toLowerCase().includes(searchTerm.toLowerCase());

      // Status filter
      const matchesStatus =
        filters.status === "all" ||
        (filters.status === "approved" &&
          course.Approved_by_admin === "approved") ||
        (filters.status === "pending" &&
          course.Approved_by_admin == "pending") ||
        (filters.status === "rejected" &&
          course.Approved_by_admin !== "approved");

      // Price range filter
      const price = course.Price || 0;
      const matchesPriceRange =
        filters.priceRange === "all" ||
        (filters.priceRange === "free" && price === 0) ||
        (filters.priceRange === "paid" && price > 0 && price <= 50) ||
        (filters.priceRange === "premium" && price > 50);

      return matchesSearch && matchesStatus && matchesPriceRange;
    })
    .sort((a, b) => {
      // Apply sorting
      switch (filters.sortBy) {
        case "newest":
          return (
            new Date(b.CreatedAt || 0).getTime() -
            new Date(a.CreatedAt || 0).getTime()
          );
        case "oldest":
          return (
            new Date(a.CreatedAt || 0).getTime() -
            new Date(b.CreatedAt || 0).getTime()
          );
        case "price-high":
          return (b.Price || 0) - (a.Price || 0);
        case "price-low":
          return (a.Price || 0) - (b.Price || 0);
        case "students":
          return (
            (b.Students_enrolled?.length || 0) -
            (a.Students_enrolled?.length || 0)
          );
        default:
          return 0;
      }
    });

  // Add click-away listener for filter dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (isFilterOpen && !target.closest("[data-filter-dropdown]")) {
        setIsFilterOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isFilterOpen]);

  return (
    <div
      className={`w-full bg-blue-950 flex justify-center  ${
        createCourseOpen ? "items-center relative" : ""
      }  min-h-screen`}>
      <div className=" absolute top-0 left-44">
        {createCourseOpen && (
          <MentorCourseCreation setCourses={setCourses} toggle={toggle} />
        )}
      </div>

      {/* Main Content */}

      <div className={`w-full p-4 ${createCourseOpen ? "blur-sm" : ""}`}>
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Course Management</h1>
            <p className="text-blue-300">Manage your courses and content</p>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400"
                size={18}
              />
              <Input
                placeholder="Search courses..."
                className="pl-10 bg-blue-900 border-blue-700 text-white w-64 focus:border-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="relative">
              <Button
                variant="outline"
                className="bg-blue-900 border-blue-700 text-white hover:bg-blue-800"
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                data-filter-dropdown>
                <Settings size={18} className="mr-2" />
                Filters
              </Button>

              {isFilterOpen && (
                <div
                  className="absolute right-0 top-full mt-2 w-72 bg-blue-900 border border-blue-700 rounded-md shadow-lg z-10 p-4"
                  data-filter-dropdown>
                  <div className="space-y-4">
                    <div>
                      <Label className="text-white mb-2 block">Status</Label>
                      <div className="grid grid-cols-3 gap-2">
                        <Button
                          variant={
                            filters.status === "all" ? "default" : "outline"
                          }
                          size="sm"
                          className={
                            filters.status === "all"
                              ? "bg-blue-600"
                              : "bg-blue-800 border-blue-700 text-blue-200"
                          }
                          onClick={() =>
                            setFilters({ ...filters, status: "all" })
                          }>
                          All
                        </Button>
                        <Button
                          variant={
                            filters.status === "approved"
                              ? "default"
                              : "outline"
                          }
                          size="sm"
                          className={
                            filters.status === "approved"
                              ? "bg-blue-600"
                              : "bg-blue-800 border-blue-700 text-blue-200"
                          }
                          onClick={() =>
                            setFilters({ ...filters, status: "approved" })
                          }>
                          Approved
                        </Button>
                        <Button
                          variant={
                            filters.status === "pending" ? "default" : "outline"
                          }
                          size="sm"
                          className={
                            filters.status === "pending"
                              ? "bg-blue-600"
                              : "bg-blue-800 border-blue-700 text-blue-200"
                          }
                          onClick={() =>
                            setFilters({ ...filters, status: "pending" })
                          }>
                          Pending
                        </Button>
                        <Button
                          variant={
                            filters.status === "rejected"
                              ? "destructive"
                              : "outline"
                          }
                          size="sm"
                          className={
                            filters.status === "rejected"
                              ? "bg-blue-600"
                              : "bg-blue-800 border-blue-700 text-blue-200"
                          }
                          onClick={() =>
                            setFilters({ ...filters, status: "rejected" })
                          }>
                          Rejected
                        </Button>
                      </div>
                    </div>

                    <div>
                      <Label className="text-white mb-2 block">
                        Price Range
                      </Label>
                      <div className="grid grid-cols-4 gap-2">
                        <Button
                          variant={
                            filters.priceRange === "all" ? "default" : "outline"
                          }
                          size="sm"
                          className={
                            filters.priceRange === "all"
                              ? "bg-blue-600"
                              : "bg-blue-800 border-blue-700 text-blue-200"
                          }
                          onClick={() =>
                            setFilters({ ...filters, priceRange: "all" })
                          }>
                          All
                        </Button>
                        <Button
                          variant={
                            filters.priceRange === "free"
                              ? "default"
                              : "outline"
                          }
                          size="sm"
                          className={
                            filters.priceRange === "free"
                              ? "bg-blue-600"
                              : "bg-blue-800 border-blue-700 text-blue-200"
                          }
                          onClick={() =>
                            setFilters({ ...filters, priceRange: "free" })
                          }>
                          Free
                        </Button>
                        <Button
                          variant={
                            filters.priceRange === "paid"
                              ? "default"
                              : "outline"
                          }
                          size="sm"
                          className={
                            filters.priceRange === "paid"
                              ? "bg-blue-600"
                              : "bg-blue-800 border-blue-700 text-blue-200"
                          }
                          onClick={() =>
                            setFilters({ ...filters, priceRange: "paid" })
                          }>
                          Paid
                        </Button>
                        <Button
                          variant={
                            filters.priceRange === "premium"
                              ? "default"
                              : "outline"
                          }
                          size="sm"
                          className={
                            filters.priceRange === "premium"
                              ? "bg-blue-600"
                              : "bg-blue-800 border-blue-700 text-blue-200"
                          }
                          onClick={() =>
                            setFilters({ ...filters, priceRange: "premium" })
                          }>
                          Premium
                        </Button>
                      </div>
                    </div>

                    <div>
                      <Label className="text-white mb-2 block">Sort By</Label>
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          variant={
                            filters.sortBy === "newest" ? "default" : "outline"
                          }
                          size="sm"
                          className={
                            filters.sortBy === "newest"
                              ? "bg-blue-600"
                              : "bg-blue-800 border-blue-700 text-blue-200"
                          }
                          onClick={() =>
                            setFilters({ ...filters, sortBy: "newest" })
                          }>
                          Newest
                        </Button>
                        <Button
                          variant={
                            filters.sortBy === "oldest" ? "default" : "outline"
                          }
                          size="sm"
                          className={
                            filters.sortBy === "oldest"
                              ? "bg-blue-600"
                              : "bg-blue-800 border-blue-700 text-blue-200"
                          }
                          onClick={() =>
                            setFilters({ ...filters, sortBy: "oldest" })
                          }>
                          Oldest
                        </Button>
                        <Button
                          variant={
                            filters.sortBy === "price-high"
                              ? "default"
                              : "outline"
                          }
                          size="sm"
                          className={
                            filters.sortBy === "price-high"
                              ? "bg-blue-600"
                              : "bg-blue-800 border-blue-700 text-blue-200"
                          }
                          onClick={() =>
                            setFilters({ ...filters, sortBy: "price-high" })
                          }>
                          Price (High)
                        </Button>
                        <Button
                          variant={
                            filters.sortBy === "price-low"
                              ? "default"
                              : "outline"
                          }
                          size="sm"
                          className={
                            filters.sortBy === "price-low"
                              ? "bg-blue-600"
                              : "bg-blue-800 border-blue-700 text-blue-200"
                          }
                          onClick={() =>
                            setFilters({ ...filters, sortBy: "price-low" })
                          }>
                          Price (Low)
                        </Button>
                        <Button
                          variant={
                            filters.sortBy === "students"
                              ? "default"
                              : "outline"
                          }
                          size="sm"
                          className={
                            filters.sortBy === "students"
                              ? "bg-blue-600"
                              : "bg-blue-800 border-blue-700 text-blue-200"
                          }
                          onClick={() =>
                            setFilters({ ...filters, sortBy: "students" })
                          }>
                          Most Students
                        </Button>
                      </div>
                    </div>

                    <div className="flex justify-between pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-blue-800 border-blue-700 text-blue-200 hover:bg-blue-700"
                        onClick={() => {
                          setFilters({
                            status: "all",
                            priceRange: "all",
                            sortBy: "newest",
                          });
                        }}>
                        Reset
                      </Button>
                      <Button
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-500"
                        onClick={() => setIsFilterOpen(false)}>
                        Apply Filters
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
              onClick={toggle}>
              <PlusCircle size={18} />
              <span>Add New Course</span>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-blue-800 to-blue-700 text-white border-none shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl">Total Courses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-2">
                <div className="text-4xl font-bold">{courses.length}</div>
                <div className="text-blue-200 text-sm pb-1">courses</div>
              </div>
              <p className="text-blue-200 text-sm mt-2">
                {courses.filter((c) => c.Approved_by_admin).length} approved,{" "}
                {courses.filter((c) => !c.Approved_by_admin).length} pending
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-indigo-800 to-indigo-700 text-white border-none shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl">Total Students</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-2">
                <div className="text-4xl font-bold">
                  {courses.reduce(
                    (sum, course) =>
                      sum + (course.Students_enrolled?.length || 0),
                    0
                  )}
                </div>
                <div className="text-indigo-200 text-sm pb-1">students</div>
              </div>
              <p className="text-indigo-200 text-sm mt-2">
                Active across{" "}
                {
                  courses.filter((c) => (c.Students_enrolled?.length || 0) > 0)
                    .length
                }{" "}
                courses
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-800 to-purple-700 text-white border-none shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl">Total Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-2">
                <div className="text-4xl font-bold">
                  ₹
                  {courses
                    .reduce((sum, course) => {
                      return (
                        sum +
                        (course.Price || 0) *
                          (course.Students_enrolled?.length || 0)
                      );
                    }, 0)
                    .toFixed(2)}
                </div>
              </div>
              <p className="text-purple-200 text-sm mt-2">
                From{" "}
                {courses.reduce(
                  (sum, course) =>
                    sum + (course.Students_enrolled?.length || 0),
                  0
                )}{" "}
                enrollments
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="latest" className="mb-6">
          <TabsList className="grid w-full grid-cols-2 mb-6 bg-blue-900 border-none">
            <TabsTrigger
              value="latest"
              className="text-lg text-blue-300 data-[state=active]:bg-blue-800 data-[state=active]:text-white">
              Latest Courses
            </TabsTrigger>
            <TabsTrigger
              value="all"
              className="text-lg text-blue-300 data-[state=active]:bg-blue-800 data-[state=active]:text-white">
              All Courses
            </TabsTrigger>
          </TabsList>

          <div className="flex flex-wrap gap-2 mb-4">
            {searchTerm && (
              <Badge className="bg-blue-700 text-white px-3 py-1">
                Search: {searchTerm}
                <button
                  className="ml-2 hover:text-blue-200"
                  onClick={() => setSearchTerm("")}>
                  ×
                </button>
              </Badge>
            )}

            {filters.status !== "all" && (
              <Badge className="bg-blue-700 text-white px-3 py-1">
                Status:{" "}
                {filters.status === "approved"
                  ? "Approved"
                  : filters.status == "pending"
                  ? "Pending"
                  : "Rejected"}
                <button
                  className="ml-2 hover:text-blue-200"
                  onClick={() => setFilters({ ...filters, status: "all" })}>
                  ×
                </button>
              </Badge>
            )}

            {filters.priceRange !== "all" && (
              <Badge className="bg-blue-700 text-white px-3 py-1">
                Price:{" "}
                {filters.priceRange.charAt(0).toUpperCase() +
                  filters.priceRange.slice(1)}
                <button
                  className="ml-2 hover:text-blue-200"
                  onClick={() => setFilters({ ...filters, priceRange: "all" })}>
                  ×
                </button>
              </Badge>
            )}

            {(searchTerm ||
              filters.status !== "all" ||
              filters.priceRange !== "all") && (
              <Button
                variant="ghost"
                size="sm"
                className="text-blue-300 hover:text-white"
                onClick={() => {
                  setSearchTerm("");
                  setFilters({
                    status: "all",
                    priceRange: "all",
                    sortBy: filters.sortBy,
                  });
                }}>
                Clear All Filters
              </Button>
            )}

            <div className="ml-auto flex items-center gap-2">
              <span className="text-blue-300">Sort by:</span>
              <select
                className="bg-blue-800 border-blue-700 text-white rounded px-2 py-1"
                value={filters.sortBy}
                onChange={(e) =>
                  setFilters({ ...filters, sortBy: e.target.value as any })
                }>
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
                <option value="price-high">Price (High to Low)</option>
                <option value="price-low">Price (Low to High)</option>
                <option value="students">Most Students</option>
              </select>
            </div>
          </div>

          <TabsContent value="latest">
            {latestCourses.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {latestCourses.map((course) => (
                  <Card
                    key={course._id}
                    className="flex flex-col overflow-hidden hover:shadow-lg transition-shadow bg-blue-900 border-blue-800">
                    <div className="relative h-48 w-full">
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-700 to-blue-600 flex items-center justify-center">
                        {/* <BookOpen size={48} className="text-blue-300 opacity-70" /> */}
                        <Image
                          className="w-full h-full"
                          src={course.image || "/default.png"}
                          alt="images"
                          width={100}
                          height={100}
                        />
                      </div>
                      {course.Approved_by_admin == "approved" ? (
                        <Badge className="absolute top-2 right-2 bg-green-500">
                          Approved
                        </Badge>
                      ) : (
                        <Badge className="absolute top-2 right-2 bg-amber-500">
                          {course.Approved_by_admin}
                        </Badge>
                      )}
                    </div>
                    <CardHeader>
                      <CardTitle className="line-clamp-1 text-xl text-white">
                        {course.Title}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-1 text-blue-300">
                        <Clock size={16} />
                        {formatDate(course.CreatedAt)}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow">
                      <p className="line-clamp-2 text-blue-100 mb-2">
                        {course.Description}
                      </p>
                      <div className="flex items-center gap-4 mt-3">
                        <div className="flex items-center gap-2 text-sm text-blue-300">
                          <Users size={16} />
                          <span>{course.Students_enrolled?.length || 0}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-blue-300">
                          <BookOpen size={16} />
                          <span>{course.lessons?.length || 0}</span>
                        </div>
                        <div className="text-sm font-semibold text-blue-100">
                          ₹{course.Price?.toFixed(2) || "0.00"}
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="border-t border-blue-800 pt-4">
                      <Button
                        className="w-full bg-blue-700 hover:bg-blue-600 text-white"
                        onClick={() => handleEditCourse(course)}>
                        <Edit size={16} className="mr-2" /> Edit Course
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="bg-blue-900 border border-blue-800 rounded-lg p-8 text-center">
                <FileText size={48} className="mx-auto text-blue-500 mb-4" />
                <h3 className="text-xl font-medium text-white mb-2">
                  No courses found
                </h3>
                <p className="text-blue-300 mb-4">
                  Try adjusting your search or filter criteria
                </p>
                <Button
                  variant="outline"
                  className="bg-blue-800 border-blue-700 text-blue-200 hover:bg-blue-700"
                  onClick={() => {
                    setSearchTerm("");
                    setFilters({
                      status: "all",
                      priceRange: "all",
                      sortBy: "newest",
                    });
                  }}>
                  Reset All Filters
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="all">
            <Card className="bg-blue-900 border-blue-800 shadow-lg overflow-hidden">
              {filteredCourses.length > 0 ? (
                <Table>
                  <TableHeader className="bg-blue-800">
                    <TableRow className="border-blue-700 hover:bg-blue-800">
                      <TableHead className="font-semibold text-blue-100">
                        Course Title
                      </TableHead>
                      <TableHead className="font-semibold text-blue-100">
                        Category
                      </TableHead>
                      <TableHead className="font-semibold text-blue-100">
                        Created
                      </TableHead>
                      <TableHead className="font-semibold text-blue-100">
                        Students
                      </TableHead>
                      <TableHead className="font-semibold text-blue-100">
                        Price
                      </TableHead>
                      <TableHead className="font-semibold text-blue-100">
                        Status
                      </TableHead>
                      <TableHead className="font-semibold text-blue-100 text-right">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCourses.map((course) => (
                      <TableRow
                        key={course._id}
                        className="border-blue-800 hover:bg-blue-800">
                        <TableCell className="font-medium text-white">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded overflow-hidden bg-blue-700 flex items-center justify-center">
                              <BookOpen size={20} className="text-blue-300" />
                            </div>
                            <span className="line-clamp-1">{course.Title}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-blue-200">
                          {course.Category?.Category || "Uncategorized"}
                        </TableCell>
                        <TableCell className="text-blue-200">
                          {formatDate(course.CreatedAt)}
                        </TableCell>
                        <TableCell className="text-blue-200">
                          {course.Students_enrolled?.length || 0}
                        </TableCell>
                        <TableCell className="text-blue-200">
                          ₹{course.Price?.toFixed(2) || "0.00"}
                        </TableCell>
                        <TableCell>
                          {course.Approved_by_admin == "approved" ? (
                            <Badge className="bg-green-600 text-white">
                              Approved
                            </Badge>
                          ) : (
                            <Badge className="bg-amber-600 text-white">
                              {course.Approved_by_admin}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            className="bg-blue-700 hover:bg-blue-600 text-white"
                            onClick={() => handleEditCourse(course)}>
                            <Edit size={16} className="mr-1" /> Edit
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="bg-blue-900 border border-blue-800 rounded-lg p-8 text-center">
                  <FileText size={48} className="mx-auto text-blue-500 mb-4" />
                  <h3 className="text-xl font-medium text-white mb-2">
                    No courses found
                  </h3>
                  <p className="text-blue-300 mb-4">
                    Try adjusting your search or filter criteria
                  </p>
                  <Button
                    variant="outline"
                    className="bg-blue-800 border-blue-700 text-blue-200 hover:bg-blue-700"
                    onClick={() => {
                      setSearchTerm("");
                      setFilters({
                        status: "all",
                        priceRange: "all",
                        sortBy: "newest",
                      });
                    }}>
                    Reset All Filters
                  </Button>
                </div>
              )}
            </Card>
          </TabsContent>
        </Tabs>

        {/* Edit Course Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-blue-900 text-white border-blue-700">
            <DialogHeader>
              <DialogTitle className="text-2xl text-white">
                Edit Course
              </DialogTitle>
              <DialogDescription className="text-blue-300">
                Make changes to your course details below
              </DialogDescription>
            </DialogHeader>

            {selectedCourse && (
              <form onSubmit={handleSaveChanges}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="Title" className="text-white">
                        Course Title
                      </Label>
                      <Input
                        id="Title"
                        name="Title"
                        value={selectedCourse.Title || ""}
                        onChange={handleInputChange}
                        className="bg-blue-800 border-blue-700 text-white focus:border-blue-500"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="Description" className="text-white">
                        Description
                      </Label>
                      <Textarea
                        id="Description"
                        name="Description"
                        value={selectedCourse.Description || ""}
                        onChange={handleInputChange}
                        rows={4}
                        className="bg-blue-800 border-blue-700 text-white focus:border-blue-500"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="Price" className="text-white">
                        Price (₹)
                      </Label>
                      <Input
                        id="Price"
                        name="Price"
                        type="number"
                        value={selectedCourse.Price || ""}
                        onChange={handleInputChange}
                        className="bg-blue-800 border-blue-700 text-white focus:border-blue-500"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="Content" className="text-white">
                        Content
                      </Label>
                      <Textarea
                        id="Content"
                        name="Content"
                        value={selectedCourse.Content || ""}
                        onChange={handleInputChange}
                        rows={4}
                        className="bg-blue-800 border-blue-700 text-white focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="rounded-lg overflow-hidden border border-blue-700">
                      <div className="bg-blue-700 text-white p-3 font-medium flex items-center justify-between">
                        <span>Course Lessons</span>
                        <Badge className="bg-blue-900 text-blue-200">
                          {lessons.length}
                        </Badge>
                      </div>

                      <div className="divide-y divide-blue-700 max-h-96 overflow-y-auto bg-blue-800">
                        {lessons.length > 0 ? (
                          lessons.map((lesson, index) => (
                            <div
                              key={lesson._id}
                              className="p-3 hover:bg-blue-700 flex items-center justify-between text-white">
                              <div className="flex items-center gap-2">
                                <div className="bg-blue-900 text-blue-300 w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium">
                                  {index + 1}
                                </div>
                                <span className="line-clamp-1">
                                  {lesson.Lessone_name}
                                </span>
                              </div>
                              {/* Update the lesson item click handler in the lessons map function */}
                              <Button
                                onClick={(e) => {
                                  e.preventDefault();
                                  console.log(lesson, "the lesson with tasks");

                                  setSelectedLesson(lesson);
                                  setEditLessonDialog(true);
                                }}
                                variant="ghost"
                                size="sm"
                                className="text-blue-300 hover:text-white hover:bg-blue-600">
                                <Edit size={14} />
                              </Button>
                            </div>
                          ))
                        ) : (
                          <div className="p-4 text-center text-blue-400">
                            No lessons found for this course
                          </div>
                        )}
                      </div>
                      <div className="border-t border-blue-700 p-3 bg-blue-800 flex items-center justify-between">
                        <Button
                          type="button"
                          variant="outline"
                          className="text-blue-200 border-blue-600 hover:bg-blue-700 hover:text-white flex items-center gap-1"
                          onClick={() => {
                            // This would typically open a lesson creation dialog
                            setAddcurse(true);
                            console.log("Add lesson clicked");
                          }}>
                          <Plus size={16} />
                          <span>Add Lesson</span>
                        </Button>
                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            variant="ghost"
                            className="text-blue-300 hover:bg-blue-700"
                            onClick={() => setIsEditDialogOpen(false)}>
                            Cancel
                          </Button>
                          <Button
                            type="submit"
                            className="bg-blue-600 hover:bg-blue-500 text-white">
                            Save Changes
                          </Button>
                        </div>
                      </div>
                      {/* Course statistics and additional information */}
                      <div className="mt-6 rounded-lg border border-blue-700 overflow-hidden">
                        <div className="bg-blue-700 p-3 font-medium text-white">
                          Course Statistics
                        </div>
                        <div className="p-4 bg-blue-800 grid grid-cols-3 gap-4">
                          <div className="space-y-1">
                            <div className="text-blue-300 text-sm flex items-center gap-1">
                              <Users size={14} /> Students Enrolled
                            </div>
                            <div className="text-white text-lg font-medium">
                              {selectedCourse.Students_enrolled?.length || 0}
                            </div>
                          </div>
                          <div className="space-y-1">
                            <div className="text-blue-300 text-sm flex items-center gap-1">
                              <Calendar size={14} /> Created On
                            </div>
                            <div className="text-white text-lg font-medium">
                              {formatDate(selectedCourse.CreatedAt)}
                            </div>
                          </div>
                          <div className="space-y-1">
                            <div className="text-blue-300 text-sm flex items-center gap-1">
                              <Clock size={14} /> Last Updated
                            </div>
                            <div className="text-white text-lg font-medium">
                              {formatDate(selectedCourse.UpdatedAt)}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 flex justify-between items-center">
                        <Button
                          type="button"
                          variant="outline"
                          className="text-red-400 border-red-800 hover:bg-red-900 hover:text-red-200 flex items-center gap-1"
                          onClick={async () => {
                            // This would typically show a confirmation dialog
                            try {
                              setIsLoading(true);
                              await deleteCourse(selectedCourse._id);
                              console.log("Delete course clicked");
                              toast.success("deleted success", {
                                description: "success",
                              });
                              const idex = courses.findIndex(
                                (couse) => couse._id == selectedCourse._id
                              );
                              setCourses((prev) =>
                                prev.filter((_, i) => i !== idex)
                              );
                              setIsEditDialogOpen(false);
                            } catch (error) {
                              toast.error(error, {
                                description: "unExpeted Error",
                              });
                            }
                          }}>
                          <Trash2 size={16} />

                          <span>Delete Course</span>
                        </Button>

                        <div className="flex items-center gap-2">
                          <span className="text-blue-300 text-sm">
                            Course Status:
                          </span>
                          {selectedCourse.Approved_by_admin == "approved" ? (
                            <Badge className="bg-green-600 text-white flex items-center gap-1">
                              <CheckCircle size={12} /> Approved
                            </Badge>
                          ) : (
                            <Badge className="bg-amber-600 text-white">
                              {selectedCourse.Approved_by_admin == "pending"
                                ? " Pending Approval"
                                : selectedCourse.Approved_by_admin}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </form>
            )}
          </DialogContent>
        </Dialog>
      </div>
      {
        <AddLessonModal
          course={selectedCourse}
          isOpen={addCouseopen}
          onClose={() => {
            setAddcurse(false);
          }}
          onSave={async (newLesson,task) => {
            // In a real implementation, you would call an API to create the lesson
            console.log("Creating new lesson:", newLesson);
            if (selectedCourse && selectedCourse._id) {
              addnewLesson(newLesson, selectedCourse._id);
            }
            // Simulate creating a lesson with a temporary ID
            const tempLesson: ILesson = {
              ...newLesson,
              _id: `temp-${Date.now()}`, // In a real app, this would be returned from the API
            };

            // Add the new lesson to the lessons array
            setLessons([...lessons, tempLesson]);

            // Close the modal
            setAddcurse(false);

            // Show success message
            toast.success("Lesson created successfully", {
              description: "Your new lesson has been added to the course",
            });
          }}
        />
      }
      {selectedLesson && selectedCourse && (
        <EditLessonDialog
          isOpen={isLessonEditDialogOpen}
          onClose={() => setEditLessonDialog(false)}
          lesson={selectedLesson}
          course={selectedCourse}
          onSave={async (updatedLesson) => {
            // In a real implementation, you would call an API to save the lesson
            console.log("Saving updated lesson:", updatedLesson);

            // Update the lessons array with the updated lesson
            setLessons(
              lessons.map((l) =>
                l._id === updatedLesson._id ? updatedLesson : l
              )
            );

            // Close the dialog
            setEditLessonDialog(false);

            // Show success message
            toast.success("Lesson updated successfully", {
              description: "Your changes have been saved",
            });
          }}
        />
      )}
    </div>
  );
};
export default MentorDashboard;
